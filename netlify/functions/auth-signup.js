// Netlify Functions - 회원가입 (실제 DB 연동)
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

    console.log(`📧 회원가입 요청 처리 시작:`);
    console.log(`이메일: ${email}`);
    console.log(`이름: ${name}`);
    console.log(`역할: ${role || 'student'}`);

    // 1. 기존 사용자 중복 확인
    const existingUsers = await sql`
      SELECT email FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이미 등록된 이메일입니다' }),
      };
    }

    // 2. 비밀번호 해싱
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. 인증 토큰 생성
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const verificationLink = `https://vibecoding-academy.netlify.app/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // 4. 데이터베이스에 사용자 저장
    const newUsers = await sql`
      INSERT INTO users (
        email, 
        name, 
        phone, 
        role, 
        email_verified,
        metadata
      ) 
      VALUES (
        ${email},
        ${name},
        ${phone || null},
        ${role || 'student'},
        false,
        ${JSON.stringify({
          authProvider: 'netlify-identity',
          hashedPassword: hashedPassword,
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          registrationSource: 'web'
        })}
      )
      RETURNING id, email, name, role, email_verified, created_at
    `;

    const newUser = newUsers[0];
    console.log(`✅ 사용자 데이터베이스 저장 완료: ${newUser.id}`);

    // 5. 이메일 발송 처리
    let emailSent = false;
    try {
      // TODO: 실제 이메일 발송 구현 (Resend)
      // 현재는 로깅으로 대체
      console.log(`📧 인증 이메일 발송:`);
      console.log(`받는 사람: ${email} (${name})`);
      console.log(`인증 링크: ${verificationLink}`);
      console.log(`만료 시간: 24시간`);

      // 이메일 내용
      const emailContent = {
        to: email,
        subject: '[바이브코딩 아카데미] 이메일 인증을 완료해주세요 ✨',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">바이브코딩 아카데미</h1>
            </div>
            
            <div style="background: white; padding: 40px 30px; margin: 0;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">안녕하세요, ${name}님! 🎉</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                바이브코딩 아카데미에 가입해주셔서 진심으로 감사합니다!<br>
                최고 품질의 프로그래밍 교육을 제공하기 위해 최선을 다하겠습니다.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                계정을 활성화하려면 아래 버튼을 클릭하여 이메일 인증을 완료해주세요:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 16px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-weight: 600;
                          font-size: 16px;
                          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  🔐 이메일 인증하기
                </a>
              </div>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">💡 다음 단계:</h3>
                <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">이메일 인증 완료</li>
                  <li style="margin-bottom: 8px;">관심 있는 강의 둘러보기</li>
                  <li style="margin-bottom: 8px;">커뮤니티에서 다른 학습자들과 소통</li>
                  <li>본격적인 학습 시작! 🚀</li>
                </ul>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                ⏰ <strong>이 링크는 24시간 후 만료됩니다.</strong><br>
                만약 가입하지 않으셨다면 이 이메일을 무시해주세요.<br><br>
                문의사항이 있으시면 <a href="mailto:support@vibecoding.com" style="color: #667eea;">support@vibecoding.com</a>으로 연락해주세요.
              </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              © 2024 바이브코딩 아카데미. 모든 권리 보유.
            </div>
          </div>
        `
      };

      // TODO: Resend API 호출
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send(emailContent);

      emailSent = true; // Mock으로 성공 처리
      console.log(`✅ 이메일 발송 완료 (Mock): ${email}`);

    } catch (emailError) {
      console.error(`❌ 이메일 발송 실패:`, emailError);
      emailSent = false;
    }

    // 6. 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          emailVerified: newUser.email_verified,
          createdAt: newUser.created_at,
        },
        message: '회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.',
        emailSent: emailSent,
        verificationRequired: true,
        // 개발/테스트용 정보
        debug: {
          verificationLink: verificationLink,
          databaseSaved: true,
          userId: newUser.id,
        }
      }),
    };

  } catch (error) {
    console.error('🚨 회원가입 처리 오류:', error);

    // 데이터베이스 오류와 일반 오류 구분
    const errorMessage = error.message?.includes('duplicate key') 
      ? '이미 등록된 이메일입니다'
      : '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
}; 