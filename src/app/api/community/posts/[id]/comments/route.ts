import { NextRequest, NextResponse } from 'next/server';
import { db, communityComments, communityPosts, users } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';

interface CommentPageProps {
  params: { id: string };
}

interface CreateCommentRequest {
  content: string;
  authorId: string;
  parentId?: string; // for nested replies
  isAnswer?: boolean; // for Q&A answers
}

export async function POST(
  request: NextRequest,
  { params }: CommentPageProps
) {
  try {
    const { id: postId } = params;
    const body: CreateCommentRequest = await request.json();
    const { content, authorId, parentId, isAnswer } = body;

    if (!content || !authorId) {
      return NextResponse.json(
        { error: '내용과 작성자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 여부 확인
    const existingPost = await db
      .select({ id: communityPosts.id, category: communityPosts.category })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 부모 댓글 존재 여부 확인 (답글인 경우)
    if (parentId) {
      const parentComment = await db
        .select({ id: communityComments.id })
        .from(communityComments)
        .where(eq(communityComments.id, parentId))
        .limit(1);

      if (parentComment.length === 0) {
        return NextResponse.json(
          { error: '부모 댓글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // 새 댓글 생성
    const newComment = await db
      .insert(communityComments)
      .values({
        postId,
        content,
        authorId,
        parentId: parentId || null,
        isAnswer: isAnswer || false,
        likeCount: 0,
      })
      .returning();

    // Q&A 답변 채택 시 게시글 상태 업데이트
    if (isAnswer && existingPost[0].category === 'qna') {
      await db
        .update(communityPosts)
        .set({ isAnswered: true })
        .where(eq(communityPosts.id, postId));
    }

    // 생성된 댓글의 상세 정보 조회 (작성자 정보 포함)
    const commentWithAuthor = await db
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
      .where(eq(communityComments.id, newComment[0].id))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: isAnswer ? '답변이 성공적으로 등록되었습니다.' : '댓글이 성공적으로 등록되었습니다.',
      comment: commentWithAuthor[0]
    });

  } catch (error) {
    console.error('댓글 생성 API 오류:', error);
    return NextResponse.json(
      { error: '댓글 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: CommentPageProps
) {
  try {
    const { id: postId } = params;

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 댓글 목록 조회
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
      .where(eq(communityComments.postId, postId))
      .orderBy(
        // 답변을 먼저 보여주고, 그 다음 일반 댓글을 시간순으로
        sql`CASE WHEN ${communityComments.isAnswer} THEN 0 ELSE 1 END`,
        communityComments.createdAt
      );

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
      comments: rootComments,
      totalComments: comments.length,
    });

  } catch (error) {
    console.error('댓글 목록 조회 API 오류:', error);
    return NextResponse.json(
      { error: '댓글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 