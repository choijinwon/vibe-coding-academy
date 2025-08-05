'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  BookOpen,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Announcement {
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
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  readAt?: string | null;
}

const CATEGORIES = [
  { value: 'general', label: '일반', icon: '📢' },
  { value: 'academic', label: '학사', icon: '📚' },
  { value: 'event', label: '행사', icon: '🎉' },
  { value: 'urgent', label: '긴급', icon: '🚨' },
  { value: 'maintenance', label: '시스템', icon: '🔧' },
];

const PRIORITIES = [
  { value: 'low', label: '낮음', color: 'text-gray-500 bg-gray-100' },
  { value: 'normal', label: '보통', color: 'text-blue-500 bg-blue-100' },
  { value: 'high', label: '높음', color: 'text-orange-500 bg-orange-100' },
  { value: 'urgent', label: '긴급', color: 'text-red-500 bg-red-100' },
];

export default function StudentAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all'); // all, read, unread
  
  // 상세 보기 모달 상태
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [user, categoryFilter, priorityFilter, readFilter]);

  const fetchAnnouncements = async () => {
    if (!user) return;
    
    try {
      const params = new URLSearchParams();
      params.append('userId', user.id);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (readFilter === 'unread') params.append('unreadOnly', 'true');
      
      const response = await fetch(`/api/announcements?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredData = data.announcements;
        
        // 읽음 상태 필터링 (클라이언트 사이드)
        if (readFilter === 'read') {
          filteredData = filteredData.filter((a: Announcement) => a.isRead);
        }
        
        setAnnouncements(filteredData);
      }
    } catch (error) {
      console.error('공지사항 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // 로컬 상태 업데이트
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === announcementId 
              ? { ...announcement, isRead: true, readAt: new Date().toISOString() }
              : announcement
          )
        );
      }
    } catch (error) {
      console.error('읽음 처리 오류:', error);
    }
  };

  const handleAnnouncementClick = async (announcement: Announcement) => {
    // 읽지 않은 공지사항인 경우 읽음 처리
    if (!announcement.isRead) {
      await markAsRead(announcement.id);
    }
    
    setSelectedAnnouncement({
      ...announcement,
      isRead: true,
      readAt: announcement.readAt || new Date().toISOString(),
    });
  };

  const getPriorityStyle = (priority: string) => {
    const priorityObj = PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || 'text-gray-500 bg-gray-100';
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = CATEGORIES.find(c => c.value === category);
    return categoryObj?.icon || '📢';
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = announcements.filter(a => !a.isRead).length;

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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Megaphone className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
              <p className="text-gray-600">중요한 소식과 공지를 확인하세요</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg">
              <Bell className="h-4 w-4" />
              <span className="font-medium">{unreadCount}개의 읽지 않은 공지</span>
            </div>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Megaphone className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 공지</p>
              <p className="text-2xl font-semibold text-gray-900">{announcements.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeOff className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">읽지 않음</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">읽음</p>
              <p className="text-2xl font-semibold text-gray-900">{announcements.length - unreadCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">긴급</p>
              <p className="text-2xl font-semibold text-gray-900">
                {announcements.filter(a => a.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="공지사항 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 카테고리 필터 */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">모든 카테고리</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>

          {/* 우선순위 필터 */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">모든 우선순위</option>
            {PRIORITIES.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>

          {/* 읽음 상태 필터 */}
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">모든 공지</option>
            <option value="unread">읽지 않음</option>
            <option value="read">읽음</option>
          </select>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            공지사항 목록 ({filteredAnnouncements.length}개)
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAnnouncements.length === 0 ? (
            <div className="p-8 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">공지사항이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새로운 공지사항을 기다려주세요.</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div 
                key={announcement.id} 
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !announcement.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl">{getCategoryIcon(announcement.category || '')}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(announcement.priority || '')}`}>
                        {PRIORITIES.find(p => p.value === announcement.priority)?.label}
                      </span>
                      
                      {announcement.courseId ? (
                        <div className="flex items-center space-x-1 text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          <BookOpen className="h-3 w-3" />
                          <span>{announcement.courseName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          <Users className="h-3 w-3" />
                          <span>전체 공지</span>
                        </div>
                      )}
                      
                      {!announcement.isRead && (
                        <div className="flex items-center space-x-1 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                          <Clock className="h-3 w-3" />
                          <span>새 공지</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className={`text-lg mb-2 ${!announcement.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {announcement.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>작성자: {announcement.authorName}</span>
                      </div>
                      {announcement.isRead && announcement.readAt && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>읽음 ({new Date(announcement.readAt).toLocaleDateString()})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {announcement.isRead ? (
                      <div title="읽음">
                        <Eye className="h-5 w-5 text-green-500" />
                      </div>
                    ) : (
                      <div title="읽지 않음">
                        <EyeOff className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 공지사항 상세 보기 모달 */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(selectedAnnouncement.category || '')}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedAnnouncement.title}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(selectedAnnouncement.priority || '')}`}>
                        {PRIORITIES.find(p => p.value === selectedAnnouncement.priority)?.label}
                      </span>
                      {selectedAnnouncement.courseId ? (
                        <div className="flex items-center space-x-1 text-sm text-indigo-600">
                          <BookOpen className="h-3 w-3" />
                          <span>{selectedAnnouncement.courseName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-sm text-purple-600">
                          <Users className="h-3 w-3" />
                          <span>전체 공지</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedAnnouncement.content}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>작성일: {new Date(selectedAnnouncement.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span>작성자: {selectedAnnouncement.authorName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>읽음 완료</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 