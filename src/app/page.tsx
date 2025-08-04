'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, Award, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
                                 <div className="flex-shrink-0">
                     <h1 className="text-2xl font-bold text-indigo-600">바이브코딩 아카데미</h1>
                   </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated ? (
                <>
                  <span className="text-gray-700">
                    안녕하세요, {user?.user_metadata?.full_name || user?.email}님
                  </span>
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                    대시보드
                  </Link>
                  <Button onClick={logout} variant="outline" size="sm">
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                    로그인
                  </Link>
                  <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl">
            <span className="block">더 나은 교육을 위한</span>
            <span className="block text-indigo-600">종합 학습 플랫폼</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            강의 수강부터 과제 제출, 출석 관리까지 모든 교육 과정을 하나의 플랫폼에서 관리하세요.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/courses"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                강의 둘러보기
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/about"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                더 알아보기
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">핵심 기능</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              교육에 필요한 모든 기능
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">강의 관리</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  강의 정보 확인, 수강신청, 결제까지 원스톱으로 처리할 수 있습니다.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">출석 관리</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  실시간 출석 체크와 출석률 관리로 학습 현황을 한눈에 파악하세요.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">과제 시스템</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  과제 업로드부터 제출, 피드백까지 체계적인 과제 관리 시스템입니다.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">커뮤니티</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Q&A 게시판과 자유게시판을 통해 활발한 소통이 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                         <p className="text-gray-400">&copy; 2024 바이브코딩 아카데미. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
