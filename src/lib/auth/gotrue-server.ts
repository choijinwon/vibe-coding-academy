import { GoTrueApi } from '@supabase/gotrue-js';

// 서버 사이드 GoTrue 클라이언트
const gotrueUrl = process.env.NEXT_PUBLIC_NETLIFY_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_NETLIFY_SITE_URL}/.netlify/identity`
  : 'http://localhost:3000/.netlify/identity';

export const gotrueAdmin = new GoTrueApi({
  url: gotrueUrl,
  headers: {},
});

// 회원가입
export async function serverSignUp(
  email: string,
  password: string,
  options?: {
    data?: { [key: string]: any };
  }
) {
  try {
    const { data, error } = await gotrueAdmin.signUp({ 
      email, 
      password, 
      options 
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('서버 회원가입 오류:', error);
    return { 
      data: null, 
      error: error.message || '회원가입 중 오류가 발생했습니다' 
    };
  }
}

// 로그인
export async function serverSignIn(email: string, password: string) {
  try {
    const { data, error } = await gotrueAdmin.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('서버 로그인 오류:', error);
    return { 
      data: null, 
      error: error.message || '로그인 중 오류가 발생했습니다' 
    };
  }
}

// 비밀번호 재설정
export async function serverResetPassword(email: string) {
  try {
    const { data, error } = await gotrueAdmin.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_NETLIFY_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('서버 비밀번호 재설정 오류:', error);
    return { 
      data: null, 
      error: error.message || '비밀번호 재설정 중 오류가 발생했습니다' 
    };
  }
}

// 에러 메시지 변환
export function translateAuthError(error: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
    'User not found': '존재하지 않는 사용자입니다',
    'Email not confirmed': '이메일 인증이 완료되지 않았습니다',
    'A user with this email address has already been registered': '이미 가입된 이메일 주소입니다',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
    'Unable to validate email address: invalid format': '올바르지 않은 이메일 형식입니다',
    'Email rate limit exceeded': '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요',
    'Signup requires a valid password': '유효한 비밀번호가 필요합니다',
  };

  return errorMap[error] || error;
} 