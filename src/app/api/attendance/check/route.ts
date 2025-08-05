import { NextRequest, NextResponse } from 'next/server';
import { db, attendance } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface AttendanceCheckItem {
  userId: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

interface AttendanceCheckRequest {
  courseId: string;
  date: string;
  attendanceList: AttendanceCheckItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AttendanceCheckRequest = await request.json();
    const { courseId, date, attendanceList } = body;

    if (!courseId || !date || !attendanceList || attendanceList.length === 0) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);
    
    // 출석 기록들을 일괄 처리
    const results = [];
    
    for (const item of attendanceList) {
      const { userId, status, notes } = item;
      
      // 같은 날짜에 이미 출석 기록이 있는지 확인
      const existingAttendance = await db
        .select()
        .from(attendance)
        .where(
          and(
            eq(attendance.userId, userId),
            eq(attendance.courseId, courseId),
            eq(attendance.date, attendanceDate)
          )
        )
        .limit(1);

      if (existingAttendance.length > 0) {
        // 기존 기록 업데이트
        const updated = await db
          .update(attendance)
          .set({
            status,
            notes: notes || null,
          })
          .where(eq(attendance.id, existingAttendance[0].id))
          .returning();
        
        results.push({ type: 'updated', data: updated[0] });
      } else {
        // 새 기록 생성
        const inserted = await db
          .insert(attendance)
          .values({
            userId,
            courseId,
            date: attendanceDate,
            status,
            notes: notes || null,
          })
          .returning();
        
        results.push({ type: 'created', data: inserted[0] });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}명의 출석이 처리되었습니다.`,
      results
    });

  } catch (error) {
    console.error('출석 체크 API 오류:', error);
    return NextResponse.json(
      { error: '출석 체크 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!courseId || !date) {
      return NextResponse.json(
        { error: '강의 ID와 날짜가 필요합니다.' },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);
    
    // 해당 날짜의 출석 기록 조회
    const attendanceRecords = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        status: attendance.status,
        notes: attendance.notes,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.courseId, courseId),
          eq(attendance.date, attendanceDate)
        )
      );

    return NextResponse.json({
      success: true,
      date: date,
      courseId: courseId,
      attendanceRecords
    });

  } catch (error) {
    console.error('출석 조회 API 오류:', error);
    return NextResponse.json(
      { error: '출석 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 