import { NextRequest, NextResponse } from 'next/server';
import { serverResetPassword, translateAuthError } from '@/lib/auth/gotrue-server';
import { resetPasswordSchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력 데이터 검증
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력 데이터가 올바르지 않습니다',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // GoTrue API를 통한 비밀번호 재설정
    const { data, error } = await serverResetPassword(email);

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error) },
        { status: 400 }
      );
    }

    // 성공적인 비밀번호 재설정 요청
    return NextResponse.json({
      success: true,
      message: '비밀번호 재설정 이메일을 발송했습니다.',
    });

  } catch (error: any) {
    console.error('비밀번호 재설정 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 