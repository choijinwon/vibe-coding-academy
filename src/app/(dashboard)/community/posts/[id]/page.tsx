'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  User,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Reply,
  Edit,
  Trash2,
  Send,
  Award
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  courseId: string | null;
  courseName: string | null;
  category: string | null;
  isAnswered: boolean | null;
  viewCount: number | null;
  likeCount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string | null;
  authorName: string | null;
  content: string;
  parentId: string | null;
  isAnswer: boolean | null;
  likeCount: number | null;
  createdAt: string;
  updatedAt: string;
  children: Comment[];
}

export default function CommunityPostDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostDetail();
    }
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      // 조회수 증가와 함께 게시글 상세 정보 조회
      const response = await fetch(`/api/community/posts/${id}?incrementView=true`);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.post);
        setComments(data.comments);
      } else {
        alert('게시글을 찾을 수 없습니다.');
        router.push('/community');
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      alert('게시글 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          isLiked: isLiked,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLiked(data.isLiked);
        if (post) {
          setPost({ ...post, likeCount: data.likeCount });
        }
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/community/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          authorId: user.id,
          parentId: parentId || null,
          isAnswer: false, // TODO: Q&A 답변 채택 기능 추가
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // 댓글 목록 새로고침
        fetchPostDetail();
        if (parentId) {
          setReplyContent('');
          setReplyTo(null);
        } else {
          setNewComment('');
        }
      } else {
        alert(data.error || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 등록 오류:', error);
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isReply = depth > 0;
    const maxDepth = 2; // 최대 2단계까지만 들여쓰기

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 mt-4' : 'mt-6'} ${depth > maxDepth ? 'ml-0' : ''}`}
      >
        <div className={`bg-white border rounded-lg p-4 ${comment.isAnswer ? 'border-green-200 bg-green-50' : ''}`}>
          {comment.isAnswer && (
            <div className="flex items-center space-x-2 mb-3">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">채택된 답변</span>
            </div>
          )}
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{comment.authorName}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
              
              <p className="text-gray-700 whitespace-pre-wrap mb-3">
                {comment.content}
              </p>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{comment.likeCount}</span>
                </button>
                
                {user && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-500 transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    <span>답글</span>
                  </button>
                )}
                
                {user && user.id === comment.authorId && (
                  <div className="flex space-x-2">
                    <button className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 답글 작성 폼 */}
        {replyTo === comment.id && user && (
          <div className="mt-4 ml-4 bg-gray-50 p-4 rounded-lg">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 작성해주세요..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => setReplyTo(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleSubmitComment(comment.id)}
                disabled={isSubmittingComment || !replyContent.trim()}
                className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                <span>답글 등록</span>
              </button>
            </div>
          </div>
        )}

        {/* 대댓글들 */}
        {comment.children && comment.children.map(child => 
          renderComment(child, depth + 1)
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
        <Link
          href="/community"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          커뮤니티로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 네비게이션 */}
      <div className="flex items-center space-x-4">
        <Link
          href="/community"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>커뮤니티</span>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">
          {post.category === 'qna' ? 'Q&A' : '자유게시판'}
        </span>
      </div>

      {/* 게시글 내용 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* 게시글 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                {post.category === 'qna' ? (
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                ) : (
                  <MessageCircle className="h-5 w-5 text-green-500" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.category === 'qna' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {post.category === 'qna' ? 'Q&A' : '자유게시판'}
                </span>
                
                {post.courseId && (
                  <div className="flex items-center space-x-1 text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    <BookOpen className="h-3 w-3" />
                    <span>{post.courseName}</span>
                  </div>
                )}
                
                {post.category === 'qna' && (
                  <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded ${
                    post.isAnswered 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-orange-600 bg-orange-50'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    <span>{post.isAnswered ? '답변완료' : '답변대기'}</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount}</span>
                </div>
              </div>
            </div>
            
            {user && user.id === post.authorId && (
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 게시글 본문 */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        {/* 좋아요 & 액션 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likeCount}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>댓글 {comments.length}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            댓글 {comments.length}개
          </h2>
        </div>

        {/* 댓글 작성 */}
        {user && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 작성해주세요..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleSubmitComment()}
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmittingComment ? '등록 중...' : '댓글 등록'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="p-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">아직 댓글이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">첫 번째 댓글을 작성해보세요.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 