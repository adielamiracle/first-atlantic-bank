import { SupabaseClient } from '@supabase/supabase-js';

declare module './supabaseClient.js' {
  export const supabase: SupabaseClient;
}
