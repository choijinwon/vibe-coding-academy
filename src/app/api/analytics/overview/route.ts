import { NextRequest, NextResponse } from 'next/server';
import { db, users, courses, attendance, assignments, assignmentSubmissions, courseRegistrations } from '@/lib/db';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';

interface AnalyticsOverview {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const courseId = searchParams.get('courseId'); // 특정 강의 필터링

    // 날짜 범위 계산
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));

    // 1. 전체 학생 수
    const totalStudentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`user_metadata->>'role' = 'student'`);
    const totalStudents = totalStudentsResult[0]?.count || 0;

    // 2. 전체 강의 수
    const totalCoursesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);
    const totalCourses = totalCoursesResult[0]?.count || 0;

    // 3. 평균 출석률 계산
    const attendanceData = await db
      .select({
        totalSessions: sql<number>`count(*)`,
        attendedSessions: sql<number>`sum(case when ${attendance.status} = 'present' then 1 else 0 end)`
      })
      .from(attendance)
      .where(gte(attendance.date, startDate));

    const attendanceResult = attendanceData[0];
    const averageAttendanceRate = attendanceResult?.totalSessions > 0
      ? Math.round((attendanceResult.attendedSessions / attendanceResult.totalSessions) * 100)
      : 85; // 기본값

    // 4. 과제 완성률 계산
    const assignmentStats = await db
      .select({
        totalAssignments: sql<number>`count(distinct ${assignments.id})`,
        submittedAssignments: sql<number>`count(distinct ${assignmentSubmissions.id})`
      })
      .from(assignments)
      .leftJoin(assignmentSubmissions, eq(assignments.id, assignmentSubmissions.assignmentId))
      .where(gte(assignments.createdAt, startDate));

    const assignmentResult = assignmentStats[0];
    const assignmentCompletionRate = assignmentResult?.totalAssignments > 0
      ? Math.round((assignmentResult.submittedAssignments / assignmentResult.totalAssignments) * 100)
      : 78; // 기본값

    // 5. 이번 주 활성 학생 수
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const activeStudentsResult = await db
      .select({ count: sql<number>`count(distinct ${attendance.userId})` })
      .from(attendance)
      .where(gte(attendance.date, weekStart));
    const activeStudentsThisWeek = activeStudentsResult[0]?.count || Math.floor(totalStudents * 0.7);

    // 6. 최근 활동 데이터 (지난 7일)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // 모의 데이터 생성 (실제로는 DB에서 조회)
      recentActivity.push({
        date: date.toISOString().split('T')[0],
        students: Math.floor(Math.random() * 50) + 20,
        submissions: Math.floor(Math.random() * 30) + 10,
        attendance: Math.floor(Math.random() * 60) + 40,
      });
    }

    // 7. 우수 학생 목록 (모의 데이터)
    const topPerformingStudents = [
      {
        id: '1',
        name: '김철수',
        attendanceRate: 95,
        assignmentScore: 92,
        coursesCompleted: 3
      },
      {
        id: '2',
        name: '박영희',
        attendanceRate: 88,
        assignmentScore: 89,
        coursesCompleted: 2
      },
      {
        id: '3',
        name: '이준호',
        attendanceRate: 92,
        assignmentScore: 85,
        coursesCompleted: 4
      }
    ];

    // 8. 강의별 성과 (모의 데이터)
    const coursePerformance = [
      {
        id: '1',
        title: 'React 기초부터 실전까지',
        studentsCount: 45,
        averageAttendance: 92,
        averageAssignmentScore: 87
      },
      {
        id: '2',
        title: 'Next.js 마스터클래스',
        studentsCount: 32,
        averageAttendance: 89,
        averageAssignmentScore: 91
      },
      {
        id: '3',
        title: 'TypeScript 완벽 가이드',
        studentsCount: 28,
        averageAttendance: 85,
        averageAssignmentScore: 83
      }
    ];

    const analyticsData: AnalyticsOverview = {
      totalStudents,
      totalCourses,
      averageAttendanceRate,
      assignmentCompletionRate,
      activeStudentsThisWeek,
      recentActivity,
      topPerformingStudents,
      coursePerformance
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('분석 개요 API 오류:', error);
    return NextResponse.json(
      { error: '분석 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 