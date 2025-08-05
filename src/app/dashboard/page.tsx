'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  Award, 
  MessageSquare, 
  Settings, 
  LogOut,
  Calendar,
  FileText,
  Bell,
  PlusCircle,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle
} from 'lucide-react';

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

  // 역할별 메뉴 구성
  const getMenuItems = () => {
    const commonItems = [
      { href: '/courses', label: '강의 목록', icon: BookOpen },
      { href: '/announcements', label: '공지사항', icon: Bell },
      { href: '/community', label: '커뮤니티', icon: MessageSquare },
      { href: '/analytics', label: '학습 분석', icon: BarChart3 },
    ];

    const studentItems = [
      { href: '/my-courses', label: '내 강의', icon: BookOpen },
      { href: '/assignments', label: '과제', icon: FileText },
      { href: '/attendance', label: '출석 현황', icon: Calendar },
      ...commonItems,
    ];

    const instructorItems = [
      { href: '/instructor/courses', label: '강의 관리', icon: BookOpen },
      { href: '/instructor/students', label: '학생 관리', icon: Users },
      { href: '/instructor/assignments', label: '과제 관리', icon: FileText },
      { href: '/instructor/attendance', label: '출석 관리', icon: Calendar },
      { href: '/instructor/announcements', label: '공지사항 관리', icon: Bell },
      ...commonItems,
    ];

    const adminItems = [
      { href: '/admin/courses', label: '강의 관리', icon: BookOpen },
      { href: '/admin/users', label: '사용자 관리', icon: Users },
      { href: '/admin/registrations', label: '수강신청 관리', icon: Award },
      { href: '/admin/analytics', label: '종합 분석', icon: TrendingUp },
      { href: '/instructor/announcements', label: '공지사항 관리', icon: Bell },
      ...commonItems,
    ];

    switch (userRole) {
      case 'instructor':
        return instructorItems;
      case 'admin':
        return adminItems;
      default:
        return studentItems;
    }
  };

  // 역할별 퀵 액션
  const getQuickActions = () => {
    switch (userRole) {
      case 'instructor':
        return [
          {
            title: '새 강의 만들기',
            description: '새로운 강의를 개설하세요',
            href: '/courses/create',
            icon: PlusCircle,
            color: 'bg-blue-500'
          },
          {
            title: '출석 체크',
            description: '오늘 수업 출석을 체크하세요',
            href: '/instructor/attendance/check',
            icon: Calendar,
            color: 'bg-green-500'
          },
          {
            title: '과제 등록',
            description: '새로운 과제를 등록하세요',
            href: '/instructor/assignments/create',
            icon: FileText,
            color: 'bg-purple-500'
          },
          {
            title: '공지사항 작성',
            description: '학생들에게 중요한 소식을 전달하세요',
            href: '/instructor/announcements',
            icon: Bell,
            color: 'bg-yellow-500'
          },
          {
            title: '커뮤니티 답변',
            description: '학생들의 질문에 답변해주세요',
            href: '/community',
            icon: MessageSquare,
            color: 'bg-orange-500'
          },
          {
            title: '학습 분석',
            description: '강의 성과와 학생 진도를 분석하세요',
            href: '/analytics',
            icon: BarChart3,
            color: 'bg-indigo-500'
          }
        ];
      case 'admin':
        return [
          {
            title: '수강신청 승인',
            description: '대기 중인 수강신청을 확인하세요',
            href: '/admin/registrations',
            icon: Award,
            color: 'bg-indigo-500'
          },
          {
            title: '사용자 관리',
            description: '사용자 계정을 관리하세요',
            href: '/admin/users',
            icon: Users,
            color: 'bg-gray-500'
          },
          {
            title: '공지사항 작성',
            description: '새로운 공지사항을 작성하세요',
            href: '/instructor/announcements',
            icon: Bell,
            color: 'bg-yellow-500'
          },
          {
            title: '커뮤니티 관리',
            description: '커뮤니티를 관리하고 답변해주세요',
            href: '/community',
            icon: MessageSquare,
            color: 'bg-orange-500'
          },
          {
            title: '종합 분석',
            description: '전체 플랫폼 성과를 분석하세요',
            href: '/analytics',
            icon: TrendingUp,
            color: 'bg-red-500'
          }
        ];
      default:
        return [
          {
            title: '강의 둘러보기',
            description: '새로운 강의를 찾아보세요',
            href: '/courses',
            icon: BookOpen,
            color: 'bg-blue-500'
          },
          {
            title: '과제 확인',
            description: '제출해야 할 과제를 확인하세요',
            href: '/assignments',
            icon: FileText,
            color: 'bg-green-500'
          },
          {
            title: '출석 현황',
            description: '내 출석 현황을 확인하세요',
            href: '/attendance',
            icon: Calendar,
            color: 'bg-purple-500'
          },
          {
            title: '질문하기',
            description: '궁금한 점을 커뮤니티에 질문하세요',
            href: '/community/write',
            icon: MessageSquare,
            color: 'bg-orange-500'
          },
          {
            title: '학습 분석',
            description: '내 학습 진도와 성과를 확인하세요',
            href: '/analytics',
            icon: BarChart3,
            color: 'bg-indigo-500'
          }
        ];
    }
  };

  const menuItems = getMenuItems();
  const quickActions = getQuickActions();

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
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {userRole === 'student' ? '학생' : 
                 userRole === 'instructor' ? '강사' : '관리자'}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">
              환영합니다, {userName}님! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              {userRole === 'student' && '오늘도 새로운 것을 배워보세요!'}
              {userRole === 'instructor' && '학생들의 성장을 도와주세요!'}
              {userRole === 'admin' && '플랫폼을 효율적으로 관리하세요!'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 실행</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-indigo-100 transition-colors duration-200">
                    <item.icon className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {item.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity or Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 최근 활동 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">새로운 과제를 제출했습니다</p>
                    <p className="text-xs text-gray-500">2시간 전</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">React 강의에 참여했습니다</p>
                    <p className="text-xs text-gray-500">1일 전</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">커뮤니티에 질문을 올렸습니다</p>
                    <p className="text-xs text-gray-500">3일 전</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">나의 현황</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">출석률</span>
                  <span className="text-sm font-semibold text-green-600">92%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">과제 완성도</span>
                  <span className="text-sm font-semibold text-blue-600">85%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">학습 진도</span>
                  <span className="text-sm font-semibold text-purple-600">78%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link 
                  href="/analytics"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  상세 분석 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 