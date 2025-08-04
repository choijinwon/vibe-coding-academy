// 임시 Mock 구현 - Netlify 배포 후 실제 GoTrue API로 교체 예정

// 회원가입
export async function serverSignUp(
  email: string,
  password: string,
  options?: {
    data?: { [key: string]: any };
  }
) {
  try {
    // Mock 구현
    if (!email || !password) {
      throw new Error('이메일과 비밀번호가 필요합니다');
    }

    // 임시 사용자 데이터 생성
    const user = {
      id: `user_${Date.now()}`,
      email,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString(),
      email_confirmed_at: null, // 이메일 확인 필요
    };
    
    return { 
      data: { user, session: null }, 
      error: null 
    };
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
    // Mock 테스트 계정들
    const testAccounts = {
      'test@example.com': 'password123',
      'teacher@example.com': 'password123',
      'admin@example.com': 'password123',
    };

    if (!testAccounts[email as keyof typeof testAccounts] || testAccounts[email as keyof typeof testAccounts] !== password) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const user = {
      id: `user_${email.split('@')[0]}`,
      email,
      user_metadata: {
        full_name: email.includes('teacher') ? '테스트 강사' : 
                   email.includes('admin') ? '관리자' : '테스트 사용자',
        role: email.includes('teacher') ? 'instructor' : 
              email.includes('admin') ? 'admin' : 'student',
      },
      created_at: new Date().toISOString(),
    };

    const session = {
      access_token: `token_${Date.now()}`,
      refresh_token: `refresh_${Date.now()}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
      user,
    };
    
    return { 
      data: { user, session }, 
      error: null 
    };
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
    if (!email) {
      throw new Error('이메일이 필요합니다');
    }

    // Mock 구현 - 실제로는 이메일 발송
    console.log(`비밀번호 재설정 이메일 발송: ${email}`);
    
    return { 
      data: { message: '비밀번호 재설정 이메일을 발송했습니다' }, 
      error: null 
    };
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