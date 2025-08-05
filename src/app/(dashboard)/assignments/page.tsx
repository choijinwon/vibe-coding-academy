'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Download,
  Star,
  AlertCircle,
  Filter,
  Search,
  BookOpen
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
  submission?: {
    id: string;
    content?: string;
    fileUrl?: string;
    score?: number;
    feedback?: string;
    submittedAt: string;
    gradedAt?: string;
  };
  isSubmitted: boolean;
  isGraded: boolean;
}

export default function StudentAssignmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      submission: {
        id: 'sub1',
        content: 'React Hook을 활용한 Todo 앱을 구현했습니다. useState와 useEffect를 사용하여 상태 관리를 했고...',
        fileUrl: 'https://example.com/assignment1.zip',
        score: 95,
        feedback: '매우 잘 구현되었습니다. 코드의 가독성도 좋고 기능 구현도 완벽합니다. 다만 에러 처리 부분을 더 보강하면 좋겠습니다.',
        submittedAt: '2024-02-14T18:30:00',
        gradedAt: '2024-02-16T10:00:00',
      },
      isSubmitted: true,
      isGraded: true,
    },
    {
      id: '2',
      title: 'Next.js 라우팅 시스템 구현',
      description: 'Next.js의 App Router를 활용하여 블로그 사이트를 만드는 과제입니다.',
      dueDate: '2024-02-20T23:59:00',
      maxScore: 100,
      createdAt: '2024-01-25T14:30:00',
      courseTitle: 'React & Next.js 풀스택 개발',
      submission: {
        id: 'sub2',
        content: 'Next.js App Router를 사용하여 블로그 사이트를 구현했습니다.',
        fileUrl: 'https://example.com/assignment2.zip',
        submittedAt: '2024-02-19T20:15:00',
      },
      isSubmitted: true,
      isGraded: false,
    },
    {
      id: '3',
      title: 'TypeScript 기초 연습',
      description: 'TypeScript의 타입 시스템을 활용하여 간단한 계산기를 만드는 과제입니다.',
      dueDate: '2024-02-25T23:59:00',
      maxScore: 100,
      createdAt: '2024-01-30T09:00:00',
      courseTitle: 'React & Next.js 풀스택 개발',
      isSubmitted: false,
      isGraded: false,
    }
  ];

  // 권한 확인
  useEffect(() => {
    if (!isLoading && (!user || user.user_metadata?.role !== 'student')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // 과제 목록 로드
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('과제 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (assignment: Assignment) => {
    if (assignment.isGraded && assignment.submission?.score !== undefined) {
      const score = assignment.submission.score;
      const percentage = (score / assignment.maxScore) * 100;
      let color = 'text-gray-600';
      if (percentage >= 90) color = 'text-green-600';
      else if (percentage >= 80) color = 'text-blue-600';
      else if (percentage >= 70) color = 'text-yellow-600';
      else color = 'text-red-600';
      
      return {
        text: `${score}/${assignment.maxScore}점 (${percentage.toFixed(0)}%)`,
        icon: Star,
        color,
        bgColor: color.replace('text-', 'bg-').replace('-600', '-100'),
      };
    }
    
    if (assignment.isSubmitted) {
      return {
        text: '제출 완료',
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    }
    
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const now = new Date();
    
    if (dueDate && dueDate < now) {
      return {
        text: '미제출',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    }
    
    return {
      text: '제출 대기',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
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

  // 필터링
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (statusFilter) {
      case 'submitted':
        return assignment.isSubmitted;
      case 'graded':
        return assignment.isGraded;
      case 'pending':
        return !assignment.isSubmitted;
      default:
        return true;
    }
  });

  // 통계 계산
  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.isSubmitted).length,
    graded: assignments.filter(a => a.isGraded).length,
    pending: assignments.filter(a => !a.isSubmitted).length,
    averageScore: assignments.filter(a => a.submission?.score !== undefined).length > 0
      ? Math.round(
          assignments
            .filter(a => a.submission?.score !== undefined)
            .reduce((sum, a) => sum + (a.submission?.score || 0), 0) /
          assignments.filter(a => a.submission?.score !== undefined).length
        )
      : 0,
  };

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 과제</h1>
            <p className="text-gray-600">수강 중인 강의의 과제를 확인하고 제출하세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">전체 과제</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-gray-500">제출 완료</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
            <div className="text-sm text-gray-500">채점 완료</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">제출 대기</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.averageScore}</div>
            <div className="text-sm text-gray-500">평균 점수</div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">필터 및 검색</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태 필터</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">모든 과제</option>
                <option value="pending">제출 대기</option>
                <option value="submitted">제출 완료</option>
                <option value="graded">채점 완료</option>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? '검색 결과가 없습니다' : '과제가 없습니다'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? '검색 조건을 변경해보세요.' 
                  : '아직 등록된 과제가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const statusInfo = getStatusInfo(assignment);
                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor} flex items-center`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.text}
                          </span>
                          {daysUntilDue && (
                            <span className={`text-sm font-medium ${daysUntilDue.color}`}>
                              {daysUntilDue.text}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>{assignment.courseTitle}</span>
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>마감: {new Date(assignment.dueDate).toLocaleDateString('ko-KR')}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            <span>만점: {assignment.maxScore}점</span>
                          </div>
                        </div>

                        {/* 제출 정보 */}
                        {assignment.submission && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">제출 정보</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>제출일: {new Date(assignment.submission.submittedAt).toLocaleString('ko-KR')}</div>
                              {assignment.submission.score !== undefined && (
                                <div>점수: {assignment.submission.score}/{assignment.maxScore}점</div>
                              )}
                              {assignment.submission.gradedAt && (
                                <div>채점일: {new Date(assignment.submission.gradedAt).toLocaleString('ko-KR')}</div>
                              )}
                            </div>
                            {assignment.submission.feedback && (
                              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <h5 className="font-medium text-blue-900 mb-1">강사 피드백</h5>
                                <p className="text-sm text-blue-800">{assignment.submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Link href={`/assignments/${assignment.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Button>
                        </Link>
                        {!assignment.isSubmitted && (
                          <Link href={`/assignments/${assignment.id}/submit`}>
                            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                              <Upload className="h-4 w-4 mr-1" />
                              제출하기
                            </Button>
                          </Link>
                        )}
                        {assignment.submission?.fileUrl && (
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="h-4 w-4 mr-1" />
                            다운로드
                          </Button>
                        )}
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