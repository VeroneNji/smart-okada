-- ==========================================
-- SMART OKADA RENTAL SYSTEM SCHEMA
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallet Transactions
CREATE TYPE transaction_type AS ENUM ('deposit', 'payment', 'refund');

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type transaction_type NOT NULL,
  reference VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bike Stations
CREATE TABLE IF NOT EXISTS public.bike_stations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bikes
CREATE TYPE bike_status AS ENUM ('available', 'in_use', 'maintenance');

CREATE TABLE IF NOT EXISTS public.bikes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  station_id UUID REFERENCES public.bike_stations(id) ON DELETE SET NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  status bike_status DEFAULT 'available' NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rides
CREATE TYPE ride_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.rides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes(id) ON DELETE CASCADE,
  start_station_id UUID REFERENCES public.bike_stations(id) ON DELETE SET NULL,
  end_station_id UUID REFERENCES public.bike_stations(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  end_time TIMESTAMP WITH TIME ZONE,
  destination TEXT NOT NULL,
  distance DECIMAL(10, 2),
  price DECIMAL(12, 2) NOT NULL,
  status ride_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation Codes
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE UNIQUE,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRIGGERS & FUNCTIONS

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bikes_updated_at BEFORE UPDATE ON public.bikes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile and wallet on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  
  -- Insert into wallets
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0.00);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Atomic RPC: Process Ride Payment
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
  -- 1. Get and Lock Wallet
  SELECT id, balance INTO v_wallet_id, v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user';
  END IF;

  -- 2. Check Balance
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds. Balance: %, Required: %', v_balance, p_amount;
  END IF;

  -- 3. Check Bike Availability and get Station
  SELECT station_id INTO v_station_id
  FROM public.bikes
  WHERE id = p_bike_id AND status = 'available'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bike is not available';
  END IF;

  -- 4. Deduct Funds
  UPDATE public.wallets
  SET balance = balance - p_amount
  WHERE id = v_wallet_id;

  -- 5. Record Transaction
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
  VALUES (v_wallet_id, p_amount, 'payment', 'Payment for ride to ' || p_destination);

  -- 6. Create Ride
  INSERT INTO public.rides (user_id, bike_id, start_station_id, destination, price, status)
  VALUES (p_user_id, p_bike_id, v_station_id, p_destination, p_amount, 'active')
  RETURNING id INTO v_ride_id;

  -- 7. Update Bike Status
  UPDATE public.bikes
  SET status = 'in_use'
  WHERE id = p_bike_id;

  -- 8. Generate Activation Code
  -- Generate a random 6-digit code
  v_activation_code := lpad(floor(random() * 1000000)::text, 6, '0');
  
  INSERT INTO public.activation_codes (ride_id, code, expires_at)
  VALUES (v_ride_id, v_activation_code, now() + interval '15 minutes');

  -- 9. Return Success
  RETURN json_build_object(
    'success', true,
    'ride_id', v_ride_id,
    'activation_code', v_activation_code,
    'new_balance', v_balance - p_amount
  )::JSONB;
  
EXCEPTION WHEN OTHERS THEN
  -- All changes are automatically rolled back
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Atomic RPC: Deposit Funds
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

  -- Get and lock wallet
  SELECT id INTO v_wallet_id
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Update balance
  UPDATE public.wallets
  SET balance = balance + p_amount
  WHERE id = v_wallet_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO public.wallet_transactions (wallet_id, amount, type, reference, description)
  VALUES (v_wallet_id, p_amount, 'deposit', p_reference, 'Wallet funding via ' || p_reference);

  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance
  )::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic RPC: Complete Ride
CREATE OR REPLACE FUNCTION public.complete_ride(
  p_ride_id UUID,
  p_end_station_id UUID,
  p_distance DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_bike_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Get and Lock Ride
  SELECT bike_id, user_id INTO v_bike_id, v_user_id
  FROM public.rides
  WHERE id = p_ride_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active ride not found';
  END IF;

  -- 2. Check if user owns the ride
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 3. Update Ride
  UPDATE public.rides
  SET 
    status = 'completed',
    end_time = now(),
    end_station_id = p_end_station_id,
    distance = p_distance
  WHERE id = p_ride_id;

  -- 4. Update Bike Status and Station
  UPDATE public.bikes
  SET 
    status = 'available',
    station_id = p_end_station_id
  WHERE id = v_bike_id;

  RETURN json_build_object(
    'success', true,
    'ride_id', p_ride_id,
    'status', 'completed'
  )::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic RPC: Use Activation Code
CREATE OR REPLACE FUNCTION public.use_activation_code(
  p_code_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_ride_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Get and Lock Code
  SELECT ride_id INTO v_ride_id
  FROM public.activation_codes
  WHERE id = p_code_id AND is_used = FALSE AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code is invalid, used, or expired';
  END IF;

  -- 2. Verify Ownership via Ride
  SELECT user_id INTO v_user_id
  FROM public.rides
  WHERE id = v_ride_id;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 3. Mark as Used
  UPDATE public.activation_codes
  SET is_used = TRUE
  WHERE id = p_code_id;

  RETURN json_build_object(
    'success', true,
    'code_id', p_code_id
  )::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

