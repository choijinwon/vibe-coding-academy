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
    const { email, password } = JSON.parse(event.body || '{}');

    // 간단한 유효성 검사
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '이메일과 비밀번호를 입력해주세요' 
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

    // 테스트용 계정들
    const testAccounts = {
      'test@example.com': {
        password: 'password123',
        user: {
          id: 'user_1',
          email: 'test@example.com',
          user_metadata: {
            full_name: '테스트 사용자',
            role: 'student'
          }
        }
      },
      'teacher@example.com': {
        password: 'password123',
        user: {
          id: 'user_2', 
          email: 'teacher@example.com',
          user_metadata: {
            full_name: '테스트 강사',
            role: 'instructor'
          }
        }
      }
    };

    // 테스트 계정 확인
    const account = testAccounts[email];
    if (!account || account.password !== password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '이메일 또는 비밀번호가 올바르지 않습니다' 
        }),
      };
    }

    // 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '로그인이 완료되었습니다.',
        user: account.user,
        session: {
          access_token: `temp_token_${Date.now()}`,
          expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24시간
          refresh_token: `refresh_${Date.now()}`,
          token_type: 'bearer'
        }
      }),
    };

  } catch (error) {
    console.error('로그인 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다' 
      }),
    };
  }
}; 