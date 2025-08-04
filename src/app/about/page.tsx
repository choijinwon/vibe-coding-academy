'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  Zap, 
  Heart,
  Code,
  Laptop,
  Globe,
  CheckCircle,
  Star,
  TrendingUp,
  MessageCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const stats = [
    { label: '수강생', value: '500+', icon: Users },
    { label: '완주율', value: '95%', icon: TrendingUp },
    { label: '만족도', value: '4.9/5', icon: Star },
    { label: '수료생', value: '300+', icon: Award },
  ];

  const values = [
    {
      icon: Target,
      title: '실무 중심 교육',
      description: '이론보다는 실제 프로젝트를 통해 현업에서 바로 사용할 수 있는 실력을 키웁니다.',
      color: 'bg-blue-500'
    },
    {
      icon: Heart,
      title: '학습자 중심',
      description: '개인의 학습 속도와 목표에 맞춰 맞춤형 교육과 1:1 멘토링을 제공합니다.',
      color: 'bg-red-500'
    },
    {
      icon: Zap,
      title: '최신 기술',
      description: '빠르게 변화하는 IT 트렌드에 맞춰 최신 기술과 도구를 교육 과정에 반영합니다.',
      color: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: '커뮤니티',
      description: '동료 학습자들과의 네트워킹과 지속적인 성장을 위한 커뮤니티를 제공합니다.',
      color: 'bg-green-500'
    }
  ];

  const instructors = [
    {
      name: '김개발',
      role: 'Frontend 전문가',
      experience: '10년+ 경력',
      specialties: ['React', 'Next.js', 'TypeScript'],
      description: '네이버, 카카오에서 근무한 풀스택 개발자. 현재 스타트업 CTO로 활동 중.',
      avatar: '/avatars/instructor1.jpg'
    },
    {
      name: '박백엔드',
      role: 'Backend 아키텍트',
      experience: '8년+ 경력',
      specialties: ['Python', 'Django', 'AWS'],
      description: '대용량 서비스 설계 경험을 바탕으로 확장 가능한 백엔드 시스템을 교육.',
      avatar: '/avatars/instructor2.jpg'
    },
    {
      name: '이인공지능',
      role: 'AI/ML 연구원',
      experience: '6년+ 경력',
      specialties: ['TensorFlow', 'PyTorch', 'MLOps'],
      description: 'Google AI 연구원 출신으로 실무에 적용 가능한 AI 기술을 전수.',
      avatar: '/avatars/instructor3.jpg'
    }
  ];

  const programs = [
    {
      title: 'Frontend 마스터',
      duration: '16주',
      level: '중급',
      description: 'React와 Next.js를 활용한 현대적 웹 개발',
      topics: ['React 18', 'Next.js 13+', 'TypeScript', 'Tailwind CSS'],
      icon: Code
    },
    {
      title: 'Backend 아키텍트',
      duration: '14주',
      level: '초급-중급',
      description: 'Python과 Django를 활용한 백엔드 개발',
      topics: ['Django', 'FastAPI', 'PostgreSQL', 'Docker'],
      icon: Laptop
    },
    {
      title: 'AI 개발자',
      duration: '18주',
      level: '고급',
      description: 'TensorFlow와 PyTorch를 활용한 AI 개발',
      topics: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP'],
      icon: Globe
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              홈으로 돌아가기
            </Link>
            <Link href="/courses">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <BookOpen className="h-4 w-4 mr-2" />
                강의 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">바이브코딩 아카데미</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            실무 중심의 프로그래밍 교육을 통해 여러분의 개발자 꿈을 현실로 만들어드립니다.
            이론보다는 실제 프로젝트, 암기보다는 문제 해결 능력을 키우는 교육을 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                강의 시작하기
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">우리의 비전</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              모든 사람이 코딩을 통해 자신의 아이디어를 현실로 만들 수 있는 세상을 만들어가고 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${value.color} rounded-lg flex items-center justify-center mb-6`}>
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Programs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">교육 과정</h2>
            <p className="text-xl text-gray-600">
              체계적이고 실무 중심의 커리큘럼으로 구성된 다양한 프로그램을 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <program.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="mr-3">{program.duration}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        program.level === '초급' ? 'bg-green-100 text-green-800' :
                        program.level === '중급' ? 'bg-yellow-100 text-yellow-800' :
                        program.level === '초급-중급' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {program.level}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{program.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">주요 기술:</h4>
                  <div className="flex flex-wrap gap-2">
                    {program.topics.map((topic, topicIndex) => (
                      <span key={topicIndex} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">강사진</h2>
            <p className="text-xl text-gray-600">
              현업에서 활동하는 전문가들이 직접 가르치는 실무 중심 교육
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instructors.map((instructor, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{instructor.name}</h3>
                  <p className="text-indigo-600 font-medium">{instructor.role}</p>
                  <p className="text-sm text-gray-500">{instructor.experience}</p>
                </div>
                
                <p className="text-gray-600 mb-4">{instructor.description}</p>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">전문 분야:</h4>
                  <div className="flex flex-wrap gap-2">
                    {instructor.specialties.map((specialty, specialtyIndex) => (
                      <span key={specialtyIndex} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                왜 바이브코딩 아카데미를 선택해야 할까요?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">실무 중심 프로젝트</h3>
                    <p className="text-gray-600">실제 기업에서 사용하는 프로젝트를 통해 포트폴리오를 완성합니다.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">1:1 멘토링</h3>
                    <p className="text-gray-600">개인별 맞춤 피드백과 코드 리뷰를 통한 실력 향상을 보장합니다.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">취업 지원</h3>
                    <p className="text-gray-600">이력서 작성부터 면접 준비까지 취업 성공을 위한 토탈 케어를 제공합니다.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">평생 학습 지원</h3>
                    <p className="text-gray-600">수료 후에도 지속적인 학습과 네트워킹을 위한 커뮤니티를 제공합니다.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">지금 시작하세요!</h3>
                <p className="text-gray-600 mb-8">
                  무료 상담을 통해 여러분에게 맞는 교육 과정을 찾아보세요.
                </p>
                <div className="space-y-4">
                  <Link href="/courses">
                    <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700">
                      강의 둘러보기
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="w-full">
                      무료 회원가입
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span>궁금한 점이 있으시면 언제든 문의해주세요</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            개발자로의 여정을 함께 시작해보세요
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            체계적인 커리큘럼과 전문 강사진이 여러분의 성공적인 개발자 커리어를 응원합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <BookOpen className="h-5 w-5 mr-2" />
                강의 살펴보기
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                <Users className="h-5 w-5 mr-2" />
                지금 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">바이브코딩 아카데미</h3>
            <p className="text-gray-400 mb-8">실무 중심의 프로그래밍 교육으로 여러분의 꿈을 현실로</p>
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-400">&copy; 2024 바이브코딩 아카데미. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 