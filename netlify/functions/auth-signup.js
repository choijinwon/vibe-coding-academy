// Netlify Functions - 회원가입 (CommonJS 형태)
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
    const { email, password, confirmPassword, name, phone, role, agreeToTerms } = JSON.parse(event.body);

    // 기본 검증
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '필수 정보를 모두 입력해주세요' }),
      };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '올바른 이메일 주소를 입력해주세요' }),
      };
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '비밀번호가 일치하지 않습니다' }),
      };
    }

    // 비밀번호 강도 확인
    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '비밀번호는 8자 이상이어야 합니다' }),
      };
    }

    // 이용약관 동의 확인
    if (!agreeToTerms) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이용약관에 동의해주세요' }),
      };
    }

    // Mock 회원가입 처리
    console.log(`📧 Netlify Functions 회원가입: ${email} (${name})`);
    console.log(`🔐 역할: ${role || 'student'}`);
    console.log(`📱 전화번호: ${phone || '없음'}`);

    // Mock 인증 이메일 발송 로그
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`📧 인증 이메일 발송 (Mock):`);
    console.log(`받는 사람: ${email} (${name})`);
    console.log(`인증 링크: https://vibecoding-academy.netlify.app/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`);
    console.log(`만료 시간: 24시간`);

    // Mock 사용자 객체 생성
    const user = {
      id: `user_${email.split('@')[0]}_${Date.now()}`,
      email,
      name,
      phone: phone || null,
      role: role || 'student',
      emailVerified: false,
      metadata: {
        authProvider: 'netlify-identity',
        externalId: `mock_${Date.now()}`,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user,
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.',
        emailSent: true,
      }),
    };

  } catch (error) {
    console.error('Netlify Functions 회원가입 오류:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '서버 오류가 발생했습니다' }),
    };
  }
}; 