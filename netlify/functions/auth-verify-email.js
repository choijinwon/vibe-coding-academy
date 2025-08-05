// Netlify Functions - 이메일 인증 (실제 DB 연동)
const { neon } = require('@neondatabase/serverless');

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

  // 데이터베이스 연결
  const sql = neon(process.env.DATABASE_URL);

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

    // 1. 데이터베이스에서 토큰과 일치하는 사용자 찾기
    const users = await sql`
      SELECT 
        id, 
        email, 
        name, 
        role, 
        email_verified,
        metadata,
        created_at
      FROM users 
      WHERE 
        email_verified = false 
        AND metadata->>'emailVerificationToken' = ${token}
        AND (email = ${email} OR ${email} IS NULL)
    `;

    if (users.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '유효하지 않은 인증 토큰이거나 이미 인증된 계정입니다',
          code: 'INVALID_TOKEN'
        }),
      };
    }

    const user = users[0];
    const metadata = user.metadata || {};

    // 2. 토큰 만료 확인
    const tokenExpires = metadata.emailVerificationTokenExpires;
    if (tokenExpires && new Date(tokenExpires) < new Date()) {
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

    // 3. 이메일 인증 완료 처리
    const updatedUsers = await sql`
      UPDATE users 
      SET 
        email_verified = true,
        updated_at = NOW(),
        metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{emailVerifiedAt}',
          to_jsonb(NOW())
        )
      WHERE id = ${user.id}
      RETURNING id, email, name, role, email_verified, updated_at
    `;

    const updatedUser = updatedUsers[0];

    console.log(`✅ 이메일 인증 완료:`);
    console.log(`- 사용자 ID: ${updatedUser.id}`);
    console.log(`- 이메일: ${updatedUser.email}`);
    console.log(`- 인증 시간: ${updatedUser.updated_at}`);

    // 4. 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          emailVerified: updatedUser.email_verified,
          verifiedAt: updatedUser.updated_at,
        },
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