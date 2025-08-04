import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 이메일 재발송 요청 스키마
const resendSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 입력값 검증
    const validationResult = resendSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '입력값이 올바르지 않습니다',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    try {
      // TODO: 실제 이메일 재발송 로직 구현
      // 현재는 Mock으로 처리
      console.log(`이메일 재발송 요청: ${email}`);
      
      // 실제 구현에서는 다음과 같은 작업이 필요:
      // 1. 사용자가 존재하는지 확인
      // 2. 이미 인증된 사용자인지 확인
      // 3. 새로운 인증 토큰 생성
      // 4. 이메일 발송 서비스 호출
      
      // Mock 응답
      await new Promise(resolve => setTimeout(resolve, 1000)); // 의도적 지연
      
      return NextResponse.json({
        success: true,
        message: '인증 이메일이 재발송되었습니다. 이메일을 확인해주세요.',
      });

    } catch (error: any) {
      console.error('이메일 재발송 오류:', error);
      return NextResponse.json(
        { error: '이메일 재발송 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('이메일 재발송 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 