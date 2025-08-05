'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  BarChart3,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CourseAttendance {
  course: {
    id: string;
    title: string;
    instructor: string;
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
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }[];
}

export default function StudentAttendancePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [attendanceData, setAttendanceData] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock 출석 데이터
  const mockAttendanceData: CourseAttendance[] = [
    {
      course: {
        id: '1',
        title: 'React & Next.js 풀스택 개발',
        instructor: '김개발'
      },
      stats: { total: 12, present: 10, late: 1, absent: 1 },
      attendanceRate: 92,
      records: [
        { id: '1', date: '2024-01-15', status: 'present' },
        { id: '2', date: '2024-01-17', status: 'late', notes: '교통체증으로 인한 지각' },
        { id: '3', date: '2024-01-19', status: 'present' },
        { id: '4', date: '2024-01-22', status: 'absent', notes: '개인 사정' },
        { id: '5', date: '2024-01-24', status: 'present' },
        { id: '6', date: '2024-01-26', status: 'present' },
        { id: '7', date: '2024-01-29', status: 'present' },
        { id: '8', date: '2024-01-31', status: 'present' },
      ]
    },
    {
      course: {
        id: '2',
        title: 'Python 백엔드 개발 마스터',
        instructor: '박백엔드'
      },
      stats: { total: 8, present: 8, late: 0, absent: 0 },
      attendanceRate: 100,
      records: [
        { id: '9', date: '2024-01-16', status: 'present' },
        { id: '10', date: '2024-01-18', status: 'present' },
        { id: '11', date: '2024-01-23', status: 'present' },
        { id: '12', date: '2024-01-25', status: 'present' },
      ]
    }
  ];

  // 권한 확인
  useEffect(() => {
    if (!isLoading && (!user || user.user_metadata?.role !== 'student')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // 출석 데이터 로드
  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAttendanceData(mockAttendanceData);
      if (mockAttendanceData.length > 0) {
        setSelectedCourse(mockAttendanceData[0].course.id);
      }
    } catch (error) {
      console.error('출석 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return '출석';
      case 'late': return '지각';
      case 'absent': return '결석';
      default: return '미확인';
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const selectedCourseData = attendanceData.find(data => data.course.id === selectedCourse);

  // 달력 생성을 위한 함수
  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    
    // 이전 달의 마지막 날들
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, -i);
      calendar.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate.toISOString().split('T')[0]
      });
    }

    // 현재 달의 날들
    for (let date = 1; date <= daysInMonth; date++) {
      const fullDate = new Date(year, month - 1, date).toISOString().split('T')[0];
      calendar.push({
        date,
        isCurrentMonth: true,
        fullDate
      });
    }

    // 다음 달의 첫 날들 (총 42칸 맞추기)
    const remainingCells = 42 - calendar.length;
    for (let date = 1; date <= remainingCells; date++) {
      const nextDate = new Date(year, month, date);
      calendar.push({
        date: nextDate.getDate(),
        isCurrentMonth: false,
        fullDate: nextDate.toISOString().split('T')[0]
      });
    }

    return calendar;
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const calendarDays = generateCalendar(year, month);

  // 전체 통계 계산
  const overallStats = attendanceData.length > 0 ? {
    totalCourses: attendanceData.length,
    averageAttendanceRate: Math.round(
      attendanceData.reduce((sum, data) => sum + data.attendanceRate, 0) / attendanceData.length
    ),
    totalClasses: attendanceData.reduce((sum, data) => sum + data.stats.total, 0),
    totalPresent: attendanceData.reduce((sum, data) => sum + data.stats.present, 0),
    totalLate: attendanceData.reduce((sum, data) => sum + data.stats.late, 0),
    totalAbsent: attendanceData.reduce((sum, data) => sum + data.stats.absent, 0),
  } : null;

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
            <h1 className="text-2xl font-bold text-gray-900">내 출석 현황</h1>
            <p className="text-gray-600">수강 중인 강의별 출석 현황을 확인하세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 전체 통계 */}
        {overallStats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">전체 출석 현황</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{overallStats.totalCourses}</div>
                <div className="text-sm text-gray-500">수강 강의</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getAttendanceRateColor(overallStats.averageAttendanceRate)}`}>
                  {overallStats.averageAttendanceRate}%
                </div>
                <div className="text-sm text-gray-500">평균 출석률</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{overallStats.totalClasses}</div>
                <div className="text-sm text-gray-500">총 수업</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overallStats.totalPresent}</div>
                <div className="text-sm text-gray-500">출석</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{overallStats.totalLate}</div>
                <div className="text-sm text-gray-500">지각</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overallStats.totalAbsent}</div>
                <div className="text-sm text-gray-500">결석</div>
              </div>
            </div>
          </div>
        )}

        {/* 강의별 출석률 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {attendanceData.map((data) => (
            <div 
              key={data.course.id}
              className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-200 ${
                selectedCourse === data.course.id 
                  ? 'ring-2 ring-indigo-500 border-indigo-500' 
                  : 'hover:shadow-md border border-gray-200'
              }`}
              onClick={() => setSelectedCourse(data.course.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <TrendingUp className={`h-5 w-5 ${getAttendanceRateColor(data.attendanceRate)}`} />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{data.course.title}</h3>
              <p className="text-sm text-gray-500 mb-4">강사: {data.course.instructor}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">출석률</span>
                  <span className={`font-medium ${getAttendanceRateColor(data.attendanceRate)}`}>
                    {data.attendanceRate}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">총 수업</span>
                  <span className="font-medium">{data.stats.total}회</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">출석</span>
                  <span className="text-green-600 font-medium">{data.stats.present}회</span>
                </div>
                {data.stats.late > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">지각</span>
                    <span className="text-yellow-600 font-medium">{data.stats.late}회</span>
                  </div>
                )}
                {data.stats.absent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">결석</span>
                    <span className="text-red-600 font-medium">{data.stats.absent}회</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 강의의 상세 출석 현황 */}
        {selectedCourseData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 출석 달력 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">출석 달력</h2>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-auto"
                />
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const attendanceRecord = selectedCourseData.records.find(
                    record => record.date === day.fullDate
                  );
                  
                  return (
                    <div
                      key={index}
                      className={`relative aspect-square p-1 text-center text-sm ${
                        day.isCurrentMonth 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-full h-full flex items-center justify-center rounded ${
                        attendanceRecord
                          ? getStatusColor(attendanceRecord.status)
                          : day.isCurrentMonth
                          ? 'hover:bg-gray-100'
                          : ''
                      } ${
                        attendanceRecord ? 'border' : ''
                      }`}>
                        {day.date}
                        {attendanceRecord && (
                          <div className="absolute top-1 right-1">
                            {React.createElement(getStatusIcon(attendanceRecord.status), {
                              className: "h-3 w-3"
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 범례 */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                  <span>출석</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                  <span>지각</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                  <span>결석</span>
                </div>
              </div>
            </div>

            {/* 출석 기록 목록 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">출석 기록</h2>
              
              {selectedCourseData.records.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">출석 기록이 없습니다</h3>
                  <p className="text-gray-500">아직 수업이 시작되지 않았거나 출석 기록이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedCourseData.records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => {
                      const StatusIcon = getStatusIcon(record.status);
                      
                      return (
                        <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {new Date(record.date).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </div>
                              {record.notes && (
                                <div className="text-sm text-gray-500 mt-1">{record.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                            {getStatusLabel(record.status)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 출석률 개선 팁 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">출석률 향상 팁</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 수업 전날 미리 준비물과 일정을 확인하세요</li>
                <li>• 교통 상황을 고려해 여유있게 출발하세요</li>
                <li>• 불가피한 결석 시에는 사전에 강사님께 연락드리세요</li>
                <li>• 규칙적인 생활 패턴을 유지하여 컨디션을 관리하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 