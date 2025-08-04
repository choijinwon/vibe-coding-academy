// Netlify Functions - 로그인 (CommonJS 형태)
exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // 기본 검증
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일과 비밀번호가 필요합니다' }),
      };
    }

    // Mock 로그인 처리 - 실제 배포에서는 DB와 연동 필요
    const testAccounts = {
      'test-db@example.com': 'Password123!',
      'abyys83@gmail.com': 'Password123!',
      'test@example.com': 'Password123!',
      'teacher@example.com': 'Password123!',
      'admin@example.com': 'Password123!',
    };

    // 이메일 인증이 필요한 계정들 (Mock)
    const unverifiedEmails = [
      'newuser@example.com',
      'unverified@example.com',
    ];

    // 계정 확인
    if (!testAccounts[email] || testAccounts[email] !== password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일 또는 비밀번호가 올바르지 않습니다' }),
      };
    }

    // 이메일 인증 확인
    if (unverifiedEmails.includes(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일 인증이 필요합니다. 가입 시 발송된 인증 이메일을 확인해주세요.' }),
      };
    }

    // 사용자 역할 결정
    let role = 'student';
    let fullName = '사용자';

    if (email.includes('teacher')) {
      role = 'instructor';
      fullName = '테스트 강사';
    } else if (email.includes('admin')) {
      role = 'admin';
      fullName = '관리자';
    } else if (email === 'abyys83@gmail.com') {
      fullName = '최진원';
    } else if (email === 'test-db@example.com') {
      fullName = '테스트 사용자';
    }

    // Mock 사용자 객체 생성
    const user = {
      id: `user_${email.split('@')[0]}_${Date.now()}`,
      email,
      aud: 'authenticated',
      role,
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmation_sent_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      user_metadata: {
        full_name: fullName,
        role: role,
      },
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(`✅ Netlify Functions 로그인 성공: ${email} (${role})`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user,
        message: '로그인 성공',
      }),
    };

  } catch (error) {
    console.error('Netlify Functions 로그인 오류:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '서버 오류가 발생했습니다' }),
    };
  }
}; 