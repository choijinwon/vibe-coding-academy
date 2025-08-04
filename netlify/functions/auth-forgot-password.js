// Netlify Functions - 비밀번호 재설정 (CommonJS 형태)
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

    // Mock 비밀번호 재설정 처리
    console.log(`🔑 Netlify Functions 비밀번호 재설정 요청: ${email}`);

    // Mock 재설정 토큰 생성
    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`📧 비밀번호 재설정 이메일 발송 (Mock):`);
    console.log(`받는 사람: ${email}`);
    console.log(`재설정 링크: https://vibecoding-academy.netlify.app/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
    console.log(`만료 시간: 1시간`);

    // Mock 지연 처리
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.',
      }),
    };

  } catch (error) {
    console.error('Netlify Functions 비밀번호 재설정 오류:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '서버 오류가 발생했습니다' }),
    };
  }
}; 