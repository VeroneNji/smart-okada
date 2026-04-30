import { supabase } from './supabase';

export const WalletService = {
  async getWallet(userId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  },

  async getTransactions(walletId: string) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async depositFunds(userId: string, amount: number, reference: string) {
    const { data, error } = await (supabase.rpc as any)('deposit_funds', {
      p_user_id: userId,
      p_amount: amount,
      p_reference: reference
    });
    
    if (error) throw error;
    return data;
  }
};
