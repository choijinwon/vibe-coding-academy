'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  CreditCard, 
  ArrowLeft, 
  Shield, 
  CheckCircle,
  Info,
  Calendar,
  User,
  Phone,
  Mail,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
  };
  price: number;
  originalPrice?: number;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
}

interface PaymentPageProps {
  params: { id: string };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('toss');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToRefund: false
  });

  // Mock 강의 데이터
  useEffect(() => {
    const mockCourse: Course = {
      id: params.id,
      title: 'React & Next.js 풀스택 개발',
      description: '현대적인 웹 개발을 위한 React와 Next.js를 활용한 풀스택 개발 과정입니다.',
      instructor: {
        name: '김개발'
      },
      price: 480000,
      originalPrice: 600000,
      startDate: '2024-09-01',
      endDate: '2024-12-15',
      duration: '16주',
      location: '온라인'
    };

    // 사용자 정보로 폼 초기화
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }

    setTimeout(() => {
      setCourse(mockCourse);
      setLoading(false);
    }, 500);
  }, [params.id, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePayment = async () => {
    if (!course) return;

    // 폼 검증
    if (!formData.name || !formData.phone || !formData.email) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy || !formData.agreeToRefund) {
      alert('모든 약관에 동의해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: 실제 결제 API 호출
      if (selectedPaymentMethod === 'toss') {
        await processTossPayment();
      } else if (selectedPaymentMethod === 'iamport') {
        await processIamportPayment();
      }
    } catch (error) {
      console.error('결제 처리 실패:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTossPayment = async () => {
    // Mock 토스페이먼츠 결제 처리
    console.log('토스페이먼츠 결제 시작...');
    
    // 실제 구현에서는 토스페이먼츠 SDK 사용
    // const tossPayments = TossPayments(clientKey);
    // const payment = tossPayments.payment({ customerKey });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 결제 성공 시뮬레이션
    const paymentResult = {
      success: true,
      paymentId: `toss_${Date.now()}`,
      amount: course?.price,
      orderId: `order_${Date.now()}`
    };

    if (paymentResult.success) {
      // 결제 성공 처리
      await completeEnrollment(paymentResult);
    }
  };

  const processIamportPayment = async () => {
    // Mock 아임포트 결제 처리
    console.log('아임포트 결제 시작...');
    
    // 실제 구현에서는 아임포트 SDK 사용
    // IMP.init('imp_code');
    // IMP.request_pay(payment_data, callback);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 결제 성공 시뮬레이션
    const paymentResult = {
      success: true,
      paymentId: `imp_${Date.now()}`,
      amount: course?.price,
      orderId: `order_${Date.now()}`
    };

    if (paymentResult.success) {
      // 결제 성공 처리
      await completeEnrollment(paymentResult);
    }
  };

  const completeEnrollment = async (paymentResult: any) => {
    try {
      // TODO: 수강신청 완료 API 호출
      console.log('수강신청 완료 처리...', paymentResult);
      
      // Mock API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 성공 페이지로 이동
      router.push(`/courses/${params.id}/payment/success?orderId=${paymentResult.orderId}`);
    } catch (error) {
      console.error('수강신청 완료 처리 실패:', error);
      throw error;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">결제 페이지를 준비 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">강의를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 강의 정보를 불러올 수 없습니다.</p>
          <Link href="/courses">
            <Button>강의 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountAmount = course.originalPrice ? course.originalPrice - course.price : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link 
              href={`/courses/${params.id}`} 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              강의 상세로 돌아가기
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">수강신청 및 결제</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 주문 정보 */}
          <div className="space-y-6">
            {/* 강의 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">주문 내역</h2>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">강사:</span>
                    <span className="ml-2 text-gray-900">{course.instructor.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">기간:</span>
                    <span className="ml-2 text-gray-900">{course.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">시작일:</span>
                    <span className="ml-2 text-gray-900">{formatDate(course.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">수업 방식:</span>
                    <span className="ml-2 text-gray-900">{course.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">결제 금액</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">강의료</span>
                  <span className="text-gray-900">
                    ₩{formatPrice(course.originalPrice || course.price)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>할인</span>
                    <span>-₩{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">최종 결제 금액</span>
                  <span className="text-indigo-600">₩{formatPrice(course.price)}</span>
                </div>
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">결제 방법</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="toss"
                    checked={selectedPaymentMethod === 'toss'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">토스페이먼츠</div>
                      <div className="text-sm text-gray-500">카드, 계좌이체, 가상계좌</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="iamport"
                    checked={selectedPaymentMethod === 'iamport'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">아임포트</div>
                      <div className="text-sm text-gray-500">다양한 PG사 지원</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 신청자 정보 및 약관 */}
          <div className="space-y-6">
            {/* 신청자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">신청자 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    이름 *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    전화번호 *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    이메일 *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">약관 동의</h2>
              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                    required
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">[필수] 이용약관 동의</span>
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 ml-2">
                      보기
                    </Link>
                  </div>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                    required
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">[필수] 개인정보 처리방침 동의</span>
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 ml-2">
                      보기
                    </Link>
                  </div>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToRefund"
                    checked={formData.agreeToRefund}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                    required
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">[필수] 환불정책 동의</span>
                    <Link href="/refund" className="text-indigo-600 hover:text-indigo-700 ml-2">
                      보기
                    </Link>
                  </div>
                </label>
              </div>
            </div>

            {/* 보안 정보 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">안전한 결제</span>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>SSL 암호화로 개인정보 보호</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>30일 환불 보장 정책</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>PG사 안전결제 시스템</span>
                </div>
              </div>
            </div>

            {/* 결제 버튼 */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 text-lg font-medium bg-indigo-600 hover:bg-indigo-700"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  결제 처리 중...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  ₩{formatPrice(course.price)} 결제하기
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              결제 버튼을 클릭하면 위 약관에 동의한 것으로 간주됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 