'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { RegisterForm } from '@/components/forms/register-form';
import { APP_CONFIG } from '@/constants';

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-indigo-600">{APP_CONFIG.NAME}</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          새 계정 만들기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          이메일과 비밀번호로 간편하게 가입하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
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