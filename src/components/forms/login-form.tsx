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
import { useAuth } from '@/lib/auth/auth-context';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  const router = useRouter();
  const { setUser } = useAuth(); // AuthContext에서 setUser 함수 가져오기

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 이메일 재발송 함수
  const resendVerificationEmail = async () => {
    if (!userEmail) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.resendConfirmation(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setAuthError('인증 이메일이 재발송되었습니다. 이메일을 확인해주세요.');
        setNeedsEmailVerification(false);
      } else {
        setAuthError(result.error || '이메일 재발송 중 오류가 발생했습니다');
      }
    } catch (error: any) {
      console.error('이메일 재발송 실패:', error);
      setAuthError('이메일 재발송 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    setNeedsEmailVerification(false);

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
      
      // 성공 처리 - AuthContext에 사용자 정보 업데이트
      if (result.user) {
        setUser(result.user);
        console.log('로그인 성공, 사용자 상태 업데이트:', result.user);
      }
      
      // 성공 메시지 표시 (선택사항)
      if (result.message) {
        console.log('로그인 성공:', result.message);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        // 약간의 지연 후 대시보드로 이동 (사용자가 성공을 인지할 수 있도록)
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      const errorMessage = error.message || '로그인 중 오류가 발생했습니다';
      setAuthError(errorMessage);
      
      // 이메일 인증이 필요한 경우 처리
      if (errorMessage.includes('이메일 인증이 필요합니다')) {
        setNeedsEmailVerification(true);
        setUserEmail(data.email);
      }
      
      // 특정 필드 에러 처리
      if (errorMessage.includes('이메일') && !errorMessage.includes('인증')) {
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
        <div className={`border rounded-md p-4 ${
          authError.includes('재발송되었습니다') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-sm ${
            authError.includes('재발송되었습니다') 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {authError}
          </div>
          
          {/* 이메일 인증 필요 시 재발송 버튼 표시 */}
          {needsEmailVerification && (
            <div className="mt-3 pt-3 border-t border-red-300">
              <div className="text-xs text-red-500 mb-2">
                📧 <strong>{userEmail}</strong>로 인증 이메일을 받지 못하셨나요?
              </div>
              <button
                type="button"
                onClick={resendVerificationEmail}
                disabled={isLoading}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded border border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />
                    재발송 중...
                  </>
                ) : (
                  '인증 이메일 재발송'
                )}
              </button>
            </div>
          )}
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