'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { registerSchema, type RegisterFormData } from '@/lib/validators/auth';
import { Input, Select, Checkbox } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/lib/config/api';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({ onSuccess, redirectTo = '/dashboard' }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const roleOptions = [
    { value: 'student', label: '학생' },
    { value: 'instructor', label: '강사' },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(API_ENDPOINTS.signup(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          role: data.role,
          agreeToTerms: data.agreeToTerms,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '회원가입 중 오류가 발생했습니다');
      }
      
      // 회원가입 성공 - 이메일 확인 안내
      setIsEmailSent(true);
      
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      
      const errorMessage = error.message || '회원가입 중 오류가 발생했습니다';
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

  // 이메일 확인 안내 화면
  if (isEmailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-6">
          <div className="text-green-600 text-lg font-medium mb-2">
            회원가입이 완료되었습니다! 🎉
          </div>
          <div className="text-green-700 text-sm">
            입력하신 이메일로 확인 메일을 발송했습니다.<br />
            메일의 링크를 클릭하여 계정을 활성화해주세요.
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
              onClick={() => {
                // 이메일 재발송 로직 추가 가능
                setIsEmailSent(false);
              }}
            >
              다시 가입하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 전체 에러 메시지 */}
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{authError}</div>
        </div>
      )}

      {/* 이름 입력 */}
      <Input
        label="이름"
        placeholder="이름을 입력하세요"
        {...register('name')}
        error={errors.name?.message}
        disabled={isLoading}
      />

      {/* 이메일 입력 */}
      <Input
        label="이메일"
        type="email"
        placeholder="이메일을 입력하세요"
        {...register('email')}
        error={errors.email?.message}
        disabled={isLoading}
      />

      {/* 전화번호 입력 (선택사항) */}
      <Input
        label="전화번호 (선택사항)"
        type="tel"
        placeholder="010-1234-5678"
        {...register('phone')}
        error={errors.phone?.message}
        disabled={isLoading}
      />

      {/* 역할 선택 */}
      <Select
        label="역할"
        options={roleOptions}
        {...register('role')}
        error={errors.role?.message}
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
          hint="최소 8자, 대문자/소문자/숫자 각각 1개 이상"
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

      {/* 비밀번호 확인 */}
      <div className="relative">
        <Input
          label="비밀번호 확인"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="비밀번호를 다시 입력하세요"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          disabled={isLoading}
        />
        <button
          type="button"
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 이용약관 동의 */}
      <Checkbox
        label={
          <span>
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
              이용약관
            </Link>
            {' '}및{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              개인정보처리방침
            </Link>
            에 동의합니다
          </span>
        }
        {...register('agreeToTerms')}
        error={errors.agreeToTerms?.message}
        disabled={isLoading}
      />

      {/* 회원가입 버튼 */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            가입 중...
          </>
        ) : (
          '회원가입'
        )}
      </Button>

      {/* 로그인 링크 */}
      <div className="text-center">
        <span className="text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link 
            href="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            로그인하기
          </Link>
        </span>
      </div>
    </form>
  );
} 