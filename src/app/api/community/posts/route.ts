import { NextRequest, NextResponse } from 'next/server';
import { db, communityPosts, users, courses } from '@/lib/db';
import { eq, and, desc, sql, or, isNull, like, ilike } from 'drizzle-orm';

interface CreatePostRequest {
  title: string;
  content: string;
  authorId: string;
  courseId?: string; // null for general posts
  category: 'qna' | 'free';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePostRequest = await request.json();
    const { title, content, authorId, courseId, category } = body;

    if (!title || !content || !authorId || !category) {
      return NextResponse.json(
        { error: '제목, 내용, 작성자, 카테고리 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 새 게시글 생성
    const newPost = await db
      .insert(communityPosts)
      .values({
        title,
        content,
        authorId,
        courseId: courseId || null,
        category,
        isAnswered: false,
        viewCount: 0,
        likeCount: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '게시글이 성공적으로 등록되었습니다.',
      post: newPost[0]
    });

  } catch (error) {
    console.error('게시글 생성 API 오류:', error);
    return NextResponse.json(
      { error: '게시글 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // qna, free, all
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'latest'; // latest, popular, unanswered
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 기본 조건들
    const conditions = [];
    
    // 카테고리 필터
    if (category && category !== 'all') {
      conditions.push(eq(communityPosts.category, category));
    }

    // 강의별 필터
    if (courseId) {
      conditions.push(eq(communityPosts.courseId, courseId));
    }

    // 검색 (제목 + 내용)
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(communityPosts.title, searchPattern),
          ilike(communityPosts.content, searchPattern)
        )
      );
    }

    // 정렬 조건
    let orderBy;
    switch (sortBy) {
      case 'popular':
        orderBy = [desc(communityPosts.likeCount), desc(communityPosts.createdAt)];
        break;
      case 'unanswered':
        conditions.push(eq(communityPosts.category, 'qna'));
        conditions.push(eq(communityPosts.isAnswered, false));
        orderBy = [desc(communityPosts.createdAt)];
        break;
      case 'latest':
      default:
        orderBy = [desc(communityPosts.createdAt)];
        break;
    }

    // 게시글 목록 조회
    const posts = await db
      .select({
        id: communityPosts.id,
        title: communityPosts.title,
        content: communityPosts.content,
        authorId: communityPosts.authorId,
        authorName: users.name,
        courseId: communityPosts.courseId,
        courseName: courses.title,
        category: communityPosts.category,
        isAnswered: communityPosts.isAnswered,
        viewCount: communityPosts.viewCount,
        likeCount: communityPosts.likeCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.authorId, users.id))
      .leftJoin(courses, eq(communityPosts.courseId, courses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    // 각 게시글의 댓글 수 조회
    const postIds = posts.map(post => post.id);
    let commentCounts: Record<string, number> = {};
    
    if (postIds.length > 0) {
      const commentCountResults = await db
        .select({
          postId: sql<string>`${communityPosts.id}`,
          commentCount: sql<number>`count(${sql.raw('cc.id')})`,
        })
        .from(communityPosts)
        .leftJoin(sql.raw('community_comments cc'), sql`cc.post_id = ${communityPosts.id}`)
        .where(sql`${communityPosts.id} IN ${postIds}`)
        .groupBy(communityPosts.id);

      commentCounts = Object.fromEntries(
        commentCountResults.map(result => [result.postId, result.commentCount])
      );
    }

    // 게시글에 댓글 수 정보 추가
    const postsWithCommentCount = posts.map(post => ({
      ...post,
      commentCount: commentCounts[post.id] || 0,
    }));

    // 총 개수 조회
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      posts: postsWithCommentCount,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      }
    });

  } catch (error) {
    console.error('게시글 목록 조회 API 오류:', error);
    return NextResponse.json(
      { error: '게시글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 