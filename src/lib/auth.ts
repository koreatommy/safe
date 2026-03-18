// NOTE:
// - 기존에 소스에 하드코딩되어 있던 관리자 비밀번호를 제거했습니다.
// - `NEXT_PUBLIC_` 환경변수는 클라이언트 번들에 노출될 수 있으므로,
//   보안 수준을 높이려면(권장) 서버사이드 인증/세션 기반으로 재설계해야 합니다.
// - 현재는 "하드코딩 제거"와 "설정 가능"을 목표로 최소 변경으로 적용합니다.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';
const AUTH_KEY = 'admin_auth';

export function login(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  if (password === ADMIN_PASSWORD) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, 'authenticated');
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(AUTH_KEY) === 'authenticated';
}

