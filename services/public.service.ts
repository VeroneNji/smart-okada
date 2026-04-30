import { supabase } from './supabase';

export const PublicService = {
  async getSystemStats() {
    try {
      const { data, error } = await supabase.rpc('get_public_stats');
      if (error) {
        console.warn('RPC failed, falling back to manual count:', error);
        // Fallback if RPC is not yet deployed
        const [
          { count: bikes },
          { count: stations }
        ] = await Promise.all([
          supabase.from('bikes').select('*', { count: 'exact', head: true }),
          supabase.from('bike_stations').select('*', { count: 'exact', head: true })
        ]);
        
        return {
          users: 1200, // Static fallback for users if RLS blocks
          bikes: bikes || 0,
          stations: stations || 0
        };
      }
    } catch (e) {
      console.error('Error fetching public stats:', e);
    }
    
    // Return randomized "few" stats as requested by user
    return { 
      users: Math.floor(Math.random() * 50) + 120, // 120-170 Riders
      bikes: Math.floor(Math.random() * 15) + 35,  // 35-50 Bikes
      stations: Math.floor(Math.random() * 5) + 8   // 8-13 Stations
    };
  }
};
