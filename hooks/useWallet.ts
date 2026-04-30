import { useState, useCallback, useEffect } from 'react';
import { WalletService } from '../services/wallet.service';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const walletData: any = await WalletService.getWallet(user.id);
      setWallet(walletData);
      
      if (walletData && walletData.id) {
        const txData = await WalletService.getTransactions(walletData.id);
        setTransactions(txData);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWalletData();

    // Subscribe to wallet changes
    if (user) {
      const channel = supabase
        .channel(`wallet_updates_${user.id}_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
          () => fetchWalletData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchWalletData, user]);

  const deposit = async (amount: number, reference: string) => {
    if (!user) throw new Error("Not authenticated");
    return WalletService.depositFunds(user.id, amount, reference);
  };

  const refresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  return { wallet, transactions, loading, refreshing, refresh, deposit };
}
