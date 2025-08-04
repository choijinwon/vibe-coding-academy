'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter,
  Clock,
  User,
  ChevronRight,
  Star,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Course {
  id: string;
  title: string;
  description: string;
  curriculum: any;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
  category?: string;
  level?: string;
  duration?: string;
  location?: string;
}

export default function CoursesPage() {
  const { user, isLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Mock 강의 데이터 (실제로는 API에서 가져올 예정)
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'React & Next.js 풀스택 개발',
        description: '현대적인 웹 개발을 위한 React와 Next.js를 활용한 풀스택 개발 과정입니다. TypeScript, Tailwind CSS, 서버리스 함수까지 모든 것을 다룹니다.',
        curriculum: {
          modules: [
            'React 기초와 Hook',
            'Next.js App Router',
            'TypeScript 심화',
            'Tailwind CSS 디자인',
            'API 개발과 데이터베이스',
            '배포와 운영'
          ]
        },
        instructor: {
          id: 'instructor1',
          name: '김개발',
          email: 'kim@example.com'
        },
        maxStudents: 20,
        currentStudents: 15,
        startDate: '2024-09-01',
        endDate: '2024-12-15',
        price: 480000,
        status: 'active',
        category: 'frontend',
        level: 'intermediate',
        duration: '16주',
        location: '온라인'
      },
      {
        id: '2',
        title: 'Python 백엔드 개발 마스터',
        description: 'Django와 FastAPI를 활용한 파이썬 백엔드 개발의 모든 것을 배웁니다. REST API부터 GraphQL, 데이터베이스 설계까지 포함됩니다.',
        curriculum: {
          modules: [
            'Python 기초 문법',
            'Django 웹 프레임워크',
            'FastAPI로 API 개발',
            'PostgreSQL 데이터베이스',
            'Redis 캐싱',
            'Docker 컨테이너화'
          ]
        },
        instructor: {
          id: 'instructor2',
          name: '박백엔드',
          email: 'park@example.com'
        },
        maxStudents: 25,
        currentStudents: 12,
        startDate: '2024-08-15',
        endDate: '2024-11-30',
        price: 420000,
        status: 'active',
        category: 'backend',
        level: 'beginner',
        duration: '14주',
        location: '강남센터'
      },
      {
        id: '3',
        title: 'AI & 머신러닝 실무',
        description: 'TensorFlow와 PyTorch를 활용한 실무 중심의 AI 개발 과정입니다. 컴퓨터 비전부터 자연어 처리까지 다양한 프로젝트를 진행합니다.',
        curriculum: {
          modules: [
            '머신러닝 기초 이론',
            'TensorFlow 실습',
            '딥러닝과 신경망',
            '컴퓨터 비전 프로젝트',
            '자연어 처리 응용',
            'MLOps와 배포'
          ]
        },
        instructor: {
          id: 'instructor3',
          name: '이인공지능',
          email: 'lee@example.com'
        },
        maxStudents: 15,
        currentStudents: 8,
        startDate: '2024-10-01',
        endDate: '2025-01-31',
        price: 680000,
        status: 'active',
        category: 'ai',
        level: 'advanced',
        duration: '18주',
        location: '온라인'
      }
    ];

    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  // 필터링된 강의 목록
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // 정렬된 강의 목록
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - b.price;
      case 'popular':
        return b.currentStudents - a.currentStudents;
      default:
        return 0;
    }
  });

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
          <p className="text-gray-600">강의 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">강의 목록</h1>
              <p className="mt-2 text-gray-600">바이브코딩 아카데미의 다양한 개발 강의를 만나보세요</p>
            </div>
            
            {user?.user_metadata?.role === 'instructor' || user?.user_metadata?.role === 'admin' ? (
              <Link href="/courses/create">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  새 강의 만들기
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="강의 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 카테고리 필터 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">모든 분야</option>
              <option value="frontend">프론트엔드</option>
              <option value="backend">백엔드</option>
              <option value="ai">AI/ML</option>
              <option value="mobile">모바일</option>
              <option value="devops">DevOps</option>
            </select>

            {/* 레벨 필터 */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">모든 레벨</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="price-low">가격낮은순</option>
              <option value="price-high">가격높은순</option>
            </select>
          </div>
        </div>

        {/* 강의 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* 강의 카드 */}
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level === 'beginner' ? '초급' : 
                         course.level === 'intermediate' ? '중급' : '고급'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {course.category === 'frontend' ? '프론트엔드' :
                         course.category === 'backend' ? '백엔드' :
                         course.category === 'ai' ? 'AI/ML' : course.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  </div>
                </div>

                {/* 강의 정보 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                {/* 강사 정보 */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>{course.instructor.name}</span>
                  </div>
                </div>

                {/* 통계 정보 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{course.currentStudents}/{course.maxStudents}명</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{course.location}</span>
                  </div>
                </div>

                {/* 가격 및 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-indigo-600">
                    {course.price === 0 ? '무료' : `₩${formatPrice(course.price)}`}
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline" className="group">
                      자세히 보기
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 강의가 없는 경우 */}
        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
} 