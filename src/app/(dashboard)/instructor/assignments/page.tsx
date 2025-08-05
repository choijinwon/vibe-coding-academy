'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Plus,
  FileText,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore: number;
  fileUrl?: string;
  createdAt: string;
  courseTitle: string;
  stats: {
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingGrading: number;
  };
}

export default function InstructorAssignmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses] = useState([
    { id: '1', title: 'React & Next.js 풀스택 개발' },
    { id: '2', title: 'Python 백엔드 개발 마스터' },
    { id: '3', title: 'AI & 머신러닝 실무' },
  ]);

  // Mock 과제 데이터
  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'React 컴포넌트 설계 과제',
      description: 'React의 함수형 컴포넌트와 Hook을 활용하여 Todo 앱을 만드는 과제입니다.',
      dueDate: '2024-02-15T23:59:00',
      maxScore: 100,
      createdAt: '2024-01-20T10:00:00',
      courseTitle: 'React & Next.js 풀스택 개발',
      stats: {
        totalSubmissions: 12,
        gradedSubmissions: 8,
        pendingGrading: 4,
      }
    },
    {
      id: '2',
      title: 'Next.js 라우팅 시스템 구현',
      description: 'Next.js의 App Router를 활용하여 블로그 사이트를 만드는 과제입니다.',
      dueDate: '2024-02-20T23:59:00',
      maxScore: 100,
      createdAt: '2024-01-25T14:30:00',
      courseTitle: 'React & Next.js 풀스택 개발',
      stats: {
        totalSubmissions: 8,
        gradedSubmissions: 3,
        pendingGrading: 5,
      }
    },
    {
      id: '3',
      title: 'Django REST API 개발',
      description: 'Django REST Framework를 사용하여 게시판 API를 구현하는 과제입니다.',
      dueDate: '2024-02-18T23:59:00',
      maxScore: 100,
      createdAt: '2024-01-22T09:15:00',
      courseTitle: 'Python 백엔드 개발 마스터',
      stats: {
        totalSubmissions: 10,
        gradedSubmissions: 10,
        pendingGrading: 0,
      }
    }
  ];

  // 권한 확인
  useEffect(() => {
    if (!isLoading && (!user || user.user_metadata?.role !== 'instructor')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // 과제 목록 로드
  useEffect(() => {
    loadAssignments();
  }, [selectedCourse]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredAssignments = mockAssignments;
      if (selectedCourse) {
        const courseTitle = courses.find(c => c.id === selectedCourse)?.title;
        filteredAssignments = mockAssignments.filter(a => a.courseTitle === courseTitle);
      }
      
      setAssignments(filteredAssignments);
    } catch (error) {
      console.error('과제 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('정말 이 과제를 삭제하시겠습니까? 모든 제출물도 함께 삭제됩니다.')) {
      return;
    }

    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      alert('과제가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('과제 삭제 실패:', error);
      alert('과제 삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (stats: Assignment['stats']) => {
    if (stats.pendingGrading === 0) return 'text-green-600 bg-green-100';
    if (stats.pendingGrading > stats.gradedSubmissions) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusText = (stats: Assignment['stats']) => {
    if (stats.totalSubmissions === 0) return '제출 없음';
    if (stats.pendingGrading === 0) return '채점 완료';
    return `${stats.pendingGrading}건 대기`;
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: '마감됨', color: 'text-red-600' };
    if (diffDays === 0) return { text: '오늘 마감', color: 'text-red-600' };
    if (diffDays === 1) return { text: '내일 마감', color: 'text-orange-600' };
    if (diffDays <= 3) return { text: `${diffDays}일 남음`, color: 'text-yellow-600' };
    return { text: `${diffDays}일 남음`, color: 'text-gray-600' };
  };

  // 검색 필터링
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">과제 관리</h1>
              <p className="text-gray-600">과제를 생성하고 학생들의 제출 현황을 관리하세요</p>
            </div>
            <Link href="/instructor/assignments/create">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                새 과제 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">필터 및 검색</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">강의 선택</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">모든 강의</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">과제 검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="과제 제목, 설명, 강의명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                고급 필터
              </Button>
            </div>
          </div>
        </div>

        {/* 과제 목록 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 inline mr-2" />
              과제 목록 ({filteredAssignments.length}개)
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">과제 목록을 불러오는 중...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">과제가 없습니다</h3>
              <p className="text-gray-500 mb-6">새로운 과제를 만들어 학생들에게 과제를 내주세요.</p>
              <Link href="/instructor/assignments/create">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  첫 번째 과제 만들기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                
                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.stats)}`}>
                            {getStatusText(assignment.stats)}
                          </span>
                          {daysUntilDue && (
                            <span className={`text-sm font-medium ${daysUntilDue.color}`}>
                              {daysUntilDue.text}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{assignment.courseTitle}</span>
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(assignment.dueDate).toLocaleDateString('ko-KR')}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{assignment.stats.totalSubmissions}명 제출</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>{assignment.stats.gradedSubmissions}명 채점 완료</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/instructor/assignments/${assignment.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Button>
                        </Link>
                        <Link href={`/instructor/assignments/${assignment.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            수정
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 