import { supabase } from './supabase';

export const BikeService = {
  async getAvailableBikes() {
    const { data, error } = await supabase
      .from('bikes')
      .select(`
        *,
        station:bike_stations(name, location_description)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getBikeById(id: string) {
    const { data, error } = await supabase
      .from('bikes')
      .select(`
        *,
        station:bike_stations(name, location_description)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};
