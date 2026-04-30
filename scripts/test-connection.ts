/**
 * This script can be run to verify your Supabase connection and schema health.
 * Usage: npx ts-node scripts/test-connection.ts
 */

import { supabase } from '../services/supabase';

async function testConnection() {
  console.log('🚀 Starting connection test...');

  try {
    // 1. Test Connection & Auth Settings
    const { data: authConfig, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth Connection Failed:', authError.message);
    } else {
      console.log('✅ Auth Connection: OK');
    }

    // 2. Test Public Tables (Stations)
    const { data: stations, error: stationError } = await supabase
      .from('bike_stations')
      .select('count')
      .limit(1);
      
    if (stationError) {
      console.error('❌ Database Access Failed:', stationError.message);
      console.log('💡 Tip: Ensure you have run the database/00_initial_schema.sql script.');
    } else {
      console.log('✅ Database Access (bike_stations): OK');
    }

    // 3. Test RPC existence
    const { error: rpcError } = await (supabase.rpc as any)('process_ride_payment', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_bike_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 0,
      p_destination: 'test'
    });

    // We expect a "User not found" or similar error, but not a "function not found" error
    if (rpcError && rpcError.message.includes('function')) {
      console.error('❌ RPC Function Missing:', rpcError.message);
    } else {
      console.log('✅ RPC Function (process_ride_payment): Detected');
    }

    console.log('\n✨ Test Complete. If all "OK", your system is ready!');
  } catch (e: any) {
    console.error('💥 Unexpected Error:', e.message);
  }
}

testConnection();
