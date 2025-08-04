'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      // TODO: 실제 인증 API 호출
      // 현재는 Mock으로 처리
      await new Promise(resolve => setTimeout(resolve, 2000)); // 의도적 지연
      
      // Mock 검증 로직
      if (verificationToken === 'expired') {
        setVerificationStatus('expired');
        setMessage('인증 링크가 만료되었습니다. 새로운 인증 이메일을 요청해주세요.');
      } else if (verificationToken === 'invalid') {
        setVerificationStatus('error');
        setMessage('유효하지 않은 인증 링크입니다.');
      } else {
        // 성공적으로 인증됨
        setVerificationStatus('success');
        setMessage('이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.');
      }

    } catch (error: any) {
      console.error('이메일 인증 오류:', error);
      setVerificationStatus('error');
      setMessage('인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            이메일 인증
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            바이브코딩 아카데미 계정 활성화
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {verificationStatus === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              </div>
              <div className="text-gray-600">
                <h3 className="text-lg font-medium mb-2">인증 처리 중...</h3>
                <p className="text-sm">잠시만 기다려주세요.</p>
              </div>
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
                {email && (
                  <p className="text-xs text-gray-500 mb-4">
                    인증된 이메일: <strong>{email}</strong>
                  </p>
                )}
              </div>
              <Button
                onClick={handleLoginRedirect}
                className="w-full"
                size="lg"
              >
                로그인하기
              </Button>
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
                  variant="outline"
                  className="w-full"
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
                <h3 className="text-lg font-medium mb-2">링크 만료</h3>
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