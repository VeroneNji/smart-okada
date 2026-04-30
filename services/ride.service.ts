import { supabase } from './supabase';

export const RideService = {
  async getActiveStations() {
    const { data, error } = await supabase
      .from('bike_stations')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    return data;
  },

  async getAvailableBikes(stationId: string) {
    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('station_id', stationId)
      .eq('status', 'available');
      
    if (error) throw error;
    return data;
  },

  async processRidePayment(userId: string, bikeId: string, amount: number, destination: string) {
    const { data, error } = await (supabase.rpc as any)('process_ride_payment', {
      p_user_id: userId,
      p_bike_id: bikeId,
      p_amount: amount,
      p_destination: destination
    });
    
    if (error) throw error;
    return data;
  },

  async getRideHistory(userId: string) {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        bike:bikes(*),
        start_station:bike_stations!rides_start_station_id_fkey(*),
        end_station:bike_stations!rides_end_station_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  async getRideActivationCode(rideId: string) {
    const { data, error } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('ride_id', rideId)
      .single();
      
    if (error) throw error;
    return data;
  },

  async completeRide(rideId: string, endStationId: string, distance: number) {
    const { data, error } = await (supabase.rpc as any)('complete_ride', {
      p_ride_id: rideId,
      p_end_station_id: endStationId,
      p_distance: distance
    });
    
    if (error) throw error;
    return data;
  },

  async useActivationCode(codeId: string) {
    const { data, error } = await (supabase.rpc as any)('use_activation_code', {
      p_code_id: codeId
    });
    
    if (error) throw error;
    return data;
  }
};
