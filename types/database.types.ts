export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activation_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          ride_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          ride_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          ride_id?: string
        }
      }
      bike_stations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          name?: string
        }
      }
      bikes: {
        Row: {
          code: string
          created_at: string
          id: string
          image_url: string | null
          price_per_minute: number
          station_id: string | null
          status: 'available' | 'in_use' | 'maintenance'
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          image_url?: string | null
          price_per_minute: number
          station_id?: string | null
          status?: 'available' | 'in_use' | 'maintenance'
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          image_url?: string | null
          price_per_minute?: number
          station_id?: string | null
          status?: 'available' | 'in_use' | 'maintenance'
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
      }
      rides: {
        Row: {
          bike_id: string
          created_at: string
          destination: string
          distance: number | null
          end_station_id: string | null
          end_time: string | null
          id: string
          price: number
          start_station_id: string | null
          start_time: string | null
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          user_id: string
        }
        Insert: {
          bike_id: string
          created_at?: string
          destination: string
          distance?: number | null
          end_station_id?: string | null
          end_time?: string | null
          id?: string
          price: number
          start_station_id?: string | null
          start_time?: string | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          user_id: string
        }
        Update: {
          bike_id?: string
          created_at?: string
          destination?: string
          distance?: number | null
          end_station_id?: string | null
          end_time?: string | null
          id?: string
          price?: number
          start_station_id?: string | null
          start_time?: string | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          user_id?: string
        }
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference: string | null
          type: 'deposit' | 'payment' | 'refund'
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference?: string | null
          type: 'deposit' | 'payment' | 'refund'
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference?: string | null
          type?: 'deposit' | 'payment' | 'refund'
          wallet_id?: string
        }
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deposit_funds: {
        Args: {
          p_user_id: string
          p_amount: number
          p_reference: string
        }
        Returns: Json
      }
      process_ride_payment: {
        Args: {
          p_user_id: string
          p_bike_id: string
          p_amount: number
          p_destination: string
        }
        Returns: Json
      }
      complete_ride: {
        Args: {
          p_ride_id: string
          p_end_station_id: string
          p_distance: number
        }
        Returns: Json
      }
      use_activation_code: {
        Args: {
          p_code_id: string
        }
        Returns: Json
      }
      get_public_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      bike_status: 'available' | 'in_use' | 'maintenance'
      ride_status: 'pending' | 'active' | 'completed' | 'cancelled'
      transaction_type: 'deposit' | 'payment' | 'refund'
    }
  }
}
