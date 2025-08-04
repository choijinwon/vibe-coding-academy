// Netlify Functions - 이메일 인증 재발송 (CommonJS 형태)
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
    const { email } = JSON.parse(event.body);

    // 기본 검증
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일이 필요합니다' }),
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

    // Mock 이메일 재발송 로직
    console.log(`📧 이메일 재발송 요청 (Netlify): ${email}`);

    // 실제 구현에서는 다음과 같은 작업이 필요:
    // 1. 사용자 존재 여부 확인
    // 2. 이미 인증된 사용자인지 확인
    // 3. 새로운 인증 토큰 생성 및 저장
    // 4. 이메일 발송 서비스 호출

    // Mock 인증 토큰 생성
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`📧 인증 이메일 재발송 (Mock):`);
    console.log(`받는 사람: ${email}`);
    console.log(`인증 링크: https://vibecoding-academy.netlify.app/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`);
    console.log(`만료 시간: 24시간`);

    // Mock 지연 처리
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '인증 이메일이 재발송되었습니다. 이메일을 확인해주세요.',
      }),
    };

  } catch (error) {
    console.error('Netlify Functions 이메일 재발송 오류:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '서버 오류가 발생했습니다' }),
    };
  }
}; 