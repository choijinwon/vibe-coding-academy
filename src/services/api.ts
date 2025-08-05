import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  ApiResponse, 
  User, 
  Course, 
  Assignment, 
  AssignmentSubmission,
  Announcement, 
  CommunityPost, 
  CommunityComment,
  Attendance,
  AnalyticsData,
  PaymentRequest
} from '../types';

// API 기본 URL - 배포된 웹 플랫폼 주소
const BASE_URL = 'https://vibecoding-academy.netlify.app/api';

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 토큰 만료 또는 인증 오류
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // 토큰 관리
  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // 일반적인 API 요청 래퍼
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<T>(config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || '요청 처리 중 오류가 발생했습니다.',
      };
    }
  }

  // 인증 관련 API
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; access_token: string }>> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ user: User; access_token: string }>> {
    return this.request({
      method: 'POST',
      url: '/auth/signup',
      data: { email, password, name },
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string; refresh_token?: string; user?: User }>> {
    return this.request({
      method: 'POST',
      url: '/auth/refresh',
      data: { refresh_token: refreshToken },
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }

  // 강의 관련 API
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return this.request({
      method: 'GET',
      url: '/courses',
    });
  }

  async getCourse(courseId: string): Promise<ApiResponse<Course>> {
    return this.request({
      method: 'GET',
      url: `/courses/${courseId}`,
    });
  }

  async enrollCourse(courseId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request({
      method: 'POST',
      url: `/courses/${courseId}/enroll`,
    });
  }

  // 과제 관련 API
  async getAssignments(courseId?: string): Promise<ApiResponse<Assignment[]>> {
    const url = courseId ? `/assignments?courseId=${courseId}` : '/assignments';
    return this.request({
      method: 'GET',
      url,
    });
  }

  async getAssignment(assignmentId: string): Promise<ApiResponse<Assignment>> {
    return this.request({
      method: 'GET',
      url: `/assignments/${assignmentId}`,
    });
  }

  async submitAssignment(assignmentId: string, content: string, fileUrl?: string): Promise<ApiResponse<AssignmentSubmission>> {
    return this.request({
      method: 'POST',
      url: `/assignments/${assignmentId}/submissions`,
      data: { content, fileUrl },
    });
  }

  async getAssignmentSubmissions(assignmentId: string): Promise<ApiResponse<AssignmentSubmission[]>> {
    return this.request({
      method: 'GET',
      url: `/assignments/${assignmentId}/submissions`,
    });
  }

  // 공지사항 관련 API
  async getAnnouncements(courseId?: string): Promise<ApiResponse<Announcement[]>> {
    const url = courseId ? `/announcements?courseId=${courseId}` : '/announcements';
    return this.request({
      method: 'GET',
      url,
    });
  }

  async getAnnouncement(announcementId: string): Promise<ApiResponse<Announcement>> {
    return this.request({
      method: 'GET',
      url: `/announcements/${announcementId}`,
    });
  }

  async markAnnouncementAsRead(announcementId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request({
      method: 'POST',
      url: `/announcements/${announcementId}/read`,
    });
  }

  // 커뮤니티 관련 API
  async getCommunityPosts(category?: string, courseId?: string): Promise<ApiResponse<CommunityPost[]>> {
    let url = '/community/posts?';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (courseId) params.append('courseId', courseId);
    
    return this.request({
      method: 'GET',
      url: url + params.toString(),
    });
  }

  async getCommunityPost(postId: string): Promise<ApiResponse<CommunityPost>> {
    return this.request({
      method: 'GET',
      url: `/community/posts/${postId}`,
    });
  }

  async createCommunityPost(title: string, content: string, category: 'qna' | 'free', courseId?: string): Promise<ApiResponse<CommunityPost>> {
    return this.request({
      method: 'POST',
      url: '/community/posts',
      data: { title, content, category, courseId },
    });
  }

  async getPostComments(postId: string): Promise<ApiResponse<CommunityComment[]>> {
    return this.request({
      method: 'GET',
      url: `/community/posts/${postId}/comments`,
    });
  }

  async createComment(postId: string, content: string, parentId?: string): Promise<ApiResponse<CommunityComment>> {
    return this.request({
      method: 'POST',
      url: `/community/posts/${postId}/comments`,
      data: { content, parentId },
    });
  }

  async likePost(postId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request({
      method: 'POST',
      url: `/community/posts/${postId}/like`,
    });
  }

  // 출석 관련 API
  async getAttendance(courseId: string): Promise<ApiResponse<Attendance[]>> {
    return this.request({
      method: 'GET',
      url: `/attendance/${courseId}`,
    });
  }

  async checkAttendance(courseId: string, status: 'present' | 'absent' | 'late'): Promise<ApiResponse<Attendance>> {
    return this.request({
      method: 'POST',
      url: '/attendance/check',
      data: { courseId, status },
    });
  }

  // 분석 데이터 API
  async getAnalytics(timeRange?: string): Promise<ApiResponse<AnalyticsData>> {
    const url = timeRange ? `/analytics/overview?timeRange=${timeRange}` : '/analytics/overview';
    return this.request({
      method: 'GET',
      url,
    });
  }

  // 결제 관련 API
  async preparePayment(paymentRequest: PaymentRequest): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/payments/prepare',
      data: paymentRequest,
    });
  }

  async confirmPayment(orderId: string, paymentKey: string, amount: number, provider: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/payments/confirm',
      data: { orderId, paymentKey, amount, provider },
    });
  }

  // 파일 업로드 API (Cloudinary 연동)
  async uploadFile(file: any, type: 'image' | 'document' | 'video' = 'document'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'vibe_academy'); // Cloudinary preset
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/vibecoding/raw/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: { url: response.data.secure_url },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '파일 업로드에 실패했습니다.',
      };
    }
  }

  // 네트워크 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 