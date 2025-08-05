// Netlify Functions - 로그인 (실제 DB 연동)
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

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
    const { email, password } = JSON.parse(event.body);

    // 기본 검증
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일과 비밀번호를 입력해주세요' }),
      };
    }

    console.log(`🔐 로그인 시도: ${email}`);

    // 1. 하드코딩된 테스트 계정 확인 (기존 테스트용)
    const testAccounts = {
      'student@test.com': { password: 'password', role: 'student', name: '테스트 학생' },
      'instructor@test.com': { password: 'password', role: 'instructor', name: '테스트 강사' },
      'admin@test.com': { password: 'password', role: 'admin', name: '테스트 관리자' },
    };

    // 테스트 계정 로그인
    if (testAccounts[email] && testAccounts[email].password === password) {
      const testAccount = testAccounts[email];
      console.log(`✅ 테스트 계정 로그인 성공: ${email} (${testAccount.role})`);

      const mockToken = `test_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            id: `test_${email.split('@')[0]}`,
            email: email,
            name: testAccount.name,
            role: testAccount.role,
            emailVerified: true,
          },
          access_token: mockToken,
          message: '로그인 성공',
        }),
      };
    }

    // 2. 실제 데이터베이스에서 사용자 조회
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
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '등록되지 않은 이메일입니다' }),
      };
    }

    const user = users[0];
    const metadata = user.metadata || {};
    const hashedPassword = metadata.hashedPassword;

    // 3. 비밀번호 확인
    if (!hashedPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '비밀번호가 설정되지 않은 계정입니다' }),
      };
    }

    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      console.log(`❌ 로그인 실패 - 잘못된 비밀번호: ${email}`);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일 또는 비밀번호가 올바르지 않습니다' }),
      };
    }

    // 4. 이메일 인증 확인 (선택사항 - 필요에 따라 주석 해제)
    // if (!user.email_verified) {
    //   return {
    //     statusCode: 400,
    //     headers,
    //     body: JSON.stringify({ 
    //       error: '이메일 인증을 완료해주세요',
    //       code: 'EMAIL_NOT_VERIFIED',
    //       needsVerification: true,
    //     }),
    //   };
    // }

    // 5. 로그인 성공 - 토큰 생성
    const accessToken = `auth_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 6. 마지막 로그인 시간 업데이트
    await sql`
      UPDATE users 
      SET 
        metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{lastLoginAt}',
          to_jsonb(NOW())
        ),
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    console.log(`✅ 로그인 성공: ${user.email} (${user.role})`);

    // 7. 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
        },
        access_token: accessToken,
        message: '로그인 성공',
      }),
    };

  } catch (error) {
    console.error('🚨 로그인 처리 오류:', error);

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