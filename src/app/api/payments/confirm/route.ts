import { NextRequest, NextResponse } from 'next/server';
import { db, payments, courseRegistrations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { paymentService } from '@/lib/payment/payment-service';
import type { PaymentProvider } from '@/lib/payment/payment-service';

interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
  provider: PaymentProvider;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentConfirmRequest = await request.json();
    const { orderId, paymentKey, amount, provider } = body;

    // 입력 데이터 검증
    if (!orderId || !paymentKey || !amount || !provider) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 결제 정보 조회
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!existingPayment.length) {
      return NextResponse.json(
        { error: '존재하지 않는 주문입니다.' },
        { status: 404 }
      );
    }

    const payment = existingPayment[0];

    // 결제 상태 확인
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 결제입니다.' },
        { status: 400 }
      );
    }

    // 결제 금액 검증
    if (payment.amount !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 결제 제공업체 검증
    if (payment.provider !== provider) {
      return NextResponse.json(
        { error: '결제 제공업체가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 필수 필드 확인
    if (!payment.userId || !payment.courseId) {
      return NextResponse.json(
        { error: '결제 정보가 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    try {
      // 결제 승인 처리
      const confirmResult = await paymentService.confirmPayment(
        provider,
        paymentKey,
        orderId,
        amount
      );

      if (!confirmResult.success) {
        // 결제 실패 시 상태 업데이트
        await db
          .update(payments)
          .set({
            status: 'failed',
            failReason: confirmResult.error,
            updatedAt: new Date(),
          })
          .where(eq(payments.orderId, orderId));

        return NextResponse.json(
          { 
            error: '결제 승인에 실패했습니다.',
            details: confirmResult.error 
          },
          { status: 400 }
        );
      }

      // 결제 성공 시 상태 업데이트
      await db
        .update(payments)
        .set({
          status: 'paid',
          paymentKey: confirmResult.paymentKey,
          method: confirmResult.method,
          receiptUrl: confirmResult.receiptUrl,
          approvedAt: confirmResult.approvedAt ? new Date(confirmResult.approvedAt) : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, orderId));

      // 수강신청 상태 업데이트 (결제 완료 시 자동 승인)
      const existingRegistration = await db
        .select()
        .from(courseRegistrations)
        .where(
          and(
            eq(courseRegistrations.userId, payment.userId),
            eq(courseRegistrations.courseId, payment.courseId)
          )
        )
        .limit(1);

      if (existingRegistration.length > 0) {
        // 기존 수강신청이 있는 경우 결제 상태 업데이트
        await db
          .update(courseRegistrations)
          .set({
            paymentStatus: 'paid',
            paymentId: orderId,
            status: 'approved',
            approvedAt: new Date(),
          })
          .where(eq(courseRegistrations.id, existingRegistration[0].id));
      } else {
        // 새 수강신청 생성 (결제와 함께)
        await db
          .insert(courseRegistrations)
          .values({
            userId: payment.userId,
            courseId: payment.courseId,
            status: 'approved',
            paymentStatus: 'paid',
            paymentId: orderId,
            approvedAt: new Date(),
          });
      }

      return NextResponse.json({
        success: true,
        payment: {
          orderId: confirmResult.orderId,
          paymentKey: confirmResult.paymentKey,
          amount: confirmResult.amount,
          status: confirmResult.status,
          approvedAt: confirmResult.approvedAt,
          method: confirmResult.method,
          receiptUrl: confirmResult.receiptUrl,
        },
        message: '결제가 성공적으로 완료되었습니다.',
      });

    } catch (confirmError) {
      console.error('결제 승인 처리 오류:', confirmError);

      // 결제 실패 상태로 업데이트
      await db
        .update(payments)
        .set({
          status: 'failed',
          failReason: confirmError instanceof Error ? confirmError.message : '결제 승인 중 오류 발생',
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, orderId));

      return NextResponse.json(
        { error: '결제 승인 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('결제 승인 API 오류:', error);
    return NextResponse.json(
      { error: '결제 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 