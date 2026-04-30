import { useState, useCallback, useEffect } from 'react';
import { RideService } from '../services/ride.service';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';

export function useRides() {
  const { user } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RideService.getActiveStations();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await RideService.getRideHistory(user.id);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching ride history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStations();
    fetchHistory();
  }, [fetchStations, fetchHistory]);

  const bookRide = async (bikeId: string, amount: number, destination: string) => {
    if (!user) throw new Error("Not authenticated");
    
    // Process payment atomically
    const result = await RideService.processRidePayment(user.id, bikeId, amount, destination);
    
    // Refresh history
    fetchHistory();
    
    return result;
  };

  const getActivationCode = async (rideId: string) => {
    return RideService.getRideActivationCode(rideId);
  };

  const useCode = async (codeId: string) => {
    const result = await RideService.useActivationCode(codeId);
    return result;
  };

  const endRide = async (rideId: string, endStationId: string, distance: number) => {
    const result = await RideService.completeRide(rideId, endStationId, distance);
    fetchHistory();
    return result;
  };

  const refreshHistory = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return { 
    stations, 
    history, 
    loading, 
    refreshing, 
    fetchStations, 
    refreshHistory, 
    bookRide,
    getActivationCode,
    useCode,
    endRide
  };
}
