// Netlify Functions - 비밀번호 재설정 (CommonJS 형태)
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

    // 등록된 사용자 확인 (테스트 계정)
    const registeredUsers = [
      'student@test.com',
      'instructor@test.com', 
      'admin@test.com',
      'test@example.com'
    ];

    const isRegisteredUser = registeredUsers.includes(email);

    if (!isRegisteredUser) {
      // 보안상 이유로 실제로는 같은 메시지를 보내지만, 실제 서비스에서는 등록되지 않은 이메일이라고 알려주지 않음
      console.log(`🚫 등록되지 않은 사용자의 비밀번호 재설정 요청: ${email}`);
    }

    // 재설정 토큰 생성
    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const resetLink = `https://vibecoding-academy.netlify.app/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    console.log(`🔑 비밀번호 재설정 요청 처리:`);
    console.log(`📧 받는 사람: ${email}`);
    console.log(`🔗 재설정 링크: ${resetLink}`);
    console.log(`⏰ 만료 시간: 1시간`);
    console.log(`✅ 등록된 사용자: ${isRegisteredUser ? 'Yes' : 'No'}`);

    // 실제 이메일 발송 로직 (현재는 Mock)
    try {
      // 여기에 실제 이메일 발송 로직을 추가할 수 있습니다
      // 예: Resend, SendGrid, Nodemailer 등
      
      if (isRegisteredUser) {
        // Mock 이메일 발송
        console.log(`📮 이메일 발송 중...`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // 실제 발송 시뮬레이션
        console.log(`✅ 이메일 발송 완료`);
      } else {
        // 등록되지 않은 사용자도 같은 응답을 보내 보안 유지
        console.log(`⚠️ 등록되지 않은 사용자이지만 성공 응답 전송`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.',
          data: {
            email: email,
            resetTokenGenerated: isRegisteredUser,
          }
        }),
      };

    } catch (emailError) {
      console.error('📧 이메일 발송 오류:', emailError);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: '이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
        }),
      };
    }

  } catch (error) {
    console.error('🚨 비밀번호 재설정 API 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      }),
    };
  }
}; 