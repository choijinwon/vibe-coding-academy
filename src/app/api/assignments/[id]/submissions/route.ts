import { NextRequest, NextResponse } from 'next/server';
import { db, assignmentSubmissions, assignments, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface SubmissionPageProps {
  params: { id: string };
}

interface CreateSubmissionRequest {
  userId: string;
  content?: string;
  fileUrl?: string;
}

interface UpdateSubmissionRequest {
  score?: number;
  feedback?: string;
}

export async function POST(
  request: NextRequest,
  { params }: SubmissionPageProps
) {
  try {
    const { id: assignmentId } = params;
    const body: CreateSubmissionRequest = await request.json();
    const { userId, content, fileUrl } = body;

    if (!assignmentId || !userId) {
      return NextResponse.json(
        { error: '과제 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: '과제 내용 또는 파일 중 하나는 필수입니다.' },
        { status: 400 }
      );
    }

    // 과제 존재 여부 확인
    const assignment = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기존 제출물 확인
    const existingSubmission = await db
      .select({ id: assignmentSubmissions.id })
      .from(assignmentSubmissions)
      .where(
        and(
          eq(assignmentSubmissions.assignmentId, assignmentId),
          eq(assignmentSubmissions.userId, userId)
        )
      )
      .limit(1);

    if (existingSubmission.length > 0) {
      // 기존 제출물 업데이트
      const updatedSubmission = await db
        .update(assignmentSubmissions)
        .set({
          content: content || null,
          fileUrl: fileUrl || null,
          submittedAt: new Date(),
          // 재제출 시 점수와 피드백 초기화
          score: null,
          feedback: null,
          gradedAt: null,
        })
        .where(eq(assignmentSubmissions.id, existingSubmission[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        message: '과제가 성공적으로 재제출되었습니다.',
        submission: updatedSubmission[0]
      });
    } else {
      // 새 제출물 생성
      const newSubmission = await db
        .insert(assignmentSubmissions)
        .values({
          assignmentId,
          userId,
          content: content || null,
          fileUrl: fileUrl || null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: '과제가 성공적으로 제출되었습니다.',
        submission: newSubmission[0]
      });
    }

  } catch (error) {
    console.error('과제 제출 API 오류:', error);
    return NextResponse.json(
      { error: '과제 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: SubmissionPageProps
) {
  try {
    const { id: assignmentId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!assignmentId) {
      return NextResponse.json(
        { error: '과제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (userId) {
      // 특정 사용자의 제출물 조회
      const submission = await db
        .select({
          id: assignmentSubmissions.id,
          assignmentId: assignmentSubmissions.assignmentId,
          userId: assignmentSubmissions.userId,
          content: assignmentSubmissions.content,
          fileUrl: assignmentSubmissions.fileUrl,
          score: assignmentSubmissions.score,
          feedback: assignmentSubmissions.feedback,
          submittedAt: assignmentSubmissions.submittedAt,
          gradedAt: assignmentSubmissions.gradedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(assignmentSubmissions)
        .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
        .where(
          and(
            eq(assignmentSubmissions.assignmentId, assignmentId),
            eq(assignmentSubmissions.userId, userId)
          )
        )
        .limit(1);

      return NextResponse.json({
        success: true,
        submission: submission[0] || null
      });
    } else {
      // 모든 제출물 조회 (강사용)
      const submissions = await db
        .select({
          id: assignmentSubmissions.id,
          assignmentId: assignmentSubmissions.assignmentId,
          userId: assignmentSubmissions.userId,
          content: assignmentSubmissions.content,
          fileUrl: assignmentSubmissions.fileUrl,
          score: assignmentSubmissions.score,
          feedback: assignmentSubmissions.feedback,
          submittedAt: assignmentSubmissions.submittedAt,
          gradedAt: assignmentSubmissions.gradedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(assignmentSubmissions)
        .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
        .where(eq(assignmentSubmissions.assignmentId, assignmentId))
        .orderBy(assignmentSubmissions.submittedAt);

      return NextResponse.json({
        success: true,
        submissions
      });
    }

  } catch (error) {
    console.error('제출물 조회 API 오류:', error);
    return NextResponse.json(
      { error: '제출물 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: SubmissionPageProps
) {
  try {
    const { id: assignmentId } = params;
    const body: UpdateSubmissionRequest & { userId: string } = await request.json();
    const { userId, score, feedback } = body;

    if (!assignmentId || !userId) {
      return NextResponse.json(
        { error: '과제 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 제출물 존재 여부 확인
    const existingSubmission = await db
      .select({ id: assignmentSubmissions.id })
      .from(assignmentSubmissions)
      .where(
        and(
          eq(assignmentSubmissions.assignmentId, assignmentId),
          eq(assignmentSubmissions.userId, userId)
        )
      )
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        { error: '제출물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 채점 정보 업데이트
    const updateData: any = {};
    
    if (score !== undefined) {
      updateData.score = score;
      updateData.gradedAt = new Date();
    }
    
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }

    const updatedSubmission = await db
      .update(assignmentSubmissions)
      .set(updateData)
      .where(eq(assignmentSubmissions.id, existingSubmission[0].id))
      .returning();

    return NextResponse.json({
      success: true,
      message: '채점이 성공적으로 저장되었습니다.',
      submission: updatedSubmission[0]
    });

  } catch (error) {
    console.error('채점 API 오류:', error);
    return NextResponse.json(
      { error: '채점 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 