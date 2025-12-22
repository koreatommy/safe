import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function extractProjectId(url: string): string | null {
  try {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
    console.warn('Supabase environment variables are not set. Using placeholder values.');
  } else {
    // 개발 환경에서 프로젝트 정보 출력
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const projectId = extractProjectId(supabaseUrl);
      console.log('[Supabase] 프로젝트 URL:', supabaseUrl);
      console.log('[Supabase] 프로젝트 ID:', projectId || '추출 실패');
      console.log('[Supabase] Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
    }
    
    // 프로젝트 URL 형식 검증
    if (!supabaseUrl.includes('.supabase.co')) {
      console.error('[Supabase] 잘못된 프로젝트 URL 형식:', supabaseUrl);
      console.error('[Supabase] 올바른 형식: https://[project-id].supabase.co');
    }
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

// 프로젝트 ID 추출 헬퍼 함수 (외부에서 사용 가능)
export function getSupabaseProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return extractProjectId(supabaseUrl);
}

