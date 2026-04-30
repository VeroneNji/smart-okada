-- ==========================================
-- SEED DATA FOR SMART OKADA (YAOUNDÉ) - CAMEROON VIBES
-- ==========================================

-- 1. Insert 10 Yaoundé Stations
INSERT INTO public.bike_stations (name, location_description, is_active)
SELECT name, loc, true
FROM (
  VALUES 
    ('Simbock Station', 'Near the Simbock junction, route to Ahala'),
    ('Damas Junction', 'Entrance to Damas neighborhood, near the pharmacy'),
    ('Jouvance Market', 'Opposite the Jouvance traditional market'),
    ('Mendong Station', 'Mendong camp, near the police station'),
    ('Biyem-Assi', 'Acacia Junction, near the total station'),
    ('Etoudi Carrefour', 'Close to the Presidential Palace entrance'),
    ('Mokolo Market', 'Inside the main Mokolo market area'),
    ('Mvan Terminal', 'Inter-city bus terminal area'),
    ('Bastos Square', 'Bastos neighborhood, near embassies'),
    ('Post Central', 'City Center, near the main post office')
) AS t(name, loc)
WHERE NOT EXISTS (
    SELECT 1 FROM public.bike_stations WHERE public.bike_stations.name = t.name
);

-- 2. Insert Moto-Taxi / Bend-skin style Bikes (Honda, Yamaha, TVS style)

-- Simbock
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-SB-01', 'available', id, 10.00, 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Simbock Station' ON CONFLICT (code) DO NOTHING;

-- Damas
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-DM-01', 'available', id, 10.00, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Damas Junction' ON CONFLICT (code) DO NOTHING;

-- Jouvance
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-JV-01', 'available', id, 12.00, 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Jouvance Market' ON CONFLICT (code) DO NOTHING;

-- Mendong
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-MD-01', 'available', id, 10.00, 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Mendong Station' ON CONFLICT (code) DO NOTHING;

-- Biyem-Assi
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-BA-01', 'available', id, 15.00, 'https://images.unsplash.com/photo-1558389186-438424b00a32?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Biyem-Assi' ON CONFLICT (code) DO NOTHING;

-- Etoudi
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-ET-01', 'available', id, 20.00, 'https://images.unsplash.com/photo-1595064063477-40e1189bc96d?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Etoudi Carrefour' ON CONFLICT (code) DO NOTHING;

-- Mokolo
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-MK-01', 'available', id, 10.00, 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Mokolo Market' ON CONFLICT (code) DO NOTHING;

-- Mvan
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-MV-01', 'available', id, 12.00, 'https://images.unsplash.com/photo-1449491026613-524df94917d6?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Mvan Terminal' ON CONFLICT (code) DO NOTHING;

-- Bastos
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-BS-01', 'available', id, 25.00, 'https://images.unsplash.com/photo-1502744688674-c619d6586c9e?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Bastos Square' ON CONFLICT (code) DO NOTHING;

-- Post Central
INSERT INTO public.bikes (code, status, station_id, price_per_minute, image_url)
SELECT 'OK-PC-01', 'available', id, 15.00, 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400'
FROM public.bike_stations WHERE name = 'Post Central' ON CONFLICT (code) DO NOTHING;
