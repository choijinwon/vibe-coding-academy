import { NextRequest, NextResponse } from 'next/server';
import { db, communityPosts, communityComments, users, courses } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';

interface PostPageProps {
  params: { id: string };
}

interface UpdatePostRequest {
  title?: string;
  content?: string;
  isAnswered?: boolean; // for Q&A posts
}

export async function GET(
  request: NextRequest,
  { params }: PostPageProps
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get('incrementView') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 조회수 증가 (실제 사용자가 게시글을 볼 때만)
    if (incrementView) {
      await db
        .update(communityPosts)
        .set({
          viewCount: sql`${communityPosts.viewCount} + 1`,
        })
        .where(eq(communityPosts.id, id));
    }

    // 게시글 상세 정보 조회
    const postDetails = await db
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
      .where(eq(communityPosts.id, id))
      .limit(1);

    if (postDetails.length === 0) {
      return NextResponse.json(
        { error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = postDetails[0];

    // 댓글 목록 조회 (계층 구조로)
    const comments = await db
      .select({
        id: communityComments.id,
        postId: communityComments.postId,
        authorId: communityComments.authorId,
        authorName: users.name,
        content: communityComments.content,
        parentId: communityComments.parentId,
        isAnswer: communityComments.isAnswer,
        likeCount: communityComments.likeCount,
        createdAt: communityComments.createdAt,
        updatedAt: communityComments.updatedAt,
      })
      .from(communityComments)
      .leftJoin(users, eq(communityComments.authorId, users.id))
      .where(eq(communityComments.postId, id))
      .orderBy(communityComments.createdAt);

    // 댓글을 계층 구조로 정리
    const commentMap = new Map();
    const rootComments: any[] = [];

    // 1단계: 모든 댓글을 맵에 저장하고 children 배열 초기화
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    // 2단계: 부모-자식 관계 설정
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return NextResponse.json({
      success: true,
      post,
      comments: rootComments,
      commentCount: comments.length,
    });

  } catch (error) {
    console.error('게시글 상세 조회 API 오류:', error);
    return NextResponse.json(
      { error: '게시글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: PostPageProps
) {
  try {
    const { id } = params;
    const body: UpdatePostRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 여부 확인
    const existingPost = await db
      .select({ id: communityPosts.id })
      .from(communityPosts)
      .where(eq(communityPosts.id, id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트할 필드들 준비
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.isAnswered !== undefined) updateData.isAnswered = body.isAnswered;

    // 게시글 업데이트
    const updatedPost = await db
      .update(communityPosts)
      .set(updateData)
      .where(eq(communityPosts.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: '게시글이 성공적으로 수정되었습니다.',
      post: updatedPost[0]
    });

  } catch (error) {
    console.error('게시글 수정 API 오류:', error);
    return NextResponse.json(
      { error: '게시글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: PostPageProps
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 여부 확인
    const existingPost = await db
      .select({ id: communityPosts.id })
      .from(communityPosts)
      .where(eq(communityPosts.id, id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관련된 댓글들 먼저 삭제
    await db
      .delete(communityComments)
      .where(eq(communityComments.postId, id));

    // 게시글 삭제
    await db
      .delete(communityPosts)
      .where(eq(communityPosts.id, id));

    return NextResponse.json({
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('게시글 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '게시글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 