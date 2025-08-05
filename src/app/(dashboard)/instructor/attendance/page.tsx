'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus,
  BarChart3,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Course {
  id: string;
  title: string;
  totalStudents: number;
  averageAttendanceRate: number;
}

interface StudentAttendance {
  student: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    total: number;
    present: number;
    late: number;
    absent: number;
  };
  attendanceRate: number;
  records: {
    id: string;
    date: string;
    status: string;
    notes?: string;
  }[];
}

export default function InstructorAttendancePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock 강의 데이터
  const [courses] = useState<Course[]>([
    { 
      id: '1', 
      title: 'React & Next.js 풀스택 개발', 
      totalStudents: 15,
      averageAttendanceRate: 92
    },
    { 
      id: '2', 
      title: 'Python 백엔드 개발 마스터', 
      totalStudents: 12,
      averageAttendanceRate: 88
    },
    { 
      id: '3', 
      title: 'AI & 머신러닝 실무', 
      totalStudents: 8,
      averageAttendanceRate: 95
    },
  ]);

  // Mock 출석 데이터
  const mockAttendanceData: StudentAttendance[] = [
    {
      student: { id: 'student1', name: '김수현', email: 'student1@example.com' },
      stats: { total: 12, present: 11, late: 1, absent: 0 },
      attendanceRate: 100,
      records: [
        { id: '1', date: '2024-01-15', status: 'present' },
        { id: '2', date: '2024-01-17', status: 'late', notes: '교통체증' },
        { id: '3', date: '2024-01-19', status: 'present' },
      ]
    },
    {
      student: { id: 'student2', name: '이정우', email: 'student2@example.com' },
      stats: { total: 12, present: 10, late: 0, absent: 2 },
      attendanceRate: 83,
      records: [
        { id: '4', date: '2024-01-15', status: 'present' },
        { id: '5', date: '2024-01-17', status: 'absent', notes: '개인 사정' },
        { id: '6', date: '2024-01-19', status: 'present' },
      ]
    },
    {
      student: { id: 'student3', name: '박민지', email: 'student3@example.com' },
      stats: { total: 12, present: 12, late: 0, absent: 0 },
      attendanceRate: 100,
      records: [
        { id: '7', date: '2024-01-15', status: 'present' },
        { id: '8', date: '2024-01-17', status: 'present' },
        { id: '9', date: '2024-01-19', status: 'present' },
      ]
    },
  ];

  // 권한 확인
  useEffect(() => {
    if (!isLoading && (!user || user.user_metadata?.role !== 'instructor')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // 출석 현황 로드
  useEffect(() => {
    if (selectedCourse) {
      loadAttendanceData();
    }
  }, [selectedCourse, dateRange]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      const queryParams = new URLSearchParams();
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      
      // Mock API 응답 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStudentAttendance(mockAttendanceData);
      
    } catch (error) {
      console.error('출석 현황 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'absent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle;
      case 'late': return Clock;
      case 'absent': return XCircle;
      default: return AlertCircle;
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 검색 필터링
  const filteredStudents = studentAttendance.filter(item =>
    item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 전체 통계 계산
  const totalStats = studentAttendance.length > 0 ? {
    totalStudents: studentAttendance.length,
    averageAttendanceRate: Math.round(
      studentAttendance.reduce((sum, item) => sum + item.attendanceRate, 0) / studentAttendance.length
    ),
    totalSessions: studentAttendance[0]?.stats.total || 0,
    presentCount: studentAttendance.reduce((sum, item) => sum + item.stats.present, 0),
    lateCount: studentAttendance.reduce((sum, item) => sum + item.stats.late, 0),
    absentCount: studentAttendance.reduce((sum, item) => sum + item.stats.absent, 0),
  } : null;

  if (isLoading && !selectedCourse) {
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
              <h1 className="text-2xl font-bold text-gray-900">출석 관리</h1>
              <p className="text-gray-600">학생들의 출석 현황을 확인하고 관리하세요</p>
            </div>
            <Link href="/instructor/attendance/check">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                출석 체크하기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 강의별 출석률 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-200 ${
                selectedCourse === course.id 
                  ? 'ring-2 ring-indigo-500 border-indigo-500' 
                  : 'hover:shadow-md border border-gray-200'
              }`}
              onClick={() => setSelectedCourse(course.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{course.title}</h3>
                <TrendingUp className={`h-5 w-5 ${getAttendanceRateColor(course.averageAttendanceRate)}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">학생 수</span>
                  <span className="font-medium">{course.totalStudents}명</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">평균 출석률</span>
                  <span className={`font-medium ${getAttendanceRateColor(course.averageAttendanceRate)}`}>
                    {course.averageAttendanceRate}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 강의가 있을 때만 상세 정보 표시 */}
        {selectedCourse && (
          <>
            {/* 필터 및 검색 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">필터 및 검색</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">학생 검색</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="이름 또는 이메일 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Excel 다운로드
                  </Button>
                </div>
              </div>
            </div>

            {/* 전체 통계 */}
            {totalStats && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">전체 통계</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{totalStats.totalStudents}</div>
                    <div className="text-sm text-gray-500">전체 학생</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getAttendanceRateColor(totalStats.averageAttendanceRate)}`}>
                      {totalStats.averageAttendanceRate}%
                    </div>
                    <div className="text-sm text-gray-500">평균 출석률</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{totalStats.totalSessions}</div>
                    <div className="text-sm text-gray-500">총 수업 수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalStats.presentCount}</div>
                    <div className="text-sm text-gray-500">출석</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{totalStats.lateCount}</div>
                    <div className="text-sm text-gray-500">지각</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{totalStats.absentCount}</div>
                    <div className="text-sm text-gray-500">결석</div>
                  </div>
                </div>
              </div>
            )}

            {/* 학생별 출석 현황 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  <Users className="h-5 w-5 inline mr-2" />
                  학생별 출석 현황 ({filteredStudents.length}명)
                </h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">필터 적용됨</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">출석 현황을 불러오는 중...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">출석 데이터가 없습니다</h3>
                  <p className="text-gray-500">강의를 선택하거나 검색 조건을 확인해주세요.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          학생
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          출석률
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          출석
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          지각
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          결석
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          총 수업
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          최근 출석
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((item) => {
                        const lastRecord = item.records[item.records.length - 1];
                        const StatusIcon = getStatusIcon(lastRecord?.status || 'absent');
                        
                        return (
                          <tr key={item.student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-sm font-medium text-indigo-600">
                                    {item.student.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.student.name}</div>
                                  <div className="text-sm text-gray-500">{item.student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${getAttendanceRateColor(item.attendanceRate)}`}>
                                {item.attendanceRate}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-green-600 font-medium">{item.stats.present}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-yellow-600 font-medium">{item.stats.late}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-red-600 font-medium">{item.stats.absent}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{item.stats.total}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {lastRecord && (
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lastRecord.status)}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {lastRecord.date}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 