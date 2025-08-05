// Netlify Functions - 이메일 인증 (CommonJS 형태)
exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
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
    const { token, email } = JSON.parse(event.body);

    // 기본 검증
    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '인증 토큰이 필요합니다' }),
      };
    }

    console.log(`🔐 이메일 인증 요청:`);
    console.log(`토큰: ${token}`);
    console.log(`이메일: ${email || '없음'}`);

    // 토큰 형식 검증
    if (!token.startsWith('verify_')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '유효하지 않은 인증 토큰 형식입니다',
          code: 'INVALID_TOKEN_FORMAT'
        }),
      };
    }

    // 토큰에서 타임스탬프 추출하여 만료 확인
    try {
      const tokenParts = token.split('_');
      if (tokenParts.length >= 2) {
        const timestamp = parseInt(tokenParts[1]);
        const tokenAge = Date.now() - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24시간

        if (tokenAge > maxAge) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: '인증 링크가 만료되었습니다. 새로운 인증 이메일을 요청해주세요.',
              code: 'TOKEN_EXPIRED',
              expired: true,
            }),
          };
        }
      }
    } catch (parseError) {
      console.error('토큰 파싱 오류:', parseError);
    }

    // Mock 인증 처리 (실제로는 데이터베이스에서 토큰 확인 및 사용자 활성화)
    const mockVerificationResult = await verifyEmailToken(token, email);

    if (!mockVerificationResult.success) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: mockVerificationResult.error,
          code: mockVerificationResult.code,
          expired: mockVerificationResult.expired || false,
        }),
      };
    }

    // 인증 성공
    console.log(`✅ 이메일 인증 성공: ${email}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.',
        user: mockVerificationResult.user,
        verified: true,
      }),
    };

  } catch (error) {
    console.error('🚨 이메일 인증 처리 오류:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};

// Mock 이메일 인증 로직
async function verifyEmailToken(token, email) {
  try {
    // 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 테스트용 특별 토큰들
    if (token === 'verify_expired_token') {
      return {
        success: false,
        error: '인증 링크가 만료되었습니다.',
        code: 'TOKEN_EXPIRED',
        expired: true,
      };
    }

    if (token === 'verify_invalid_token') {
      return {
        success: false,
        error: '유효하지 않은 인증 토큰입니다.',
        code: 'INVALID_TOKEN',
      };
    }

    // 정상적인 토큰 형식인지 확인
    if (!token.startsWith('verify_')) {
      return {
        success: false,
        error: '유효하지 않은 토큰 형식입니다.',
        code: 'INVALID_TOKEN_FORMAT',
      };
    }

    // Mock 사용자 정보 (실제로는 데이터베이스에서 조회)
    const mockUser = {
      id: `user_${email ? email.split('@')[0] : 'unknown'}_verified`,
      email: email || 'unknown@example.com',
      name: '인증된 사용자',
      role: 'student',
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
      metadata: {
        authProvider: 'netlify-identity',
        verificationMethod: 'email',
        verificationToken: token,
      },
    };

    console.log(`📧 사용자 이메일 인증 완료:`);
    console.log(`- 사용자 ID: ${mockUser.id}`);
    console.log(`- 이메일: ${mockUser.email}`);
    console.log(`- 인증 시간: ${mockUser.verifiedAt}`);

    return {
      success: true,
      user: mockUser,
    };

  } catch (error) {
    console.error('Mock 인증 처리 오류:', error);
    return {
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.',
      code: 'VERIFICATION_ERROR',
    };
  }
} 