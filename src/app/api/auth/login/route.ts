import { NextRequest, NextResponse } from 'next/server';
import { serverSignIn, translateAuthError } from '@/lib/auth/gotrue-server';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력 데이터 검증
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력 데이터가 올바르지 않습니다',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // GoTrue API를 통한 로그인
    const { data, error } = await serverSignIn(email, password);

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error) },
        { status: 400 }
      );
    }

    // 성공적인 로그인
    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: '로그인이 완료되었습니다.',
    });

  } catch (error: any) {
    console.error('로그인 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 