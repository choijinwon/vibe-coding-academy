'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, MessageSquare, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userRole = user?.user_metadata?.role || 'student';
  const userName = user?.user_metadata?.full_name || user?.email || '사용자';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                바이브코딩 아카데미
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                안녕하세요, {userName}님
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                대시보드
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {userRole === 'student' && '학생 대시보드에 오신 것을 환영합니다!'}
                {userRole === 'instructor' && '강사 대시보드에 오신 것을 환영합니다!'}
                {userRole === 'admin' && '관리자 대시보드에 오신 것을 환영합니다!'}
              </p>

              {/* User Info Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    내 정보
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">이메일</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">역할</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userRole === 'student' && '학생'}
                        {userRole === 'instructor' && '강사'}
                        {userRole === 'admin' && '관리자'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">가입일</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(user?.created_at || '').toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">상태</dt>
                      <dd className="mt-1 text-sm text-green-600">활성</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          강의
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          준비 중
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <div className="text-sm">
                      <Link href="/courses" className="font-medium text-indigo-600 hover:text-indigo-500">
                        강의 보기
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Award className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          과제
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          준비 중
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <div className="text-sm">
                      <Link href="/assignments" className="font-medium text-indigo-600 hover:text-indigo-500">
                        과제 보기
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          출석
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          준비 중
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <div className="text-sm">
                      <Link href="/attendance" className="font-medium text-indigo-600 hover:text-indigo-500">
                        출석 보기
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageSquare className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          커뮤니티
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          준비 중
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <div className="text-sm">
                      <Link href="/community" className="font-medium text-indigo-600 hover:text-indigo-500">
                        커뮤니티 보기
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div className="mt-8">
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 