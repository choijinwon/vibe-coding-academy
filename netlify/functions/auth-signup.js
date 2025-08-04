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
    const { email, password, name, phone, role, agreeToTerms } = JSON.parse(event.body || '{}');

    // 간단한 유효성 검사
    if (!email || !password || !name || !agreeToTerms) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '필수 입력 사항을 모두 작성해주세요' 
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

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '비밀번호는 최소 8자 이상이어야 합니다' 
        }),
      };
    }

    // Netlify Identity API를 통한 회원가입
    // context.clientContext를 통해 Identity API에 접근 가능
    const netlifyUser = context.clientContext && context.clientContext.user;
    
    // 임시로 성공 응답 반환 (실제로는 Netlify Identity API 호출)
    // 프로덕션에서는 GoTrue API를 직접 호출하거나 Netlify Identity 서비스 사용
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
        user: {
          email,
          name,
          role,
          id: `temp_${Date.now()}`, // 임시 ID
        },
      }),
    };

  } catch (error) {
    console.error('회원가입 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다' 
      }),
    };
  }
}; 