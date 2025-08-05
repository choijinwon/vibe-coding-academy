import { NextRequest, NextResponse } from 'next/server';
import { db, announcementReads, announcements } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface ReadPageProps {
  params: { id: string };
}

interface MarkAsReadRequest {
  userId: string;
}

export async function POST(
  request: NextRequest,
  { params }: ReadPageProps
) {
  try {
    const { id } = params;
    const body: MarkAsReadRequest = await request.json();
    const { userId } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: '공지사항 ID와 사용자 ID가 필요합니다.' },
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

    // 이미 읽음 처리된 공지사항인지 확인
    const existingRead = await db
      .select({ id: announcementReads.id })
      .from(announcementReads)
      .where(
        and(
          eq(announcementReads.announcementId, id),
          eq(announcementReads.userId, userId)
        )
      )
      .limit(1);

    if (existingRead.length > 0) {
      return NextResponse.json({
        success: true,
        message: '이미 읽음 처리된 공지사항입니다.',
        alreadyRead: true
      });
    }

    // 읽음 상태 기록 생성
    const newReadRecord = await db
      .insert(announcementReads)
      .values({
        announcementId: id,
        userId: userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '공지사항을 읽음 처리했습니다.',
      readRecord: newReadRecord[0]
    });

  } catch (error) {
    console.error('공지사항 읽음 처리 API 오류:', error);
    return NextResponse.json(
      { error: '읽음 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: ReadPageProps
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

    if (userId) {
      // 특정 사용자의 읽음 상태 조회
      const readStatus = await db
        .select({
          id: announcementReads.id,
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

      return NextResponse.json({
        success: true,
        isRead: readStatus.length > 0,
        readAt: readStatus[0]?.readAt || null
      });
    } else {
      // 전체 읽음 통계 조회
      const readStatistics = await db
        .select({
          userId: announcementReads.userId,
          readAt: announcementReads.readAt,
        })
        .from(announcementReads)
        .where(eq(announcementReads.announcementId, id));

      return NextResponse.json({
        success: true,
        totalReaders: readStatistics.length,
        readers: readStatistics
      });
    }

  } catch (error) {
    console.error('공지사항 읽음 상태 조회 API 오류:', error);
    return NextResponse.json(
      { error: '읽음 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: ReadPageProps
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: '공지사항 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 읽음 상태 제거 (읽지 않음으로 되돌리기)
    const deletedRecord = await db
      .delete(announcementReads)
      .where(
        and(
          eq(announcementReads.announcementId, id),
          eq(announcementReads.userId, userId)
        )
      )
      .returning();

    if (deletedRecord.length === 0) {
      return NextResponse.json(
        { error: '읽음 기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '읽음 상태를 해제했습니다.'
    });

  } catch (error) {
    console.error('공지사항 읽음 상태 해제 API 오류:', error);
    return NextResponse.json(
      { error: '읽음 상태 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 