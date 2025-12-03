import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 더미 클라이언트 반환 (빌드 타임)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are not set');
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : createClient('https://placeholder.supabase.co', 'placeholder-key');

