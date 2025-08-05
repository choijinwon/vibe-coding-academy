'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Script from 'next/script';
import {
  CreditCard,
  Smartphone,
  Building2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Lock
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorId: string;
}

declare global {
  interface Window {
    TossPayments: any;
    IMP: any;
  }
}

export default function PaymentPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'tosspayments' | 'iamport'>('tosspayments');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | 'kakaopay' | 'naverpay'>('card');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [tossPayments, setTossPayments] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCourse();
  }, [courseId, user]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const result = await response.json();
        setCourse(result.course);
      } else {
        console.error('강의 정보 조회 실패');
        router.push('/courses');
      }
    } catch (error) {
      console.error('강의 정보 조회 오류:', error);
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const initializeTossPayments = () => {
    if (window.TossPayments && !tossPayments) {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (clientKey) {
        setTossPayments(window.TossPayments(clientKey));
      }
    }
  };

  const initializeIamport = () => {
    if (window.IMP) {
      const userCode = process.env.NEXT_PUBLIC_IAMPORT_USER_CODE;
      if (userCode) {
        window.IMP.init(userCode);
      }
    }
  };

  const preparePayment = async () => {
    if (!course || !user) return null;

    try {
      const response = await fetch('/api/payments/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId: user.id,
          customerName: user.user_metadata?.full_name || user.email,
          customerEmail: user.email,
          provider: selectedProvider,
          method: selectedMethod,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.payment;
      } else {
        const error = await response.json();
        throw new Error(error.error || '결제 준비 실패');
      }
    } catch (error) {
      console.error('결제 준비 오류:', error);
      throw error;
    }
  };

  const handleTossPayment = async () => {
    if (!tossPayments || !course) return;

    try {
      setPaymentLoading(true);
      const paymentData = await preparePayment();

      await tossPayments.requestPayment(selectedMethod, {
        amount: paymentData.amount,
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        successUrl: paymentData.successUrl,
        failUrl: paymentData.failUrl,
      });
    } catch (error) {
      console.error('토스페이먼츠 결제 오류:', error);
      alert(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleIamportPayment = async () => {
    if (!window.IMP || !course) return;

    try {
      setPaymentLoading(true);
      const paymentData = await preparePayment();

      window.IMP.request_pay({
        pg: 'html5_inicis',
        pay_method: selectedMethod,
        merchant_uid: paymentData.orderId,
        name: paymentData.orderName,
        amount: paymentData.amount,
        buyer_email: paymentData.customerEmail,
        buyer_name: paymentData.customerName,
      }, (rsp: any) => {
        if (rsp.success) {
          // 결제 성공 시 서버에서 검증
          confirmPayment(rsp.imp_uid, paymentData.orderId, paymentData.amount);
        } else {
          alert(`결제에 실패하였습니다. ${rsp.error_msg}`);
          setPaymentLoading(false);
        }
      });
    } catch (error) {
      console.error('아임포트 결제 오류:', error);
      alert(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.');
      setPaymentLoading(false);
    }
  };

  const confirmPayment = async (paymentKey: string, orderId: string, amount: number) => {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentKey,
          amount,
          provider: selectedProvider,
        }),
      });

      if (response.ok) {
        router.push(`/payment/success?orderId=${orderId}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || '결제 확인 실패');
      }
    } catch (error) {
      console.error('결제 확인 오류:', error);
      alert(error instanceof Error ? error.message : '결제 확인 중 오류가 발생했습니다.');
      router.push(`/payment/fail?orderId=${orderId}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayment = () => {
    if (!agreementChecked) {
      alert('결제 약관에 동의해주세요.');
      return;
    }

    if (selectedProvider === 'tosspayments') {
      handleTossPayment();
    } else {
      handleIamportPayment();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">강의를 찾을 수 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">존재하지 않거나 접근할 수 없는 강의입니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* 토스페이먼츠 스크립트 */}
      <Script
        src="https://js.tosspayments.com/v1/payment"
        onLoad={initializeTossPayments}
      />
      
      {/* 아임포트 스크립트 */}
      <Script
        src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"
        onLoad={initializeIamport}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            뒤로 가기
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 강의 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">강의 결제</h1>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">강의 가격</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₩{formatPrice(course.price)}
                  </span>
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h3>
                
                {/* 결제 제공업체 선택 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => setSelectedProvider('tosspayments')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      selectedProvider === 'tosspayments'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">토스페이먼츠</div>
                    <div className="text-sm text-gray-500">간편하고 안전한 결제</div>
                  </button>
                  <button
                    onClick={() => setSelectedProvider('iamport')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      selectedProvider === 'iamport'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">아임포트</div>
                    <div className="text-sm text-gray-500">다양한 결제 방법</div>
                  </button>
                </div>

                {/* 결제 방법 선택 */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`flex items-center p-4 border rounded-lg transition-colors ${
                      selectedMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-3 text-indigo-600" />
                    <span>신용카드</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('bank')}
                    className={`flex items-center p-4 border rounded-lg transition-colors ${
                      selectedMethod === 'bank'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="h-5 w-5 mr-3 text-indigo-600" />
                    <span>계좌이체</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('kakaopay')}
                    className={`flex items-center p-4 border rounded-lg transition-colors ${
                      selectedMethod === 'kakaopay'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="h-5 w-5 mr-3 text-yellow-500" />
                    <span>카카오페이</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('naverpay')}
                    className={`flex items-center p-4 border rounded-lg transition-colors ${
                      selectedMethod === 'naverpay'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="h-5 w-5 mr-3 text-green-500" />
                    <span>네이버페이</span>
                  </button>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    결제 약관, 개인정보 처리방침에 동의합니다.
                    <a href="#" className="text-indigo-600 hover:text-indigo-500 ml-1">
                      자세히 보기
                    </a>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 결제 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 요약</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">강의 가격</span>
                  <span className="font-medium">₩{formatPrice(course.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">할인 금액</span>
                  <span className="font-medium text-green-600">-₩0</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">총 결제 금액</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ₩{formatPrice(course.price)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentLoading || !agreementChecked}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    결제 처리 중...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    ₩{formatPrice(course.price)} 결제하기
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-1" />
                안전한 결제가 보장됩니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 