import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 전화번호를 한국 형식으로 포맷팅합니다.
 * @param phoneNumber 숫자만 포함된 전화번호 문자열 또는 이미 포맷팅된 번호
 * @returns 포맷팅된 전화번호 (예: 010-1234-5678)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // 숫자만 추출
  const numbers = phoneNumber.replace(/[^0-9]/g, '');
  
  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    // 010-1234
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 10) {
    // 010-123-4567 (10자리)
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length <= 11) {
    // 010-1234-5678 (11자리)
    if (numbers.startsWith('010') || numbers.startsWith('011') || 
        numbers.startsWith('016') || numbers.startsWith('017') || 
        numbers.startsWith('018') || numbers.startsWith('019')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    } else {
      // 지역번호 (02, 031 등)
      if (numbers.startsWith('02')) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
      }
    }
  } else {
    // 11자리 초과는 앞 11자리만 사용
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
}

/**
 * 전화번호에서 숫자만 추출합니다.
 * @param phoneNumber 포맷팅된 전화번호
 * @returns 숫자만 포함된 전화번호
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^0-9]/g, '');
}
