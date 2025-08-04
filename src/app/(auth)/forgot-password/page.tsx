'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft } from 'lucide-react';

import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/lib/config/api';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(API_ENDPOINTS.forgotPassword(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '이메일 발송 중 오류가 발생했습니다');
      }

      setIsEmailSent(true);
    } catch (error: any) {
      console.error('비밀번호 재설정 이메일 발송 실패:', error);
      setAuthError(error.message || '이메일 발송 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 발송 완료 화면
  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-indigo-600">{APP_CONFIG.NAME}</h1>
          </Link>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-6">
                <div className="text-green-600 text-lg font-medium mb-2">
                  이메일을 확인해주세요 📧
                </div>
                <div className="text-green-700 text-sm">
                  <strong>{getValues('email')}</strong>로<br />
                  비밀번호 재설정 링크를 발송했습니다.<br />
                  이메일의 링크를 클릭하여 새 비밀번호를 설정해주세요.
                </div>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="/login" 
                  className="inline-block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  로그인 페이지로 이동
                </Link>
                
                <div className="text-sm text-gray-600">
                  이메일을 받지 못하셨나요?{' '}
                  <button 
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                    onClick={() => setIsEmailSent(false)}
                  >
                    다시 보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-indigo-600">{APP_CONFIG.NAME}</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          비밀번호 찾기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          가입하신 이메일 주소를 입력하시면<br />
          비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 전체 에러 메시지 */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{authError}</div>
              </div>
            )}

            {/* 이메일 입력 */}
            <Input
              label="이메일"
              type="email"
              placeholder="가입하신 이메일을 입력하세요"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
            />

            {/* 전송 버튼 */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  전송 중...
                </>
              ) : (
                '비밀번호 재설정 이메일 보내기'
              )}
            </Button>

            {/* 뒤로가기 링크 */}
            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 