import { HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');

    // 간단한 유효성 검사
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '이메일을 입력해주세요' 
        }),
      };
    }

    if (!email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '올바른 이메일 형식을 입력해주세요' 
        }),
      };
    }

    // 실제 운영 환경에서는 여기서 이메일 발송 로직을 구현
    // 현재는 성공 응답만 반환
    console.log(`비밀번호 재설정 이메일 발송 요청: ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '비밀번호 재설정 이메일을 발송했습니다.',
      }),
    };

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다' 
      }),
    };
  }
}; 