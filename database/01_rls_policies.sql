-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- ADMIN HELPER FUNCTION
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'veronenji2023@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- PROFILES
-- -----------------------------------------------------
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile (name, phone)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- No INSERT or DELETE policies for profiles (handled by Auth Trigger)

-- -----------------------------------------------------
-- WALLETS
-- -----------------------------------------------------
-- Users can view their own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" 
ON public.wallets FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update wallets" ON public.wallets;
CREATE POLICY "Admins can update wallets"
ON public.wallets FOR UPDATE
USING (public.is_admin());

-- No INSERT, UPDATE, or DELETE policies for wallets 
-- (Modifications MUST happen via secure RPC functions: process_ride_payment, deposit_funds)

-- -----------------------------------------------------
-- WALLET TRANSACTIONS
-- -----------------------------------------------------
-- Users can view their own transactions (joined through wallets)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" 
ON public.wallet_transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = wallet_transactions.wallet_id 
    AND wallets.user_id = auth.uid()
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can manage transactions"
ON public.wallet_transactions FOR ALL
USING (public.is_admin());

-- No INSERT, UPDATE, or DELETE policies
-- (Handled by RPCs only)

-- -----------------------------------------------------
-- BIKE STATIONS
-- -----------------------------------------------------
-- Anyone authenticated can view active stations
DROP POLICY IF EXISTS "Authenticated users can view active stations" ON public.bike_stations;
CREATE POLICY "Authenticated users can view active stations" 
ON public.bike_stations FOR SELECT 
TO authenticated
USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage stations" ON public.bike_stations;
CREATE POLICY "Admins can manage stations"
ON public.bike_stations FOR ALL
USING (public.is_admin());

-- -----------------------------------------------------
-- BIKES
-- -----------------------------------------------------
-- Anyone authenticated can view bikes
DROP POLICY IF EXISTS "Authenticated users can view bikes" ON public.bikes;
CREATE POLICY "Authenticated users can view bikes" 
ON public.bikes FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage bikes" ON public.bikes;
CREATE POLICY "Admins can manage bikes"
ON public.bikes FOR ALL
USING (public.is_admin());

-- -----------------------------------------------------
-- RIDES
-- -----------------------------------------------------
-- Users can view their own rides
DROP POLICY IF EXISTS "Users can view own rides" ON public.rides;
CREATE POLICY "Users can view own rides" 
ON public.rides FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

-- Users can update the status of their own active rides (e.g., to 'completed' or 'cancelled')
DROP POLICY IF EXISTS "Users can update own active rides" ON public.rides;
CREATE POLICY "Users can update own active rides" 
ON public.rides FOR UPDATE 
USING (auth.uid() = user_id);

-- INSERT is handled by the `process_ride_payment` RPC to ensure consistency.

-- -----------------------------------------------------
-- ACTIVATION CODES
-- -----------------------------------------------------
-- Users can view activation codes for their own rides
DROP POLICY IF EXISTS "Users can view own activation codes" ON public.activation_codes;
CREATE POLICY "Users can view own activation codes" 
ON public.activation_codes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rides 
    WHERE rides.id = activation_codes.ride_id 
    AND rides.user_id = auth.uid()
  )
);

-- Users can update the `is_used` status
DROP POLICY IF EXISTS "Users can mark activation codes as used" ON public.activation_codes;
CREATE POLICY "Users can mark activation codes as used" 
ON public.activation_codes FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.rides 
    WHERE rides.id = activation_codes.ride_id 
    AND rides.user_id = auth.uid()
  )
);

-- -----------------------------------------------------
-- GRANT & REVOKE PERMISSIONS (HARDENING)
-- -----------------------------------------------------

-- 1. Revoke default access to the public role
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- 2. Grant SELECT access to authenticated users for all tables (Reads)
GRANT SELECT ON public.profiles, public.wallets, public.wallet_transactions, public.bike_stations, public.bikes, public.rides, public.activation_codes TO authenticated;

-- 3. No direct UPDATE access for authenticated users on sensitive tables
-- (All mutations happen via RPC for validation and atomicity)

-- 4. Explicitly DENY all direct mutations on sensitive tables
REVOKE INSERT, UPDATE, DELETE ON public.wallets, public.wallet_transactions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.rides FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.activation_codes FROM authenticated;

-- 5. Grant EXECUTE permissions for RPC functions
GRANT EXECUTE ON FUNCTION public.process_ride_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.deposit_funds TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_ride TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_activation_code TO authenticated;

-- 6. Ensure service_role has full access for admin/maintenance
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

