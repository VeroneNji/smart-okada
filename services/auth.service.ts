import { supabase } from './supabase';
import * as Linking from 'expo-linking';

const AUTH_TIMEOUT = 15000; // 15 seconds

const withTimeout = <T>(promise: Promise<T> | PromiseLike<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out. Please check your internet connection.')), timeoutMs)
    )
  ]);
};

export const AuthService = {
  async signUp(email: string, password: string, fullName: string, phone: string) {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: Linking.createURL('/(auth)/login'),
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      }),
      AUTH_TIMEOUT
    );
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
      AUTH_TIMEOUT
    );
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await withTimeout(supabase.auth.signOut(), AUTH_TIMEOUT);
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await withTimeout(supabase.auth.getSession(), AUTH_TIMEOUT);
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId: string) {
    const response = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      AUTH_TIMEOUT
    );
      
    if (response.error) throw response.error;
    return response.data;
  }
};
