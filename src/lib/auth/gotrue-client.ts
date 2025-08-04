// @ts-ignore - netlify-identity-widget doesn't have proper types
import netlifyIdentity from 'netlify-identity-widget';
import type { NetlifyUser, UserRole } from '@/types';

// GoTrue 클라이언트 가져오기
function getGoTrueClient() {
  if (typeof window === 'undefined') return null;
  
  // netlify-identity-widget 초기화 확인
  if (!netlifyIdentity.gotrue) {
    const siteUrl = process.env.NEXT_PUBLIC_NETLIFY_SITE_URL || 'http://localhost:3000';
    netlifyIdentity.init({
      APIUrl: siteUrl,
    });
  }
  
  return netlifyIdentity.gotrue;
}

// 이메일/패스워드로 회원가입
export async function signUpWithEmail(
  email: string,
  password: string,
  userData: {
    name: string;
    phone?: string;
    role: UserRole;
  }
) {
  const client = getGoTrueClient();
  if (!client) throw new Error('GoTrue 클라이언트를 초기화할 수 없습니다');

  try {
    const user = await client.signup(email, password, {
      data: {
        full_name: userData.name,
        name: userData.name,
        role: userData.role,
        phone: userData.phone || '',
      },
    });

    return user as NetlifyUser;
  } catch (error: any) {
    console.error('회원가입 오류:', error);
    throw new Error(getErrorMessage(error));
  }
}

// 이메일/패스워드로 로그인
export async function signInWithEmail(email: string, password: string) {
  const client = getGoTrueClient();
  if (!client) throw new Error('GoTrue 클라이언트를 초기화할 수 없습니다');

  try {
    const response = await client.login(email, password, true);
    return response as NetlifyUser;
  } catch (error: any) {
    console.error('로그인 오류:', error);
    throw new Error(getErrorMessage(error));
  }
}

// 비밀번호 재설정 이메일 발송
export async function sendPasswordResetEmail(email: string) {
  const client = getGoTrueClient();
  if (!client) throw new Error('GoTrue 클라이언트를 초기화할 수 없습니다');

  try {
    await client.requestPasswordRecovery(email);
    return { success: true };
  } catch (error: any) {
    console.error('비밀번호 재설정 오류:', error);
    throw new Error(getErrorMessage(error));
  }
}

// 이메일 확인 재발송
export async function resendConfirmationEmail(email: string) {
  const client = getGoTrueClient();
  if (!client) throw new Error('GoTrue 클라이언트를 초기화할 수 없습니다');

  try {
    await client.resend({ email, type: 'signup' });
    return { success: true };
  } catch (error: any) {
    console.error('이메일 확인 재발송 오류:', error);
    throw new Error(getErrorMessage(error));
  }
}

// 로그아웃
export async function signOut() {
  const client = getGoTrueClient();
  if (!client) throw new Error('GoTrue 클라이언트를 초기화할 수 없습니다');

  try {
    const user = client.currentUser();
    if (user) {
      await user.logout();
    }
    return { success: true };
  } catch (error: any) {
    console.error('로그아웃 오류:', error);
    throw new Error(getErrorMessage(error));
  }
}

// 현재 사용자 정보 가져오기
export function getCurrentUserFromGoTrue(): NetlifyUser | null {
  const client = getGoTrueClient();
  if (!client) return null;

  try {
    const user = client.currentUser();
    return user as NetlifyUser | null;
  } catch (error) {
    console.error('현재 사용자 정보 가져오기 오류:', error);
    return null;
  }
}

// 에러 메시지 변환
function getErrorMessage(error: any): string {
  const message = error?.message || error?.error_description || '알 수 없는 오류가 발생했습니다';
  
  // 일반적인 GoTrue 에러 메시지를 한국어로 변환
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
    'User not found': '존재하지 않는 사용자입니다',
    'Email not confirmed': '이메일 인증이 완료되지 않았습니다',
    'A user with this email address has already been registered': '이미 가입된 이메일 주소입니다',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
    'Unable to validate email address: invalid format': '올바르지 않은 이메일 형식입니다',
    'Email rate limit exceeded': '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요',
    'Password recovery email sent': '비밀번호 재설정 이메일을 발송했습니다',
    'Confirmation email sent': '확인 이메일을 발송했습니다',
  };

  return errorMap[message] || message;
} 