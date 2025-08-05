import { NextRequest, NextResponse } from 'next/server';
import { db, assignments, courses, assignmentSubmissions, users } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

interface CreateAssignmentRequest {
  courseId: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  fileUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAssignmentRequest = await request.json();
    const { courseId, title, description, dueDate, maxScore, fileUrl } = body;

    if (!courseId || !title) {
      return NextResponse.json(
        { error: '강의 ID와 과제 제목은 필수입니다.' },
        { status: 400 }
      );
    }

    // 과제 생성
    const newAssignment = await db
      .insert(assignments)
      .values({
        courseId,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore || 100,
        fileUrl: fileUrl || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '과제가 성공적으로 생성되었습니다.',
      assignment: newAssignment[0]
    });

  } catch (error) {
    console.error('과제 생성 API 오류:', error);
    return NextResponse.json(
      { error: '과제 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!courseId) {
      return NextResponse.json(
        { error: '강의 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 과제 목록 조회
    const assignmentList = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        fileUrl: assignments.fileUrl,
        createdAt: assignments.createdAt,
        courseTitle: courses.title,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(eq(assignments.courseId, courseId))
      .orderBy(desc(assignments.createdAt));

    // 학생인 경우 제출 현황도 함께 조회
    if (userRole === 'student' && userId) {
      const assignmentsWithSubmissions = await Promise.all(
        assignmentList.map(async (assignment) => {
          const submission = await db
            .select({
              id: assignmentSubmissions.id,
              fileUrl: assignmentSubmissions.fileUrl,
              content: assignmentSubmissions.content,
              score: assignmentSubmissions.score,
              feedback: assignmentSubmissions.feedback,
              submittedAt: assignmentSubmissions.submittedAt,
              gradedAt: assignmentSubmissions.gradedAt,
            })
            .from(assignmentSubmissions)
            .where(
              and(
                eq(assignmentSubmissions.assignmentId, assignment.id),
                eq(assignmentSubmissions.userId, userId)
              )
            )
            .limit(1);

          return {
            ...assignment,
            submission: submission[0] || null,
            isSubmitted: submission.length > 0,
            isGraded: submission.length > 0 && submission[0].score !== null,
          };
        })
      );

      return NextResponse.json({
        success: true,
        assignments: assignmentsWithSubmissions
      });
    }

    // 강사인 경우 제출 통계도 함께 조회
    if (userRole === 'instructor') {
      const assignmentsWithStats = await Promise.all(
        assignmentList.map(async (assignment) => {
          const submissionStats = await db
            .select({
              totalSubmissions: assignmentSubmissions.id,
              gradedSubmissions: assignmentSubmissions.score,
            })
            .from(assignmentSubmissions)
            .where(eq(assignmentSubmissions.assignmentId, assignment.id));

          const totalSubmissions = submissionStats.length;
          const gradedSubmissions = submissionStats.filter(s => s.gradedSubmissions !== null).length;

          return {
            ...assignment,
            stats: {
              totalSubmissions,
              gradedSubmissions,
              pendingGrading: totalSubmissions - gradedSubmissions,
            }
          };
        })
      );

      return NextResponse.json({
        success: true,
        assignments: assignmentsWithStats
      });
    }

    return NextResponse.json({
      success: true,
      assignments: assignmentList
    });

  } catch (error) {
    console.error('과제 목록 조회 API 오류:', error);
    return NextResponse.json(
      { error: '과제 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 