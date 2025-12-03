import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
    console.warn('Supabase environment variables are not set. Using placeholder values.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 매번 새 클라이언트 반환 (빌드 타임)
    return createSupabaseClient();
  }

  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// 클라이언트 사이드에서만 실제 클라이언트 사용, 서버 사이드에서는 더미 클라이언트
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient() 
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

