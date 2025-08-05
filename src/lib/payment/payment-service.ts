import { v4 as uuidv4 } from 'uuid';

// 결제 제공업체 타입
export type PaymentProvider = 'tosspayments' | 'iamport';

// 결제 방법 타입
export type PaymentMethod = 'card' | 'bank' | 'phone' | 'kakaopay' | 'naverpay';

// 결제 상태 타입
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

// 결제 요청 인터페이스
export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  courseId: string;
  userId: string;
  method?: PaymentMethod;
  provider?: PaymentProvider;
  successUrl?: string;
  failUrl?: string;
}

// 결제 응답 인터페이스
export interface PaymentResponse {
  success: boolean;
  paymentKey?: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  approvedAt?: string;
  method?: string;
  provider: PaymentProvider;
  receiptUrl?: string;
  error?: string;
  errorCode?: string;
}

// 토스페이먼츠 결제 클래스
export class TossPaymentsService {
  private clientKey: string;
  private secretKey: string;
  private apiUrl: string;

  constructor() {
    this.clientKey = process.env.TOSS_CLIENT_KEY || '';
    this.secretKey = process.env.TOSS_SECRET_KEY || '';
    this.apiUrl = 'https://api.tosspayments.com/v1';
  }

  // 결제 승인
  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentKey: data.paymentKey,
          orderId: data.orderId,
          amount: data.totalAmount,
          status: 'paid',
          approvedAt: data.approvedAt,
          method: data.method,
          provider: 'tosspayments',
          receiptUrl: data.receipt?.url,
        };
      } else {
        return {
          success: false,
          orderId,
          amount,
          status: 'failed',
          provider: 'tosspayments',
          error: data.message,
          errorCode: data.code,
        };
      }
    } catch (error) {
      return {
        success: false,
        orderId,
        amount,
        status: 'failed',
        provider: 'tosspayments',
        error: error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다.',
      };
    }
  }

  // 결제 취소/환불
  async cancelPayment(paymentKey: string, cancelReason: string, cancelAmount?: number): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason,
          ...(cancelAmount && { cancelAmount }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentKey: data.paymentKey,
          orderId: data.orderId,
          amount: data.totalAmount,
          status: 'refunded',
          provider: 'tosspayments',
        };
      } else {
        return {
          success: false,
          orderId: '',
          amount: 0,
          status: 'failed',
          provider: 'tosspayments',
          error: data.message,
          errorCode: data.code,
        };
      }
    } catch (error) {
      return {
        success: false,
        orderId: '',
        amount: 0,
        status: 'failed',
        provider: 'tosspayments',
        error: error instanceof Error ? error.message : '결제 취소 중 오류가 발생했습니다.',
      };
    }
  }

  // 결제 조회
  async getPayment(paymentKey: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentKey}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentKey: data.paymentKey,
          orderId: data.orderId,
          amount: data.totalAmount,
          status: data.status === 'DONE' ? 'paid' : 'pending',
          approvedAt: data.approvedAt,
          method: data.method,
          provider: 'tosspayments',
          receiptUrl: data.receipt?.url,
        };
      } else {
        return {
          success: false,
          orderId: '',
          amount: 0,
          status: 'failed',
          provider: 'tosspayments',
          error: data.message,
          errorCode: data.code,
        };
      }
    } catch (error) {
      return {
        success: false,
        orderId: '',
        amount: 0,
        status: 'failed',
        provider: 'tosspayments',
        error: error instanceof Error ? error.message : '결제 조회 중 오류가 발생했습니다.',
      };
    }
  }
}

// 아임포트 결제 클래스
export class IamportService {
  private impKey: string;
  private impSecret: string;
  private apiUrl: string;

  constructor() {
    this.impKey = process.env.IAMPORT_KEY || '';
    this.impSecret = process.env.IAMPORT_SECRET || '';
    this.apiUrl = 'https://api.iamport.kr';
  }

  // 액세스 토큰 획득
  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/users/getToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imp_key: this.impKey,
        imp_secret: this.impSecret,
      }),
    });

    const data = await response.json();
    
    if (data.code === 0) {
      return data.response.access_token;
    } else {
      throw new Error('아임포트 인증에 실패했습니다.');
    }
  }

  // 결제 정보 조회
  async getPayment(impUid: string): Promise<PaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.apiUrl}/payments/${impUid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.code === 0) {
        const payment = data.response;
        return {
          success: true,
          paymentKey: payment.imp_uid,
          orderId: payment.merchant_uid,
          amount: payment.amount,
          status: payment.status === 'paid' ? 'paid' : 'pending',
          approvedAt: payment.paid_at ? new Date(payment.paid_at * 1000).toISOString() : undefined,
          method: payment.pay_method,
          provider: 'iamport',
          receiptUrl: payment.receipt_url,
        };
      } else {
        return {
          success: false,
          orderId: '',
          amount: 0,
          status: 'failed',
          provider: 'iamport',
          error: data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        orderId: '',
        amount: 0,
        status: 'failed',
        provider: 'iamport',
        error: error instanceof Error ? error.message : '결제 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 결제 취소
  async cancelPayment(impUid: string, reason: string, cancelAmount?: number): Promise<PaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.apiUrl}/payments/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imp_uid: impUid,
          reason,
          ...(cancelAmount && { amount: cancelAmount }),
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        return {
          success: true,
          paymentKey: data.response.imp_uid,
          orderId: data.response.merchant_uid,
          amount: data.response.amount,
          status: 'refunded',
          provider: 'iamport',
        };
      } else {
        return {
          success: false,
          orderId: '',
          amount: 0,
          status: 'failed',
          provider: 'iamport',
          error: data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        orderId: '',
        amount: 0,
        status: 'failed',
        provider: 'iamport',
        error: error instanceof Error ? error.message : '결제 취소 중 오류가 발생했습니다.',
      };
    }
  }
}

// 통합 결제 서비스
export class PaymentService {
  private tossPayments: TossPaymentsService;
  private iamport: IamportService;

  constructor() {
    this.tossPayments = new TossPaymentsService();
    this.iamport = new IamportService();
  }

  // 주문 ID 생성
  generateOrderId(): string {
    const timestamp = Date.now();
    const uuid = uuidv4().slice(0, 8);
    return `ORDER_${timestamp}_${uuid}`;
  }

  // 결제 승인
  async confirmPayment(
    provider: PaymentProvider,
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<PaymentResponse> {
    switch (provider) {
      case 'tosspayments':
        return this.tossPayments.confirmPayment(paymentKey, orderId, amount);
      case 'iamport':
        return this.iamport.getPayment(paymentKey);
      default:
        throw new Error('지원하지 않는 결제 제공업체입니다.');
    }
  }

  // 결제 취소/환불
  async cancelPayment(
    provider: PaymentProvider,
    paymentKey: string,
    reason: string,
    amount?: number
  ): Promise<PaymentResponse> {
    switch (provider) {
      case 'tosspayments':
        return this.tossPayments.cancelPayment(paymentKey, reason, amount);
      case 'iamport':
        return this.iamport.cancelPayment(paymentKey, reason, amount);
      default:
        throw new Error('지원하지 않는 결제 제공업체입니다.');
    }
  }

  // 결제 정보 조회
  async getPayment(provider: PaymentProvider, paymentKey: string): Promise<PaymentResponse> {
    switch (provider) {
      case 'tosspayments':
        return this.tossPayments.getPayment(paymentKey);
      case 'iamport':
        return this.iamport.getPayment(paymentKey);
      default:
        throw new Error('지원하지 않는 결제 제공업체입니다.');
    }
  }

  // 결제 요청 데이터 검증
  validatePaymentRequest(request: PaymentRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.orderId) errors.push('주문 ID가 필요합니다.');
    if (!request.orderName) errors.push('주문명이 필요합니다.');
    if (!request.amount || request.amount <= 0) errors.push('올바른 결제 금액이 필요합니다.');
    if (!request.customerEmail) errors.push('고객 이메일이 필요합니다.');
    if (!request.customerName) errors.push('고객명이 필요합니다.');
    if (!request.courseId) errors.push('강의 ID가 필요합니다.');
    if (!request.userId) errors.push('사용자 ID가 필요합니다.');

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// 기본 내보내기
export const paymentService = new PaymentService(); 