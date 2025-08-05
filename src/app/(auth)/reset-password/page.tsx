'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/constants';

// 새 비밀번호 스키마
const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '비밀번호에는 영문자가 포함되어야 합니다')
    .regex(/[0-9]/, '비밀번호에는 숫자가 포함되어야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  useEffect(() => {
    // URL에서 토큰과 이메일 추출
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setAuthError('유효하지 않은 재설정 링크입니다.');
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const onSubmit = async (data: NewPasswordFormData) => {
    if (!token || !email) {
      setAuthError('유효하지 않은 재설정 링크입니다.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      // Mock 비밀번호 재설정 (실제로는 API 호출)
      console.log('🔐 비밀번호 재설정 시도:', {
        email,
        token,
        hasNewPassword: !!data.password,
      });

      // 시뮬레이션 지연
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 등록된 테스트 계정인지 확인
      const testAccounts = ['student@test.com', 'instructor@test.com', 'admin@test.com', 'test@example.com'];
      const isValidUser = testAccounts.includes(email);

      if (!isValidUser) {
        throw new Error('등록되지 않은 사용자입니다.');
      }

      console.log('✅ 비밀번호 재설정 성공');
      setIsSuccess(true);

    } catch (error: any) {
      console.error('비밀번호 재설정 실패:', error);
      setAuthError(error.message || '비밀번호 재설정 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰이나 이메일이 없는 경우
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              유효하지 않은 링크
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
            </p>
          </div>
          
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              비밀번호 재설정 다시 요청하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 성공 화면
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              비밀번호 재설정 완료
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              새로운 비밀번호로 설정되었습니다.
            </p>
          </div>
          
          <div className="text-center">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
              size="lg"
            >
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div>
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold text-indigo-600">
              {APP_CONFIG.NAME}
            </h1>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            새 비밀번호 설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <span className="font-medium text-indigo-600">{email}</span> 계정의 새로운 비밀번호를 설정하세요.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 전체 에러 메시지 */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{authError}</div>
              </div>
            )}

            {/* 새 비밀번호 입력 */}
            <Input
              label="새 비밀번호"
              type="password"
              placeholder="새로운 비밀번호를 입력하세요"
              {...register('password')}
              error={errors.password?.message}
              disabled={isLoading}
            />

            {/* 비밀번호 확인 */}
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />

            {/* 비밀번호 요구사항 안내 */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>비밀번호 요구사항:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>최소 8자 이상</li>
                <li>영문자 포함</li>
                <li>숫자 포함</li>
              </ul>
            </div>

            {/* 재설정 버튼 */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  재설정 중...
                </>
              ) : (
                '비밀번호 재설정'
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

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading 컴포넌트
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
} 