'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/lib/config/api';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(API_ENDPOINTS.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '로그인 중 오류가 발생했습니다');
      }
      
      // 성공 처리 - 세션 정보를 컨텍스트에 업데이트
      // TODO: Auth Context에 세션 정보 업데이트 로직 추가
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      const errorMessage = error.message || '로그인 중 오류가 발생했습니다';
      setAuthError(errorMessage);
      
      // 특정 필드 에러 처리
      if (errorMessage.includes('이메일')) {
        setError('email', { message: errorMessage });
      } else if (errorMessage.includes('비밀번호')) {
        setError('password', { message: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        placeholder="이메일을 입력하세요"
        {...register('email')}
        error={errors.email?.message}
        disabled={isLoading}
      />

      {/* 비밀번호 입력 */}
      <div className="relative">
        <Input
          label="비밀번호"
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 입력하세요"
          {...register('password')}
          error={errors.password?.message}
          disabled={isLoading}
        />
        <button
          type="button"
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 비밀번호 찾기 링크 */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link 
            href="/forgot-password" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </div>

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            로그인 중...
          </>
        ) : (
          '로그인'
        )}
      </Button>

      {/* 회원가입 링크 */}
      <div className="text-center">
        <span className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link 
            href="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            회원가입하기
          </Link>
        </span>
      </div>
    </form>
  );
} 