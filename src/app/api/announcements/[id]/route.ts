import { NextRequest, NextResponse } from 'next/server';
import { db, announcements, announcementReads, users, courses } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface AnnouncementPageProps {
  params: { id: string };
}

interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  category?: 'general' | 'academic' | 'event' | 'urgent' | 'maintenance';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface AnnouncementWithReadStatus {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  courseId: string | null;
  courseName: string | null;
  category: string | null;
  priority: string | null;
  isEmailSent: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  isRead?: boolean;
  readAt?: Date | null;
}

export async function GET(
  request: NextRequest,
  { params }: AnnouncementPageProps
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!id) {
      return NextResponse.json(
        { error: '공지사항 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 공지사항 상세 정보 조회
    const announcementDetails = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        authorId: announcements.authorId,
        authorName: users.name,
        courseId: announcements.courseId,
        courseName: courses.title,
        category: announcements.category,
        priority: announcements.priority,
        isEmailSent: announcements.isEmailSent,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.authorId, users.id))
      .leftJoin(courses, eq(announcements.courseId, courses.id))
      .where(eq(announcements.id, id))
      .limit(1);

    if (announcementDetails.length === 0) {
      return NextResponse.json(
        { error: '해당 공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const announcement = announcementDetails[0];

    // 읽음 상태 정보 추가 (userId가 있는 경우)
    let announcementWithReadStatus: AnnouncementWithReadStatus = { ...announcement };
    
    if (userId) {
      const readStatus = await db
        .select({
          readAt: announcementReads.readAt,
        })
        .from(announcementReads)
        .where(
          and(
            eq(announcementReads.announcementId, id),
            eq(announcementReads.userId, userId)
          )
        )
        .limit(1);

      announcementWithReadStatus = {
        ...announcement,
        isRead: readStatus.length > 0,
        readAt: readStatus[0]?.readAt || null,
      };
    }

    return NextResponse.json({
      success: true,
      announcement: announcementWithReadStatus
    });

  } catch (error) {
    console.error('공지사항 상세 조회 API 오류:', error);
    return NextResponse.json(
      { error: '공지사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: AnnouncementPageProps
) {
  try {
    const { id } = params;
    const body: UpdateAnnouncementRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '공지사항 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 공지사항 존재 여부 확인
    const existingAnnouncement = await db
      .select({ id: announcements.id })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (existingAnnouncement.length === 0) {
      return NextResponse.json(
        { error: '해당 공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트할 필드들 준비
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.priority !== undefined) updateData.priority = body.priority;

    // 공지사항 업데이트
    const updatedAnnouncement = await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 수정되었습니다.',
      announcement: updatedAnnouncement[0]
    });

  } catch (error) {
    console.error('공지사항 수정 API 오류:', error);
    return NextResponse.json(
      { error: '공지사항 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: AnnouncementPageProps
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '공지사항 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 공지사항 존재 여부 확인
    const existingAnnouncement = await db
      .select({ id: announcements.id })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (existingAnnouncement.length === 0) {
      return NextResponse.json(
        { error: '해당 공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관련된 읽음 기록들 먼저 삭제
    await db
      .delete(announcementReads)
      .where(eq(announcementReads.announcementId, id));

    // 공지사항 삭제
    await db
      .delete(announcements)
      .where(eq(announcements.id, id));

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('공지사항 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '공지사항 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 