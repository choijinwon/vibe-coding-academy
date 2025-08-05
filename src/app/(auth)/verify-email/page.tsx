'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/lib/config/api';

function VerifyEmailContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // 토큰이 없으면 에러 상태
    if (!token) {
      setVerificationStatus('error');
      setMessage('인증 토큰이 없습니다. 올바른 링크인지 확인해주세요.');
      return;
    }

    // 이메일 인증 처리
    verifyEmail(token, email);
  }, [token, email]);

  const verifyEmail = async (verificationToken: string, userEmail: string | null) => {
    try {
      console.log('🔐 이메일 인증 시작:', { token: verificationToken, email: userEmail });

      // 실제 API 호출
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationToken,
          email: userEmail,
        }),
      });

      const result = await response.json();
      console.log('📧 인증 API 응답:', result);

      if (!response.ok) {
        // 오류 상태 처리
        if (result.code === 'TOKEN_EXPIRED' || result.expired) {
          setVerificationStatus('expired');
          setMessage(result.error || '인증 링크가 만료되었습니다. 새로운 인증 이메일을 요청해주세요.');
        } else {
          setVerificationStatus('error');
          setMessage(result.error || '이메일 인증 중 오류가 발생했습니다.');
        }
        return;
      }

      // 성공적으로 인증됨
      setVerificationStatus('success');
      setMessage(result.message || '이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.');
      
      console.log('✅ 이메일 인증 성공:', result.user);

    } catch (error: any) {
      console.error('❌ 이메일 인증 오류:', error);
      setVerificationStatus('error');
      setMessage('인증 처리 중 네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }
  };

  const handleResendEmail = () => {
    // 이메일 재발송 로직 또는 회원가입 페이지로 이동
    router.push('/register');
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            이메일 인증
          </h1>
          <p className="text-sm text-gray-600">
            계정 활성화를 위해 이메일 인증을 진행합니다
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              </div>
              <div className="text-indigo-600">
                <h3 className="text-lg font-medium mb-2">인증 중...</h3>
                <p className="text-sm text-gray-600">
                  이메일 인증을 처리하고 있습니다.<br />
                  잠시만 기다려주세요.
                </p>
              </div>
              {email && (
                <p className="text-xs text-gray-500">
                  인증 대상: {email}
                </p>
              )}
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-green-600">
                <h3 className="text-lg font-medium mb-2">인증 완료! 🎉</h3>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleLoginRedirect}
                  className="w-full"
                  size="lg"
                >
                  로그인하기
                </Button>
                <Link 
                  href="/dashboard"
                  className="block w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  대시보드로 이동
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="text-red-600">
                <h3 className="text-lg font-medium mb-2">인증 실패</h3>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleResendEmail}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  새로운 인증 이메일 받기
                </Button>
                <Link 
                  href="/login"
                  className="block w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  로그인 페이지로 이동
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === 'expired' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Mail className="h-12 w-12 text-yellow-600" />
              </div>
              <div className="text-yellow-600">
                <h3 className="text-lg font-medium mb-2">링크 만료 ⏰</h3>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleResendEmail}
                  className="w-full"
                  size="lg"
                >
                  새로운 인증 이메일 받기
                </Button>
                <Link 
                  href="/login"
                  className="block w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  로그인 페이지로 이동
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link 
            href="/"
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* 개발용 디버그 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-600">
            <h4 className="font-semibold mb-2">개발자 정보:</h4>
            <p>토큰: {token || '없음'}</p>
            <p>이메일: {email || '없음'}</p>
            <p>상태: {verificationStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">페이지를 로딩 중입니다...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 