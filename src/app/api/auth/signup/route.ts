import { NextRequest, NextResponse } from 'next/server';
import { serverSignUp, translateAuthError } from '@/lib/auth/gotrue-server';
import { registerSchema } from '@/lib/validators/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// 이메일 발송 함수 (Mock)
async function sendVerificationEmail(email: string, name: string) {
  try {
    // TODO: 실제 이메일 발송 로직 구현
    // 예: SendGrid, Mailgun, 또는 Netlify Functions를 사용한 이메일 발송
    
    // Mock 인증 토큰 생성
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // 실제 구현에서는 DB에 토큰을 저장하고 만료 시간을 설정해야 함
    console.log(`\n📧 인증 이메일 발송 (Mock):`);
    console.log(`받는 사람: ${email} (${name})`);
    console.log(`인증 링크: ${process.env.NEXT_PUBLIC_NETLIFY_SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`);
    console.log(`만료 시간: 24시간\n`);
    
    // 실제 이메일 내용 예시:
    const emailContent = {
      to: email,
      subject: '[바이브코딩 아카데미] 이메일 인증을 완료해주세요',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2>안녕하세요, ${name}님! 🎉</h2>
          <p>바이브코딩 아카데미에 가입해주셔서 감사합니다.</p>
          <p>계정을 활성화하려면 아래 버튼을 클릭해주세요:</p>
          <a href="${process.env.NEXT_PUBLIC_NETLIFY_SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            이메일 인증하기
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            이 링크는 24시간 후 만료됩니다.<br>
            만약 가입하지 않으셨다면 이 이메일을 무시해주세요.
          </p>
        </div>
      `
    };
    
    // Mock 발송 (실제로는 이메일 서비스 API 호출)
    return { success: true };
    
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. 입력값 검증
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값이 올바르지 않습니다',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { email, password, name, phone, role } = validationResult.data;

    // 2. 이메일 중복 체크
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다' },
        { status: 400 }
      );
    }

    // 3. GoTrue API를 통한 회원가입
    const { data, error } = await serverSignUp(email, password, {
      data: { full_name: name, name: name, role: role, phone: phone || '' },
    });

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error) },
        { status: 400 }
      );
    }

    // 4. 데이터베이스에 사용자 정보 저장
    try {
      const newUser = await db.insert(users).values({
        email,
        name,
        phone: phone || null,
        role: role || 'student',
        emailVerified: false, // 기본값: 미인증
        metadata: {
          authProvider: 'netlify-identity',
          externalId: data?.user?.id || null,
        },
      }).returning();

      // 5. 인증 이메일 발송
      const emailResult = await sendVerificationEmail(email, name);
      if (!emailResult.success) {
        console.warn('이메일 발송 실패, 하지만 회원가입은 완료됨');
      }

      return NextResponse.json({
        success: true,
        user: newUser[0],
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.',
        emailSent: emailResult.success,
      });
      
    } catch (dbError: any) {
      console.error('데이터베이스 저장 오류:', dbError);
      
      // DB 저장 실패해도 이메일 발송 시도
      const emailResult = await sendVerificationEmail(email, name);
      
      return NextResponse.json({
        success: true,
        user: data?.user || null,
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.',
        emailSent: emailResult.success,
        warning: 'DB 저장 오류가 발생했지만 계정은 생성되었습니다.',
      });
    }

  } catch (error: any) {
    console.error('회원가입 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 