import { SupabaseClient } from '@supabase/supabase-js';

export const supabase: any;
export const isSupabaseConfigured: boolean;
export function safeSupabaseOp<T>(opPromise: Promise<T>, timeoutMs?: number, fallbackVal?: T): Promise<T | undefined>;
export function ensureDemoUsersInSupabase(): Promise<void>;

declare module './supabaseClient.js' {
  export const supabase: any;
  export const isSupabaseConfigured: boolean;
  export function safeSupabaseOp<T>(opPromise: Promise<T>, timeoutMs?: number, fallbackVal?: T): Promise<T | undefined>;
  export function ensureDemoUsersInSupabase(): Promise<void>;
}
