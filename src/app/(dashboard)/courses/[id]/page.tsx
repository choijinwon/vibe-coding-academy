'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  User,
  CheckCircle,
  Star,
  MapPin,
  Globe,
  ArrowLeft,
  Play,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  description: string;
  curriculum: {
    modules: string[];
    totalDuration: string;
    projects: string[];
    certificates: string[];
  };
  instructor: {
    id: string;
    name: string;
    email: string;
    bio: string;
    experience: string;
    avatar: string;
    specialties: string[];
  };
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  price: number;
  originalPrice?: number;
  status: string;
  category: string;
  level: string;
  duration: string;
  location: string;
  requirements: string[];
  whatYouWillLearn: string[];
  features: string[];
  rating: number;
  reviewCount: number;
  isEnrolled?: boolean;
}

interface CourseDetailPageProps {
  params: { id: string };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Mock 강의 상세 데이터
  useEffect(() => {
    const mockCourse: Course = {
      id: params.id,
      title: 'React & Next.js 풀스택 개발',
      description: '현대적인 웹 개발을 위한 React와 Next.js를 활용한 풀스택 개발 과정입니다. TypeScript, Tailwind CSS, 서버리스 함수까지 모든 것을 다룹니다. 실무에서 바로 사용할 수 있는 실전 프로젝트들을 통해 포트폴리오를 완성하세요.',
      curriculum: {
        modules: [
          'React 기초와 Hook',
          'Next.js App Router',
          'TypeScript 심화',
          'Tailwind CSS 디자인',
          'API 개발과 데이터베이스',
          '배포와 운영',
          '성능 최적화',
          '테스팅과 품질 관리'
        ],
        totalDuration: '120시간',
        projects: [
          '개인 포트폴리오 웹사이트',
          'E-commerce 플랫폼',
          '실시간 채팅 애플리케이션',
          'CMS 관리 시스템'
        ],
        certificates: [
          '수료증 발급',
          'GitHub 포트폴리오',
          '프로젝트 피드백 레포트'
        ]
      },
      instructor: {
        id: 'instructor1',
        name: '김개발',
        email: 'kim@example.com',
        bio: '10년 이상의 웹 개발 경험을 보유한 풀스택 개발자입니다. 네이버, 카카오에서 근무했으며, 현재는 스타트업 CTO로 활동하고 있습니다.',
        experience: '10년+ 웹 개발 경험',
        avatar: '/avatars/instructor1.jpg',
        specialties: ['React', 'Next.js', 'TypeScript', 'Node.js', 'AWS']
      },
      maxStudents: 20,
      currentStudents: 15,
      startDate: '2024-09-01',
      endDate: '2024-12-15',
      price: 480000,
      originalPrice: 600000,
      status: 'active',
      category: 'frontend',
      level: 'intermediate',
      duration: '16주',
      location: '온라인',
      requirements: [
        'JavaScript 기초 문법 이해',
        'HTML/CSS 기본 지식',
        '프로그래밍 경험 (언어 무관)',
        '학습 의지와 열정'
      ],
      whatYouWillLearn: [
        'React 18 최신 기능과 Hook 완벽 이해',
        'Next.js 13+ App Router 마스터',
        'TypeScript로 타입 안전한 코드 작성',
        'Tailwind CSS로 빠른 UI 개발',
        'REST API와 GraphQL 설계 및 구현',
        'PostgreSQL 데이터베이스 설계',
        'AWS/Vercel 배포 및 CI/CD 구축',
        '성능 최적화 및 SEO 전략'
      ],
      features: [
        '실무 중심 프로젝트',
        '1:1 멘토링',
        '무제한 질의응답',
        '취업 지원 서비스',
        '평생 강의 복습',
        '커뮤니티 지원'
      ],
      rating: 4.8,
      reviewCount: 127,
      isEnrolled: false
    };

    setTimeout(() => {
      setCourse(mockCourse);
      setLoading(false);
    }, 800);
  }, [params.id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      // TODO: 실제 수강신청 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 결제 페이지로 이동 또는 결제 모달 표시
      router.push(`/courses/${params.id}/payment`);
    } catch (error) {
      console.error('수강신청 실패:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">강의 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">강의를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 강의가 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <Link href="/courses">
            <Button>강의 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center mb-8">
            <Link href="/courses" className="flex items-center text-indigo-200 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              강의 목록으로
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 강의 정보 */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level === 'beginner' ? '초급' : 
                   course.level === 'intermediate' ? '중급' : '고급'}
                </span>
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {course.category === 'frontend' ? '프론트엔드' :
                   course.category === 'backend' ? '백엔드' :
                   course.category === 'ai' ? 'AI/ML' : course.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-indigo-100 mb-6">{course.description}</p>

              {/* 통계 */}
              <div className="flex items-center gap-6 text-indigo-200">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium text-white">{course.rating}</span>
                  <span className="ml-1">({course.reviewCount}개 리뷰)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{course.currentStudents}명 수강 중</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  <span>{course.location}</span>
                </div>
              </div>
            </div>

            {/* 수강신청 카드 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {course.price === 0 ? '무료' : `₩${formatPrice(course.price)}`}
                  </div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div className="text-lg text-gray-500 line-through">
                      ₩{formatPrice(course.originalPrice)}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">수강 시작일</span>
                    <span className="font-medium">{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">수강 종료일</span>
                    <span className="font-medium">{formatDate(course.endDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">남은 자리</span>
                    <span className="font-medium text-indigo-600">
                      {course.maxStudents - course.currentStudents}자리
                    </span>
                  </div>
                </div>

                {course.isEnrolled ? (
                  <Button className="w-full" disabled>
                    이미 수강 중인 강의입니다
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleEnroll}
                    disabled={isEnrolling || course.currentStudents >= course.maxStudents}
                  >
                    {isEnrolling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        처리 중...
                      </>
                    ) : course.currentStudents >= course.maxStudents ? (
                      '정원이 가득 찼습니다'
                    ) : (
                      '지금 수강신청하기'
                    )}
                  </Button>
                )}

                <div className="mt-4 text-xs text-center text-gray-500">
                  30일 환불 보장 정책
                </div>

                {/* 강의 특징 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">이 강의의 특징</h4>
                  <div className="space-y-2">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 내용 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'curriculum', label: '커리큘럼' },
                  { id: 'instructor', label: '강사 소개' },
                  { id: 'requirements', label: '수강 요건' },
                  { id: 'reviews', label: '수강 후기' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === 'curriculum' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">배우게 될 내용</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">강의 커리큘럼</h3>
                  <div className="space-y-3">
                    {course.curriculum.modules.map((module, index) => (
                      <div key={index} className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{module}</h4>
                        </div>
                        <Play className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">프로젝트</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.curriculum.projects.map((project, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Target className="h-5 w-5 text-indigo-600 mr-2" />
                          <h4 className="font-medium text-gray-900">{project}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{course.instructor.name}</h3>
                      <p className="text-indigo-600 font-medium mb-3">{course.instructor.experience}</p>
                      <p className="text-gray-700 mb-4">{course.instructor.bio}</p>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">전문 분야</h4>
                        <div className="flex flex-wrap gap-2">
                          {course.instructor.specialties.map((specialty, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">수강 요건</h3>
                  <div className="space-y-3">
                    {course.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start">
                        <Zap className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">수강 후기</h3>
                  <p className="text-gray-500">아직 등록된 후기가 없습니다.</p>
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 빠른 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">강의 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">총 수업 시간</span>
                    <span className="font-medium">{course.curriculum.totalDuration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">수업 방식</span>
                    <span className="font-medium">{course.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">수료증</span>
                    <span className="font-medium text-green-600">발급</span>
                  </div>
                </div>
              </div>

              {/* 공유하기 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">이 강의를 공유해보세요</h3>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    공유
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    찜하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 