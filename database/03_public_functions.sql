-- Function to get public statistics for the landing page
-- This uses SECURITY DEFINER to bypass RLS for counts
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSONB AS $$
DECLARE
  v_users INTEGER;
  v_bikes INTEGER;
  v_stations INTEGER;
BEGIN
  SELECT count(*) INTO v_users FROM public.profiles;
  SELECT count(*) INTO v_bikes FROM public.bikes;
  SELECT count(*) INTO v_stations FROM public.bike_stations;
  
  RETURN json_build_object(
    'users', v_users,
    'bikes', v_bikes,
    'stations', v_stations
  )::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO authenticated;
