-- ==========================================
-- NOTIFICATIONS SYSTEM
-- ==========================================

-- 1. Table definition
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'deposit', 'ride_start', 'ride_end', 'system'
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Update existing RPCs to create notifications

-- Update deposit_funds
CREATE OR REPLACE FUNCTION public.deposit_funds(
  p_user_id UUID,
  p_amount DECIMAL,
  p_reference VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_wallet_id UUID;
  v_new_balance DECIMAL;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deposit amount must be greater than zero';
  END IF;

  SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;

  UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_wallet_id RETURNING balance INTO v_new_balance;

  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, description)
  VALUES (v_wallet_id, p_amount, 'deposit', p_reference, 'Wallet funding via ' || p_reference);

  -- ADD NOTIFICATION
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Deposit Successful', 'You have successfully deposited ' || p_amount || ' FCFA into your wallet.', 'deposit');

  RETURN json_build_object('success', true, 'new_balance', v_new_balance)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update process_ride_payment
CREATE OR REPLACE FUNCTION public.process_ride_payment(
  p_user_id UUID,
  p_bike_id UUID,
  p_amount DECIMAL,
  p_destination TEXT
) RETURNS JSONB AS $$
DECLARE
  v_wallet_id UUID;
  v_balance DECIMAL;
  v_station_id UUID;
  v_ride_id UUID;
  v_activation_code VARCHAR(6);
BEGIN
  SELECT id, balance INTO v_wallet_id, v_balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found for user'; END IF;
  IF v_balance < p_amount THEN RAISE EXCEPTION 'Insufficient funds'; END IF;

  SELECT station_id INTO v_station_id FROM public.bikes WHERE id = p_bike_id AND status = 'available' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bike is not available'; END IF;

  UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_wallet_id;
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
  VALUES (v_wallet_id, p_amount, 'payment', 'Payment for ride to ' || p_destination);

  INSERT INTO public.rides (user_id, bike_id, start_station_id, destination, price, status)
  VALUES (p_user_id, p_bike_id, v_station_id, p_destination, p_amount, 'active')
  RETURNING id INTO v_ride_id;

  UPDATE public.bikes SET status = 'in_use' WHERE id = p_bike_id;
  v_activation_code := lpad(floor(random() * 1000000)::text, 6, '0');
  INSERT INTO public.activation_codes (ride_id, code, expires_at)
  VALUES (v_ride_id, v_activation_code, now() + interval '15 minutes');

  -- ADD NOTIFICATION
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Ride Started', 'Your ride to ' || p_destination || ' has started. Activation code: ' || v_activation_code, 'ride_start');

  RETURN json_build_object('success', true, 'ride_id', v_ride_id, 'activation_code', v_activation_code, 'new_balance', v_balance - p_amount)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update complete_ride
CREATE OR REPLACE FUNCTION public.complete_ride(
  p_ride_id UUID,
  p_end_station_id UUID,
  p_distance DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_bike_id UUID;
  v_user_id UUID;
  v_station_name VARCHAR;
BEGIN
  SELECT bike_id, user_id INTO v_bike_id, v_user_id FROM public.rides WHERE id = p_ride_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active ride not found'; END IF;
  -- Ownership check is usually handled by auth context in app, but for RPC:
  -- IF v_user_id != auth.uid() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  UPDATE public.rides SET status = 'completed', end_time = now(), end_station_id = p_end_station_id, distance = p_distance WHERE id = p_ride_id;
  UPDATE public.bikes SET status = 'available', station_id = p_end_station_id WHERE id = v_bike_id;

  SELECT name INTO v_station_name FROM public.bike_stations WHERE id = p_end_station_id;

  -- ADD NOTIFICATION
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_user_id, 'Ride Completed', 'You have arrived at ' || COALESCE(v_station_name, 'your destination') || '. Distance: ' || p_distance || 'km.', 'ride_end');

  RETURN json_build_object('success', true, 'ride_id', p_ride_id, 'status', 'completed')::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
