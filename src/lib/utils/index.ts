import { clsx, type ClassValue } from 'clsx';

/**
 * Tailwind CSS 클래스를 조합하는 유틸리티 함수
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 이메일 주소 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검사
 */
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('최소 8자 이상이어야 합니다');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('소문자를 포함해야 합니다');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('대문자를 포함해야 합니다');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('숫자를 포함해야 합니다');
  } else {
    score += 1;
  }

  return {
    score,
    feedback,
    isValid: score >= 3 && password.length >= 8,
  };
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 랜덤 ID 생성
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 