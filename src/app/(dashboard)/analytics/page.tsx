'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Award,
  Target,
  Activity,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  averageAttendanceRate: number;
  assignmentCompletionRate: number;
  activeStudentsThisWeek: number;
  recentActivity: {
    date: string;
    students: number;
    submissions: number;
    attendance: number;
  }[];
  topPerformingStudents: {
    id: string;
    name: string;
    attendanceRate: number;
    assignmentScore: number;
    coursesCompleted: number;
  }[];
  coursePerformance: {
    id: string;
    title: string;
    studentsCount: number;
    averageAttendance: number;
    averageAssignmentScore: number;
  }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics/overview?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('분석 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    if (rate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBg = (rate: number) => {
    if (rate >= 90) return 'bg-green-50';
    if (rate >= 80) return 'bg-yellow-50';
    if (rate >= 70) return 'bg-orange-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">분석 데이터를 불러올 수 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">나중에 다시 시도해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">학습 분석 대시보드</h1>
              <p className="text-gray-600">학습 성과와 진도를 한눈에 확인하세요</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 기간 선택 */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="7">최근 7일</option>
              <option value="30">최근 30일</option>
              <option value="90">최근 90일</option>
              <option value="365">최근 1년</option>
            </select>
            
            {/* 새로고침 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 학생</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 강의</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">평균 출석률</p>
              <p className={`text-2xl font-semibold ${getPerformanceColor(data.averageAttendanceRate)}`}>
                {data.averageAttendanceRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">과제 완성률</p>
              <p className={`text-2xl font-semibold ${getPerformanceColor(data.assignmentCompletionRate)}`}>
                {data.assignmentCompletionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">활성 학생</p>
              <p className="text-2xl font-semibold text-gray-900">{data.activeStudentsThisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 트렌드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동 트렌드</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.recentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="students"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="활성 학생"
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="과제 제출"
              />
              <Area
                type="monotone"
                dataKey="attendance"
                stackId="1"
                stroke="#ffc658"
                fill="#ffc658"
                name="출석"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 강의별 성과 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">강의별 성과</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.coursePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageAttendance" fill="#8884d8" name="평균 출석률" />
              <Bar dataKey="averageAssignmentScore" fill="#82ca9d" name="평균 과제 점수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 우수 학생 & 강의 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 우수 학생 목록 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">우수 학생</h3>
            <p className="text-sm text-gray-500">성과가 뛰어난 학생들입니다</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.topPerformingStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        완료한 강의: {student.coursesCompleted}개
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getPerformanceColor(student.attendanceRate)}`}>
                      출석률 {student.attendanceRate}%
                    </p>
                    <p className={`text-sm font-medium ${getPerformanceColor(student.assignmentScore)}`}>
                      과제 점수 {student.assignmentScore}점
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 강의별 상세 성과 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">강의별 상세 성과</h3>
            <p className="text-sm text-gray-500">각 강의의 학습 현황입니다</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.coursePerformance.map((course) => (
                <div key={course.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <span className="text-sm text-gray-500">{course.studentsCount}명 수강</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">평균 출석률</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.averageAttendance >= 90 ? 'bg-green-500' :
                              course.averageAttendance >= 80 ? 'bg-yellow-500' :
                              course.averageAttendance >= 70 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${course.averageAttendance}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getPerformanceColor(course.averageAttendance)}`}>
                          {course.averageAttendance}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">평균 과제 점수</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.averageAssignmentScore >= 90 ? 'bg-green-500' :
                              course.averageAssignmentScore >= 80 ? 'bg-yellow-500' :
                              course.averageAssignmentScore >= 70 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${course.averageAssignmentScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getPerformanceColor(course.averageAssignmentScore)}`}>
                          {course.averageAssignmentScore}점
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">분석 리포트</h3>
            <p className="text-sm text-gray-500">상세한 분석 리포트를 다운로드하거나 추가 분석을 확인하세요</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              <span>리포트 다운로드</span>
            </button>
            <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span>상세 분석</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 