import { NextRequest, NextResponse } from 'next/server';
import { serverSignUp, translateAuthError } from '@/lib/auth/gotrue-server';
import { registerSchema } from '@/lib/validators/auth';

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

    // GoTrue API를 통한 회원가입
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

    return NextResponse.json({
      success: true,
      user: data.user,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
    });

  } catch (error: any) {
    console.error('회원가입 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 