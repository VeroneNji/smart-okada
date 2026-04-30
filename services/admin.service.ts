import { supabase } from './supabase';

// Use a type-flexible client for admin operations to avoid stale TS errors
const adminClient = supabase as any;

export const AdminService = {
  async getStats() {
    try {
      const results: any[] = await Promise.all([
        adminClient.from('profiles').select('*', { count: 'exact', head: true }),
        adminClient.from('bikes').select('*', { count: 'exact', head: true }),
        adminClient.from('bike_stations').select('*', { count: 'exact', head: true }),
        adminClient.from('rides').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        adminClient.from('wallet_transactions').select('amount').eq('type', 'payment')
      ]);

      const totalUsers = results[0]?.count || 0;
      const totalBikes = results[1]?.count || 0;
      const totalStations = results[2]?.count || 0;
      const activeRides = results[3]?.count || 0;
      const revenueData = results[4]?.data || [];

      const totalRevenue = revenueData.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

      return {
        totalUsers,
        totalBikes,
        totalStations,
        activeRides,
        totalRevenue
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalUsers: 0,
        totalBikes: 0,
        totalStations: 0,
        activeRides: 0,
        totalRevenue: 0
      };
    }
  },

  async getAllUsers() {
    const { data, error } = await adminClient
      .from('profiles')
      .select(`
        *,
        wallets(balance)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllBikes() {
    const { data, error } = await adminClient
      .from('bikes')
      .select(`
        *,
        bike_stations(name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((bike: any) => ({
      ...bike,
      station: bike.bike_stations
    }));
  },

  async getAllStations() {
    const { data, error } = await adminClient
      .from('bike_stations')
      .select(`
        *,
        bikes(id)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllRides() {
    const { data, error } = await adminClient
      .from('rides')
      .select(`
        *,
        profiles(full_name, email),
        bikes(code)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map((ride: any) => ({
      ...ride,
      user: ride.profiles,
      bike: ride.bikes
    }));
  },

  async getAllWallets() {
    const { data, error } = await adminClient
      .from('wallets')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('balance', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((wallet: any) => ({
      ...wallet,
      user: wallet.profiles
    }));
  },

  async getAllActivationCodes() {
    const { data, error } = await adminClient
      .from('activation_codes')
      .select(`
        *,
        rides(
          id,
          profiles(full_name),
          bikes(code)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((code: any) => ({
      ...code,
      ride: code.rides ? {
        ...code.rides,
        user: code.rides.profiles,
        bike: code.rides.bikes
      } : null
    }));
  },

  // Mutations
  async updateBikeStatus(bikeId: string, status: string) {
    const dbStatus = status === 'booked' ? 'in_use' : status;
    const { error } = await adminClient
      .from('bikes')
      .update({ status: dbStatus })
      .eq('id', bikeId);
    if (error) throw error;
  },

  async deleteBike(bikeId: string) {
    const { error } = await adminClient.from('bikes').delete().eq('id', bikeId);
    if (error) throw error;
  },

  async addBike(code: string, stationId: string, price: number, imageUrl?: string) {
    const { error } = await adminClient.from('bikes').insert({
      code,
      station_id: stationId,
      price_per_minute: price,
      image_url: imageUrl,
      status: 'available'
    });
    if (error) throw error;
  },

  async addStation(name: string, location: string) {
    const { error } = await adminClient.from('bike_stations').insert({
      name,
      location_description: location
    });
    if (error) throw error;
  },

  async updateBike(bikeId: string, updates: any) {
    const { error } = await adminClient
      .from('bikes')
      .update(updates)
      .eq('id', bikeId);
    if (error) throw error;
  },

  async deleteUser(userId: string) {
    const { error } = await adminClient.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },

  async deleteStation(stationId: string) {
    const { error } = await adminClient.from('bike_stations').delete().eq('id', stationId);
    if (error) throw error;
  },

  async toggleAdmin(userId: string, isAdmin: boolean) {
    const { error } = await adminClient
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateStation(stationId: string, name: string, location: string) {
    const { error } = await adminClient
      .from('bike_stations')
      .update({ 
        name, 
        location_description: location 
      })
      .eq('id', stationId);
    if (error) throw error;
  }
};
