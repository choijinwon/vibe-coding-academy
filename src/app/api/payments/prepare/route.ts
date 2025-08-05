import { NextRequest, NextResponse } from 'next/server';
import { db, payments, courses, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { paymentService } from '@/lib/payment/payment-service';
import type { PaymentProvider, PaymentMethod } from '@/lib/payment/payment-service';

interface PaymentPrepareRequest {
  courseId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  provider: PaymentProvider;
  method?: PaymentMethod;
  successUrl?: string;
  failUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentPrepareRequest = await request.json();
    const { courseId, userId, customerName, customerEmail, provider, method, successUrl, failUrl } = body;

    // 입력 데이터 검증
    if (!courseId || !userId || !customerName || !customerEmail || !provider) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 강의 정보 조회
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course.length) {
      return NextResponse.json(
        { error: '존재하지 않는 강의입니다.' },
        { status: 404 }
      );
    }

    const courseInfo = course[0];

    // 강의 가격 확인
    if (!courseInfo.price || courseInfo.price <= 0) {
      return NextResponse.json(
        { error: '결제할 수 없는 강의입니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { error: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      );
    }

    // 이미 결제한 강의인지 확인
    const existingPayment = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.courseId, courseId),
          eq(payments.userId, userId),
          eq(payments.status, 'paid')
        )
      )
      .limit(1);

    if (existingPayment.length > 0) {
      return NextResponse.json(
        { error: '이미 결제한 강의입니다.' },
        { status: 400 }
      );
    }

    // 주문 ID 생성
    const orderId = paymentService.generateOrderId();

    // 결제 정보 생성
    const paymentData = {
      orderId,
      userId,
      courseId,
      amount: courseInfo.price,
      provider,
      method: method || 'card',
      status: 'pending' as const,
      customerName,
      customerEmail,
      metadata: {
        courseName: courseInfo.title,
        successUrl,
        failUrl,
      },
    };

    // 결제 요청 검증
    const validation = paymentService.validatePaymentRequest({
      orderId,
      orderName: courseInfo.title,
      amount: courseInfo.price,
      customerEmail,
      customerName,
      courseId,
      userId,
      method,
      provider,
      successUrl,
      failUrl,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: '결제 정보가 올바르지 않습니다.', details: validation.errors },
        { status: 400 }
      );
    }

    // 데이터베이스에 결제 정보 저장
    const insertedPayment = await db
      .insert(payments)
      .values(paymentData)
      .returning();

    // 클라이언트용 결제 정보
    const clientPaymentInfo = {
      orderId,
      orderName: courseInfo.title,
      amount: courseInfo.price,
      customerName,
      customerEmail,
      provider,
      method: method || 'card',
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      failUrl: failUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`,
      // 토스페이먼츠용 설정
      ...(provider === 'tosspayments' && {
        clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      }),
      // 아임포트용 설정
      ...(provider === 'iamport' && {
        userCode: process.env.NEXT_PUBLIC_IAMPORT_USER_CODE,
      }),
    };

    return NextResponse.json({
      success: true,
      payment: clientPaymentInfo,
      message: '결제 준비가 완료되었습니다.',
    });

  } catch (error) {
    console.error('결제 준비 API 오류:', error);
    return NextResponse.json(
      { error: '결제 준비 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 