import { NextRequest, NextResponse } from 'next/server';
import { serverSignUp, translateAuthError } from '@/lib/auth/gotrue-server';
import { registerSchema } from '@/lib/validators/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력 데이터 검증
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력 데이터가 올바르지 않습니다',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, password, name, phone, role } = validationResult.data;

    // 1. 이메일 중복 체크
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다' },
        { status: 400 }
      );
    }

    // 2. GoTrue API를 통한 회원가입
    const { data, error } = await serverSignUp(email, password, {
      data: {
        full_name: name,
        name: name,
        role: role,
        phone: phone || '',
      },
    });

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error) },
        { status: 400 }
      );
    }

    // 3. 데이터베이스에 사용자 정보 저장
    try {
      const newUser = await db.insert(users).values({
        email,
        name,
        phone: phone || null,
        role: role || 'student',
        emailVerified: false,
        metadata: {
          authProvider: 'netlify-identity',
          externalId: data?.user?.id || null,
        },
      }).returning();

      return NextResponse.json({
        success: true,
        user: newUser[0],
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      });
    } catch (dbError: any) {
      console.error('데이터베이스 저장 오류:', dbError);
      return NextResponse.json({
        success: true,
        user: data?.user || null,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
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