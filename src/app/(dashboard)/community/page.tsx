'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Filter,
  BookOpen,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface CommunityPost {
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
  commentCount: number;
}

const CATEGORIES = [
  { value: 'all', label: '전체', icon: MessageSquare },
  { value: 'qna', label: 'Q&A', icon: AlertCircle },
  { value: 'free', label: '자유게시판', icon: MessageCircle },
];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'unanswered', label: '미답변' },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, sortBy]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (sortBy) params.append('sortBy', sortBy);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/community/posts?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('게시글 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = CATEGORIES.find(c => c.value === category);
    const IconComponent = categoryObj?.icon || MessageSquare;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'qna':
        return 'bg-blue-100 text-blue-800';
      case 'free':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return date.toLocaleDateString();
  };

  const filteredPosts = posts;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
              <p className="text-gray-600">질문하고 답변하며 함께 성장하세요</p>
            </div>
          </div>
          
          <Link
            href="/community/write"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>글쓰기</span>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 게시글</p>
              <p className="text-2xl font-semibold text-gray-900">{posts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Q&A</p>
              <p className="text-2xl font-semibold text-gray-900">
                {posts.filter(p => p.category === 'qna').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">자유게시판</p>
              <p className="text-2xl font-semibold text-gray-900">
                {posts.filter(p => p.category === 'free').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">답변 완료</p>
              <p className="text-2xl font-semibold text-gray-900">
                {posts.filter(p => p.category === 'qna' && p.isAnswered).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.value;
              
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.label}</span>
                  {category.value !== 'all' && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {posts.filter(p => p.category === category.value).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 검색 및 필터 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="divide-y divide-gray-200">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">게시글이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">첫 번째 게시글을 작성해보세요.</p>
              <div className="mt-4">
                <Link
                  href="/community/write"
                  className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>글쓰기</span>
                </Link>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/community/posts/${post.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(post.category || '')}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(post.category || '')}`}>
                        {CATEGORIES.find(c => c.value === post.category)?.label}
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
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{post.authorName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{getRelativeTime(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.viewCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 