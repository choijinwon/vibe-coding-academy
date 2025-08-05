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
  TrendingUp
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
      { href: '/admin/analytics', label: '분석', icon: TrendingUp },
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
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {userName}님! 👋
          </h1>
          <p className="text-gray-600">
            {userRole === 'student' ? '오늘도 열심히 학습해보세요!' :
             userRole === 'instructor' ? '학생들의 성장을 함께 만들어가세요!' :
             '바이브코딩 아카데미를 관리해주세요!'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 실행</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${action.color} p-3 rounded-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistics Cards (역할별 다른 통계) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {userRole === 'student' && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">수강 중인 강의</p>
                      <p className="text-2xl font-bold text-gray-900">3개</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">제출할 과제</p>
                      <p className="text-2xl font-bold text-gray-900">2개</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">출석률</p>
                      <p className="text-2xl font-bold text-gray-900">95%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Award className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">완료한 강의</p>
                      <p className="text-2xl font-bold text-gray-900">1개</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {userRole === 'instructor' && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">담당 강의</p>
                      <p className="text-2xl font-bold text-gray-900">2개</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">총 학생 수</p>
                      <p className="text-2xl font-bold text-gray-900">47명</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">채점 대기</p>
                      <p className="text-2xl font-bold text-gray-900">12개</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">평균 만족도</p>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">전체 강의</p>
                      <p className="text-2xl font-bold text-gray-900">8개</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">전체 사용자</p>
                      <p className="text-2xl font-bold text-gray-900">234명</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">승인 대기</p>
                      <p className="text-2xl font-bold text-gray-900">5개</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">이번 달 수익</p>
                      <p className="text-2xl font-bold text-gray-900">₩2,400만</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                      {item.label}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">최근 활동</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900">React 강의에 새로운 과제가 등록되었습니다.</p>
                  <p className="text-xs text-gray-500">2시간 전</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900">Python 백엔드 강의 출석이 체크되었습니다.</p>
                  <p className="text-xs text-gray-500">1일 전</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900">새로운 공지사항이 등록되었습니다.</p>
                  <p className="text-xs text-gray-500">3일 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 