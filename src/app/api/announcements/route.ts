import { NextRequest, NextResponse } from 'next/server';
import { db, announcements, announcementReads, users, courses, courseRegistrations } from '@/lib/db';
import { eq, and, desc, sql, or, isNull } from 'drizzle-orm';
import { mockEmailService, getAnnouncementRecipients } from '@/lib/email/mock-email-service';

interface CreateAnnouncementRequest {
  title: string;
  content: string;
  authorId: string;
  courseId?: string; // null for global announcements
  category: 'general' | 'academic' | 'event' | 'urgent' | 'maintenance';
  priority: 'low' | 'normal' | 'high' | 'urgent';
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

export async function POST(request: NextRequest) {
  try {
    const body: CreateAnnouncementRequest = await request.json();
    const { title, content, authorId, courseId, category, priority } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: '제목, 내용, 작성자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 새 공지사항 생성
    const newAnnouncement = await db
      .insert(announcements)
      .values({
        title,
        content,
        authorId,
        courseId: courseId || null,
        category: category || 'general',
        priority: priority || 'normal',
        isEmailSent: false,
      })
      .returning();

    const createdAnnouncement = newAnnouncement[0];

    // 이메일 알림 발송 (백그라운드에서 실행)
    try {
      // 작성자 정보 조회
      const author = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, authorId))
        .limit(1);

      // 강의 정보 조회 (클래스별 공지인 경우)
      let courseName: string | undefined;
      if (courseId) {
        const course = await db
          .select({ title: courses.title })
          .from(courses)
          .where(eq(courses.id, courseId))
          .limit(1);
        courseName = course[0]?.title;
      }

      // 수신자 목록 조회
      const recipients = await getAnnouncementRecipients(courseId || undefined);

      if (recipients.length > 0) {
        // 이메일 발송
        const emailResult = await mockEmailService.sendAnnouncementEmail({
          title,
          content,
          authorName: author[0]?.name || '관리자',
          courseName,
          priority: priority || 'normal',
          category: category || 'general',
        }, recipients);

        // 이메일 발송 결과에 따라 isEmailSent 플래그 업데이트
        if (emailResult.success) {
          await db
            .update(announcements)
            .set({ isEmailSent: true })
            .where(eq(announcements.id, createdAnnouncement.id));
          
          console.log(`✅ 공지사항 이메일 알림 발송 완료: ${recipients.length}명`);
        } else {
          console.log(`❌ 공지사항 이메일 알림 발송 실패: ${emailResult.error}`);
        }
      }
    } catch (emailError) {
      console.error('이메일 발송 중 오류:', emailError);
      // 이메일 발송 실패해도 공지사항 생성은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 등록되었습니다.',
      announcement: {
        ...createdAnnouncement,
        isEmailSent: false // 초기값으로 설정 (백그라운드에서 업데이트됨)
      }
    });

  } catch (error) {
    console.error('공지사항 생성 API 오류:', error);
    return NextResponse.json(
      { error: '공지사항 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 기본 조건들
    const conditions = [];
    
    // 특정 강의의 공지사항 또는 전체 공지사항
    if (courseId) {
      conditions.push(eq(announcements.courseId, courseId));
    } else {
      // 전체 공지사항과 사용자가 수강중인 강의의 공지사항 모두 조회
      if (userId) {
        // 사용자가 수강 중인 강의 ID들 조회
        const enrolledCourses = await db
          .select({ courseId: courseRegistrations.courseId })
          .from(courseRegistrations)
          .where(
            and(
              eq(courseRegistrations.userId, userId),
              eq(courseRegistrations.status, 'approved')
            )
          );

        const enrolledCourseIds = enrolledCourses.map(c => c.courseId);
        
        // 전체 공지사항(courseId가 null) 또는 수강 중인 강의의 공지사항
        if (enrolledCourseIds.length > 0) {
          conditions.push(
            or(
              isNull(announcements.courseId),
              sql`${announcements.courseId} IN ${enrolledCourseIds}`
            )
          );
        } else {
          conditions.push(isNull(announcements.courseId));
        }
      } else {
        // 로그인하지 않은 경우 전체 공지사항만
        conditions.push(isNull(announcements.courseId));
      }
    }

    // 카테고리 필터
    if (category && category !== 'all') {
      conditions.push(eq(announcements.category, category));
    }

    // 우선순위 필터
    if (priority && priority !== 'all') {
      conditions.push(eq(announcements.priority, priority));
    }

    // 기본 쿼리
    let query = db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        // 우선순위 순서: urgent > high > normal > low
        sql`CASE ${announcements.priority} 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
            ELSE 5 END`,
        desc(announcements.createdAt)
      )
      .limit(limit)
      .offset(offset);

    const announcementList = await query;

    // 읽음 상태 정보 추가 (userId가 있는 경우)
    let announcementsWithReadStatus: AnnouncementWithReadStatus[] = announcementList;
    
    if (userId) {
      const announcementIds = announcementList.map(a => a.id);
      
      if (announcementIds.length > 0) {
        // 사용자의 읽음 상태 조회
        const readStatuses = await db
          .select({
            announcementId: announcementReads.announcementId,
            readAt: announcementReads.readAt,
          })
          .from(announcementReads)
          .where(
            and(
              eq(announcementReads.userId, userId),
              sql`${announcementReads.announcementId} IN ${announcementIds}`
            )
          );

        const readStatusMap = new Map(
          readStatuses.map(r => [r.announcementId, r.readAt])
        );

        announcementsWithReadStatus = announcementList.map(announcement => ({
          ...announcement,
          isRead: readStatusMap.has(announcement.id),
          readAt: readStatusMap.get(announcement.id) || null,
        }));

        // 읽지 않은 공지사항만 필터링 (요청된 경우)
        if (unreadOnly) {
          announcementsWithReadStatus = announcementsWithReadStatus.filter(a => !a.isRead);
        }
      }
    }

    // 총 개수 조회
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(announcements)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      announcements: announcementsWithReadStatus,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      }
    });

  } catch (error) {
    console.error('공지사항 조회 API 오류:', error);
    return NextResponse.json(
      { error: '공지사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 