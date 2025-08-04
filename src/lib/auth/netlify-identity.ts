// @ts-ignore - netlify-identity-widget doesn't have proper types
import netlifyIdentity from 'netlify-identity-widget';
import type { NetlifyUser, UserRole } from '@/types';

// Netlify Identity 초기화
export function initNetlifyIdentity() {
  if (typeof window !== 'undefined') {
    const siteUrl = process.env.NEXT_PUBLIC_NETLIFY_SITE_URL || 'http://localhost:3000';
    netlifyIdentity.init({
      APIUrl: siteUrl,
    });
  }
}

// 현재 사용자 가져오기
export function getCurrentUser(): NetlifyUser | null {
  if (typeof window !== 'undefined') {
    return netlifyIdentity.currentUser() as NetlifyUser | null;
  }
  return null;
}

// 로그인 모달 열기
export function openLogin() {
  if (typeof window !== 'undefined') {
    netlifyIdentity.open('login');
  }
}

// 회원가입 모달 열기
export function openSignup() {
  if (typeof window !== 'undefined') {
    netlifyIdentity.open('signup');
  }
}

// 로그아웃
export function logout() {
  if (typeof window !== 'undefined') {
    netlifyIdentity.logout();
  }
}

// 사용자 메타데이터 업데이트
export async function updateUserMetadata(metadata: {
  full_name?: string;
  role?: UserRole;
  phone?: string;
  avatar_url?: string;
}) {
  const user = getCurrentUser();
  if (!user) throw new Error('사용자가 로그인되어 있지 않습니다.');

  try {
    const updatedUser = await netlifyIdentity.gotrue.currentUser()?.update({
      data: {
        ...user.user_metadata,
        ...metadata,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error('사용자 메타데이터 업데이트 실패:', error);
    throw error;
  }
}

// 사용자 역할 가져오기
export function getUserRole(user: NetlifyUser | null): UserRole {
  if (!user) return 'student';
  return user.user_metadata?.role || 'student';
}

// 토큰 가져오기
export async function getToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    // @ts-ignore - jwt method exists on netlify identity user
    const token = await user.jwt();
    return token;
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
}

// 이벤트 리스너 타입
export type NetlifyIdentityEvent = 
  | 'init'
  | 'login'
  | 'signup'
  | 'logout'
  | 'error'
  | 'open'
  | 'close';

// 이벤트 리스너 등록
export function onAuthStateChange(
  event: NetlifyIdentityEvent,
  callback: (user?: NetlifyUser) => void
) {
  if (typeof window !== 'undefined') {
    netlifyIdentity.on(event, callback);
  }
}

// 이벤트 리스너 제거
export function offAuthStateChange(
  event: NetlifyIdentityEvent,
  callback: (user?: NetlifyUser) => void
) {
  if (typeof window !== 'undefined') {
    netlifyIdentity.off(event, callback);
  }
} 