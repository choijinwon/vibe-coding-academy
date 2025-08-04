'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  Award, 
  MessageSquare, 
  ArrowRight,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  Globe,
  Code,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // 인기 강의 데이터
  const featuredCourses = [
    {
      id: '1',
      title: 'React & Next.js 풀스택 개발',
      description: '현대적인 웹 개발을 위한 React와 Next.js 완전 정복',
      instructor: '김개발',
      rating: 4.8,
      students: 234,
      price: 480000,
      originalPrice: 600000,
      duration: '16주',
      level: '중급',
      category: 'Frontend',
      image: '/images/react-course.jpg'
    },
    {
      id: '2',
      title: 'Python 백엔드 개발 마스터',
      description: 'Django와 FastAPI로 확장 가능한 백엔드 시스템 구축',
      instructor: '박백엔드',
      rating: 4.9,
      students: 189,
      price: 420000,
      originalPrice: 520000,
      duration: '14주',
      level: '초급-중급',
      category: 'Backend',
      image: '/images/python-course.jpg'
    },
    {
      id: '3',
      title: 'AI & 머신러닝 실무',
      description: 'TensorFlow와 PyTorch로 실무 AI 시스템 개발',
      instructor: '이인공지능',
      rating: 4.7,
      students: 156,
      price: 680000,
      originalPrice: 800000,
      duration: '18주',
      level: '고급',
      category: 'AI/ML',
      image: '/images/ai-course.jpg'
    }
  ];

  const stats = [
    { label: '누적 수강생', value: '1,200+', icon: Users, color: 'text-blue-600' },
    { label: '강의 완주율', value: '95%', icon: TrendingUp, color: 'text-green-600' },
    { label: '평균 만족도', value: '4.8/5', icon: Star, color: 'text-yellow-600' },
    { label: '취업 성공률', value: '87%', icon: Award, color: 'text-purple-600' },
  ];

  const testimonials = [
    {
      name: '김수현',
      role: '프론트엔드 개발자',
      company: '네이버',
      content: '바이브코딩 아카데미 덕분에 꿈꾸던 개발자가 될 수 있었어요. 실무 중심의 커리큘럼이 정말 도움이 되었습니다.',
      rating: 5
    },
    {
      name: '이정우',
      role: '백엔드 개발자',
      company: '카카오',
      content: '1:1 멘토링과 코드 리뷰를 통해 빠르게 실력을 향상시킬 수 있었어요. 강사님들의 피드백이 정말 값졌습니다.',
      rating: 5
    },
    {
      name: '박민지',
      role: 'AI 엔지니어',
      company: '삼성전자',
      content: '이론뿐만 아니라 실제 프로젝트까지 경험할 수 있어서 취업 준비에 큰 도움이 되었습니다.',
      rating: 5
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

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
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/courses" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  강의
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  소개
                </Link>
                <Link href="/community" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  커뮤니티
                </Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl">
            <span className="block">더 나은 개발자로의</span>
            <span className="block text-indigo-600">성장 여정을 시작하세요</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            실무 중심의 커리큘럼과 1:1 멘토링으로 여러분의 개발 실력을 한 단계 업그레이드하세요. 
            현업 전문가들이 직접 가르치는 생생한 실무 경험을 얻을 수 있습니다.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4">
                <BookOpen className="h-5 w-5 mr-2" />
                강의 둘러보기
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4">
                더 알아보기
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">신뢰할 수 있는 교육 플랫폼</h2>
            <p className="mt-4 text-lg text-gray-600">숫자로 확인하는 바이브코딩 아카데미의 성과</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">인기 강의</h2>
            <p className="mt-4 text-lg text-gray-600">가장 많은 수강생들이 선택한 실무 중심 강의들</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="p-6">
                  {/* Course Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      course.level === '초급' ? 'bg-green-100 text-green-800' :
                      course.level === '중급' ? 'bg-yellow-100 text-yellow-800' :
                      course.level === '초급-중급' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                  {/* Course Info */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="mr-4">{course.students}명</span>
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="mr-4">{course.rating}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>

                  {/* Instructor */}
                  <div className="text-sm text-gray-600 mb-4">
                    강사: {course.instructor}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600">₩{formatPrice(course.price)}</span>
                      {course.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">₩{formatPrice(course.originalPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Play className="h-4 w-4 mr-2" />
                      강의 상세보기
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/courses">
              <Button size="lg" variant="outline" className="group">
                모든 강의 보기
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">핵심 기능</h2>
            <p className="mt-4 text-lg text-gray-600">교육에 필요한 모든 기능을 하나의 플랫폼에서</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">강의 관리</h3>
              <p className="text-gray-600">수강신청부터 결제까지 원스톱 처리</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">출석 관리</h3>
              <p className="text-gray-600">실시간 출석 체크와 현황 분석</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">과제 시스템</h3>
              <p className="text-gray-600">체계적인 과제 관리와 피드백</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">커뮤니티</h3>
              <p className="text-gray-600">Q&A와 자유로운 소통 공간</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">수강생 후기</h2>
            <p className="mt-4 text-lg text-gray-600">실제 수강생들의 생생한 경험담</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 개발자 여정을 시작하세요
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            실무 경험이 풍부한 강사진과 함께 체계적인 커리큘럼으로 성공적인 개발자가 되어보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <BookOpen className="h-5 w-5 mr-2" />
                강의 둘러보기
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                무료 회원가입
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">바이브코딩 아카데미</h3>
              <p className="text-gray-400 mb-4">
                실무 중심의 프로그래밍 교육으로 여러분의 개발자 꿈을 현실로 만들어드립니다.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">빠른 링크</h4>
              <ul className="space-y-2">
                <li><Link href="/courses" className="text-gray-400 hover:text-white">강의</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">소개</Link></li>
                <li><Link href="/community" className="text-gray-400 hover:text-white">커뮤니티</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">계정</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 hover:text-white">로그인</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white">회원가입</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white">대시보드</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">&copy; 2024 바이브코딩 아카데미. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
