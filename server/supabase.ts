import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseKey.includes('YOUR_SUPABASE')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials not found or unconfigured in .env. Falling back to in-memory store. Set SUPABASE_URL and SUPABASE_ANON_KEY to connect live database.'
  );
} else {
  console.log(`✅ Supabase client initialized connected to: ${supabaseUrl}`);
}
