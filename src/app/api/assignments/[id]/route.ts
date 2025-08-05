import { NextRequest, NextResponse } from 'next/server';
import { db, assignments, courses, assignmentSubmissions, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface AssignmentPageProps {
  params: { id: string };
}

interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  fileUrl?: string;
}

export async function GET(
  request: NextRequest,
  { params }: AssignmentPageProps
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!id) {
      return NextResponse.json(
        { error: '과제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 과제 상세 정보 조회
    const assignmentDetail = await db
      .select({
        id: assignments.id,
        courseId: assignments.courseId,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        fileUrl: assignments.fileUrl,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
        courseTitle: courses.title,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(eq(assignments.id, id))
      .limit(1);

    if (assignmentDetail.length === 0) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const assignment = assignmentDetail[0];

    // 학생인 경우 자신의 제출 정보도 함께 조회
    if (userRole === 'student' && userId) {
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
            eq(assignmentSubmissions.assignmentId, id),
            eq(assignmentSubmissions.userId, userId)
          )
        )
        .limit(1);

      return NextResponse.json({
        success: true,
        assignment: {
          ...assignment,
          submission: submission[0] || null,
          isSubmitted: submission.length > 0,
          isGraded: submission.length > 0 && submission[0].score !== null,
        }
      });
    }

    // 강사인 경우 모든 제출 정보도 함께 조회
    if (userRole === 'instructor') {
      const submissions = await db
        .select({
          id: assignmentSubmissions.id,
          userId: assignmentSubmissions.userId,
          fileUrl: assignmentSubmissions.fileUrl,
          content: assignmentSubmissions.content,
          score: assignmentSubmissions.score,
          feedback: assignmentSubmissions.feedback,
          submittedAt: assignmentSubmissions.submittedAt,
          gradedAt: assignmentSubmissions.gradedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(assignmentSubmissions)
        .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
        .where(eq(assignmentSubmissions.assignmentId, id))
        .orderBy(assignmentSubmissions.submittedAt);

      const stats = {
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter(s => s.score !== null).length,
        pendingGrading: submissions.filter(s => s.score === null).length,
        averageScore: submissions.length > 0 && submissions.filter(s => s.score !== null).length > 0
          ? Math.round(
              submissions
                .filter(s => s.score !== null)
                .reduce((sum, s) => sum + (s.score || 0), 0) / 
              submissions.filter(s => s.score !== null).length
            )
          : 0,
      };

      return NextResponse.json({
        success: true,
        assignment: {
          ...assignment,
          submissions,
          stats,
        }
      });
    }

    return NextResponse.json({
      success: true,
      assignment
    });

  } catch (error) {
    console.error('과제 상세 조회 API 오류:', error);
    return NextResponse.json(
      { error: '과제 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: AssignmentPageProps
) {
  try {
    const { id } = params;
    const body: UpdateAssignmentRequest = await request.json();
    const { title, description, dueDate, maxScore, fileUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: '과제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 업데이트할 필드들만 포함
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (maxScore !== undefined) updateData.maxScore = maxScore;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;

    // 과제 업데이트
    const updatedAssignment = await db
      .update(assignments)
      .set(updateData)
      .where(eq(assignments.id, id))
      .returning();

    if (updatedAssignment.length === 0) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '과제가 성공적으로 수정되었습니다.',
      assignment: updatedAssignment[0]
    });

  } catch (error) {
    console.error('과제 수정 API 오류:', error);
    return NextResponse.json(
      { error: '과제 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: AssignmentPageProps
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '과제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 먼저 관련 제출물들을 삭제
    await db
      .delete(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, id));

    // 과제 삭제
    const deletedAssignment = await db
      .delete(assignments)
      .where(eq(assignments.id, id))
      .returning();

    if (deletedAssignment.length === 0) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '과제가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('과제 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '과제 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 