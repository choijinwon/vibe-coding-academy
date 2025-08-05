'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceRecord {
  userId: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

export default function AttendanceCheckPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([
    { id: '1', title: 'React & Next.js 풀스택 개발', students: 15 },
    { id: '2', title: 'Python 백엔드 개발 마스터', students: 12 },
    { id: '3', title: 'AI & 머신러닝 실무', students: 8 },
  ]);

  // Mock 학생 데이터
  const mockStudents: Student[] = [
    { id: 'student1', name: '김수현', email: 'student1@example.com' },
    { id: 'student2', name: '이정우', email: 'student2@example.com' },
    { id: 'student3', name: '박민지', email: 'student3@example.com' },
    { id: 'student4', name: '최영호', email: 'student4@example.com' },
    { id: 'student5', name: '정소연', email: 'student5@example.com' },
    { id: 'student6', name: '김동현', email: 'student6@example.com' },
    { id: 'student7', name: '이서연', email: 'student7@example.com' },
    { id: 'student8', name: '박준혁', email: 'student8@example.com' },
  ];

  // 권한 확인
  useEffect(() => {
    if (!isLoading && (!user || user.user_metadata?.role !== 'instructor')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // 강의 선택시 학생 목록 로드
  useEffect(() => {
    if (selectedCourse) {
      loadStudents();
      loadExistingAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 해당 강의의 학생 목록 가져오기
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(mockStudents);
      
      // 기존 출석 기록이 없으면 기본값으로 초기화
      const newRecords = new Map();
      mockStudents.forEach(student => {
        if (!attendanceRecords.has(student.id)) {
          newRecords.set(student.id, {
            userId: student.id,
            status: 'present' as const,
            notes: ''
          });
        }
      });
      setAttendanceRecords(prev => new Map([...prev, ...newRecords]));
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedCourse || !selectedDate) return;

    try {
      // TODO: 실제 API 호출로 기존 출석 기록 가져오기
      const response = await fetch(`/api/attendance/check?courseId=${selectedCourse}&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        const existingRecords = new Map();
        
        data.attendanceRecords?.forEach((record: any) => {
          existingRecords.set(record.userId, {
            userId: record.userId,
            status: record.status,
            notes: record.notes || ''
          });
        });
        
        setAttendanceRecords(existingRecords);
      }
    } catch (error) {
      console.error('기존 출석 기록 로드 실패:', error);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => {
      const newRecords = new Map(prev);
      const existing = newRecords.get(studentId) || { userId: studentId, status: 'present', notes: '' };
      newRecords.set(studentId, { ...existing, status });
      return newRecords;
    });
  };

  const updateAttendanceNotes = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => {
      const newRecords = new Map(prev);
      const existing = newRecords.get(studentId) || { userId: studentId, status: 'present', notes: '' };
      newRecords.set(studentId, { ...existing, notes });
      return newRecords;
    });
  };

  const saveAttendance = async () => {
    if (!selectedCourse || !selectedDate || attendanceRecords.size === 0) {
      alert('강의와 날짜를 선택하고 출석을 체크해주세요.');
      return;
    }

    setSaving(true);
    try {
      const attendanceList = Array.from(attendanceRecords.values());
      
      const response = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          attendanceList
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`출석 체크가 완료되었습니다. (${result.message})`);
      } else {
        const error = await response.json();
        throw new Error(error.error || '출석 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('출석 저장 실패:', error);
      alert('출석 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return '출석';
      case 'late': return '지각';
      case 'absent': return '결석';
      default: return '미확인';
    }
  };

  // 통계 계산
  const stats = {
    total: students.length,
    present: Array.from(attendanceRecords.values()).filter(r => r.status === 'present').length,
    late: Array.from(attendanceRecords.values()).filter(r => r.status === 'late').length,
    absent: Array.from(attendanceRecords.values()).filter(r => r.status === 'absent').length,
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/instructor/attendance" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                출석 관리로 돌아가기
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">출석 체크</h1>
                <p className="text-gray-600">학생들의 출석을 확인하고 기록하세요</p>
              </div>
            </div>
            <Button 
              onClick={saveAttendance} 
              disabled={saving || !selectedCourse || attendanceRecords.size === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  출석 저장
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 강의 및 날짜 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">강의 및 날짜 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                강의 선택
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">강의를 선택하세요</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.students}명)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                날짜 선택
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 출석 통계 */}
        {selectedCourse && students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">출석 현황</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">전체 학생</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-gray-500">출석</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <div className="text-sm text-gray-500">지각</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-gray-500">결석</div>
              </div>
            </div>
          </div>
        )}

        {/* 학생 목록 및 출석 체크 */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                <Users className="h-5 w-5 inline mr-2" />
                학생 목록 ({students.length}명)
              </h2>
              {loading && (
                <div className="flex items-center text-gray-500">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  로딩 중...
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">학생 목록을 불러오는 중...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 학생이 없습니다</h3>
                <p className="text-gray-500">먼저 강의를 선택해주세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => {
                  const record = attendanceRecords.get(student.id);
                  const status = record?.status || 'present';
                  const StatusIcon = getStatusIcon(status);
                  
                  return (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* 출석 상태 버튼들 */}
                          <div className="flex space-x-2">
                            {[
                              { value: 'present', label: '출석', icon: CheckCircle, color: 'green' },
                              { value: 'late', label: '지각', icon: Clock, color: 'yellow' },
                              { value: 'absent', label: '결석', icon: XCircle, color: 'red' },
                            ].map((option) => {
                              const Icon = option.icon;
                              const isSelected = status === option.value;
                              
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => updateAttendanceStatus(student.id, option.value as any)}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isSelected
                                      ? `bg-${option.color}-100 text-${option.color}-700 border-${option.color}-300`
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  } border`}
                                >
                                  <Icon className="h-4 w-4 mr-1" />
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* 현재 상태 표시 */}
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(status)}
                          </div>
                        </div>
                      </div>
                      
                      {/* 메모 입력 */}
                      <div className="mt-4">
                        <Input
                          type="text"
                          placeholder="메모 (선택사항)"
                          value={record?.notes || ''}
                          onChange={(e) => updateAttendanceNotes(student.id, e.target.value)}
                          className="w-full text-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 