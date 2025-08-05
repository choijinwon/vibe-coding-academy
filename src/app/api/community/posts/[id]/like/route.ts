import { NextRequest, NextResponse } from 'next/server';
import { db, communityPosts } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

interface LikePageProps {
  params: { id: string };
}

interface ToggleLikeRequest {
  userId: string;
  isLiked: boolean; // 현재 좋아요 상태
}

export async function POST(
  request: NextRequest,
  { params }: LikePageProps
) {
  try {
    const { id: postId } = params;
    const body: ToggleLikeRequest = await request.json();
    const { userId, isLiked } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 여부 확인
    const existingPost = await db
      .select({ id: communityPosts.id, likeCount: communityPosts.likeCount })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 좋아요 토글 (실제로는 좋아요 테이블을 별도로 만들어야 하지만, 간단히 구현)
    // 현재 좋아요 상태에 따라 증가/감소
    const increment = isLiked ? -1 : 1;

    const updatedPost = await db
      .update(communityPosts)
      .set({
        likeCount: sql`GREATEST(0, ${communityPosts.likeCount} + ${increment})`,
      })
      .where(eq(communityPosts.id, postId))
      .returning();

    return NextResponse.json({
      success: true,
      message: isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.',
      isLiked: !isLiked,
      likeCount: updatedPost[0].likeCount
    });

  } catch (error) {
    console.error('좋아요 토글 API 오류:', error);
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: LikePageProps
) {
  try {
    const { id: postId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글의 좋아요 수 조회
    const post = await db
      .select({ likeCount: communityPosts.likeCount })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // TODO: 실제로는 사용자별 좋아요 상태를 별도 테이블에서 조회해야 함
    // 현재는 모의 데이터로 처리
    const isLiked = userId ? Math.random() > 0.5 : false;

    return NextResponse.json({
      success: true,
      likeCount: post[0].likeCount,
      isLiked
    });

  } catch (error) {
    console.error('좋아요 상태 조회 API 오류:', error);
    return NextResponse.json(
      { error: '좋아요 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 