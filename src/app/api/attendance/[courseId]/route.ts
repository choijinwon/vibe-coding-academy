import { NextRequest, NextResponse } from 'next/server';
import { db, attendance, users, courseRegistrations } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';

interface AttendancePageProps {
  params: { courseId: string };
}

export async function GET(
  request: NextRequest,
  { params }: AttendancePageProps
) {
  try {
    const { courseId } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!courseId) {
      return NextResponse.json(
        { error: '강의 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 강의에 등록된 학생들 조회
    const enrolledStudents = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        registrationStatus: courseRegistrations.status,
      })
      .from(courseRegistrations)
      .innerJoin(users, eq(courseRegistrations.userId, users.id))
      .where(
        and(
          eq(courseRegistrations.courseId, courseId),
          eq(courseRegistrations.status, 'approved')
        )
      );

    // 출석 기록 조회 조건 구성
    const baseCondition = eq(attendance.courseId, courseId);
    const conditions = [baseCondition];
    
    if (startDate && endDate) {
      conditions.push(sql`${attendance.date} >= ${new Date(startDate)}`);
      conditions.push(sql`${attendance.date} <= ${new Date(endDate)}`);
    }

    // 출석 기록 조회
    const attendanceRecords = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .where(and(...conditions))
      .orderBy(attendance.date);

    // 학생별 출석 통계 계산
    const studentAttendanceMap = new Map();
    
    for (const student of enrolledStudents) {
      const studentRecords = attendanceRecords.filter(record => record.userId === student.userId);
      
      const stats = {
        total: studentRecords.length,
        present: studentRecords.filter(r => r.status === 'present').length,
        absent: studentRecords.filter(r => r.status === 'absent').length,
        late: studentRecords.filter(r => r.status === 'late').length,
      };

      const attendanceRate = stats.total > 0 ? 
        Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;

      studentAttendanceMap.set(student.userId, {
        student: {
          id: student.userId,
          name: student.userName,
          email: student.userEmail,
        },
        stats,
        attendanceRate,
        records: studentRecords.map(record => ({
          id: record.id,
          date: record.date.toISOString().split('T')[0],
          status: record.status,
          notes: record.notes,
          createdAt: record.createdAt,
        }))
      });
    }

    // 전체 출석 통계
    const totalStats = {
      totalStudents: enrolledStudents.length,
      totalRecords: attendanceRecords.length,
      averageAttendanceRate: enrolledStudents.length > 0 ?
        Math.round(
          Array.from(studentAttendanceMap.values())
            .reduce((sum, student) => sum + student.attendanceRate, 0) / enrolledStudents.length
        ) : 0,
      statusCounts: {
        present: attendanceRecords.filter(r => r.status === 'present').length,
        absent: attendanceRecords.filter(r => r.status === 'absent').length,
        late: attendanceRecords.filter(r => r.status === 'late').length,
      }
    };

    return NextResponse.json({
      success: true,
      courseId,
      dateRange: { startDate, endDate },
      totalStats,
      studentAttendance: Array.from(studentAttendanceMap.values()),
    });

  } catch (error) {
    console.error('출석 현황 조회 API 오류:', error);
    return NextResponse.json(
      { error: '출석 현황 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 