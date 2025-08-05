'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  MessageCircle,
  BookOpen
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

export default function CommunityWritePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'free' as 'qna' | 'free',
    courseId: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCourses();
  }, [user, router]);

  const fetchCourses = async () => {
    try {
      // 모의 강의 데이터 (실제로는 API에서 조회)
      const mockCourses = [
        { id: '1', title: 'React 기초부터 실전까지' },
        { id: '2', title: 'Next.js 마스터클래스' },
        { id: '3', title: 'TypeScript 완벽 가이드' },
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error('강의 목록 조회 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          authorId: user.id,
          courseId: formData.courseId || null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('게시글이 성공적으로 등록되었습니다.');
        router.push('/community');
      } else {
        alert(data.error || '게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 생성 오류:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // 미리보기 기능 (간단한 alert로 구현)
    alert(`제목: ${formData.title}\n\n내용:\n${formData.content}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/community"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">글쓰기</h1>
              <p className="text-gray-600">질문을 올리거나 자유롭게 소통해보세요</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center space-x-2 text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>미리보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 작성 폼 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              게시판 선택 *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="qna"
                  checked={formData.category === 'qna'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'qna' })}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-colors ${
                  formData.category === 'qna'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-6 w-6 ${
                      formData.category === 'qna' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className={`font-medium ${
                        formData.category === 'qna' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        Q&A 게시판
                      </h3>
                      <p className={`text-sm ${
                        formData.category === 'qna' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        궁금한 점을 질문하고 답변을 받아보세요
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="free"
                  checked={formData.category === 'free'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'free' })}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-colors ${
                  formData.category === 'free'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className={`h-6 w-6 ${
                      formData.category === 'free' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className={`font-medium ${
                        formData.category === 'free' ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        자유게시판
                      </h3>
                      <p className={`text-sm ${
                        formData.category === 'free' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        자유롭게 소통하고 정보를 공유해보세요
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 강의 선택 (선택사항) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 강의 (선택사항)
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">강의를 선택하세요 (전체 게시판)</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              특정 강의와 관련된 내용이라면 강의를 선택해주세요.
            </p>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={formData.category === 'qna' ? '궁금한 점을 간단히 요약해주세요' : '자유롭게 제목을 작성해주세요'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={
                formData.category === 'qna' 
                  ? '구체적인 상황과 문제점을 자세히 설명해주세요.\n\n예시:\n- 어떤 상황에서 문제가 발생했나요?\n- 어떤 에러 메시지가 나타났나요?\n- 어떤 결과를 기대하고 있나요?'
                  : '자유롭게 내용을 작성해주세요.\n\n커뮤니티 규칙:\n- 서로 존중하며 소통해주세요\n- 유익한 정보 공유를 환영합니다\n- 질문은 Q&A 게시판을 이용해주세요'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 작성 가이드 */}
          <div className={`p-4 rounded-lg ${
            formData.category === 'qna' ? 'bg-blue-50' : 'bg-green-50'
          }`}>
            <div className="flex">
              {formData.category === 'qna' ? (
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              ) : (
                <MessageCircle className="h-5 w-5 text-green-400 mt-0.5" />
              )}
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  formData.category === 'qna' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  {formData.category === 'qna' ? '좋은 질문 작성 팁' : '좋은 글 작성 팁'}
                </h3>
                <div className={`mt-2 text-sm ${
                  formData.category === 'qna' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {formData.category === 'qna' ? (
                    <ul className="list-disc list-inside space-y-1">
                      <li>구체적이고 명확한 제목을 작성해주세요</li>
                      <li>문제 상황을 자세히 설명해주세요</li>
                      <li>시도해본 해결 방법이 있다면 함께 적어주세요</li>
                      <li>관련 코드가 있다면 코드 블록으로 첨부해주세요</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      <li>다른 사람에게 도움이 되는 내용을 공유해주세요</li>
                      <li>경험과 노하우를 나누어주세요</li>
                      <li>건설적이고 긍정적인 소통을 부탁드립니다</li>
                      <li>관련 링크나 자료가 있다면 함께 공유해주세요</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/community"
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? '등록 중...' : '게시글 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 