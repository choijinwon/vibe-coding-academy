// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'student' | 'instructor' | 'admin';
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  instructorId: string;
  instructorName?: string;
  duration?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  maxStudents?: number;
  currentStudents?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  maxScore: number;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  fileUrl?: string;
  content?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  courseId?: string;
  courseName?: string;
  category?: string;
  priority: 'urgent' | 'important' | 'normal';
  isEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  readAt?: string;
}

// Community types
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  courseId?: string;
  courseName?: string;
  category: 'qna' | 'free' | 'notice';
  isAnswered: boolean;
  viewCount: number;
  likeCount: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  content: string;
  parentId?: string;
  isAnswer: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: CommunityComment[];
}

// Attendance types
export interface Attendance {
  id: string;
  userId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  createdAt: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Courses: undefined;
  CourseDetail: { courseId: string };
  Assignments: undefined;
  AssignmentDetail: { assignmentId: string };
  Announcements: undefined;
  AnnouncementDetail: { announcementId: string };
  Community: undefined;
  CommunityPost: { postId: string };
  CommunityWrite: undefined;
  Profile: undefined;
  VideoPlayer: { videoUrl: string; title?: string };
  Payment: { courseId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Courses: undefined;
  Assignments: undefined;
  Community: undefined;
  Profile: undefined;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Analytics types
export interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  averageAttendanceRate: number;
  assignmentCompletionRate: number;
  activeStudentsThisWeek: number;
  recentActivity: {
    date: string;
    students: number;
    submissions: number;
    attendance: number;
  }[];
}

// Payment types
export interface PaymentRequest {
  courseId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  provider: 'tosspayments' | 'iamport';
  method?: 'card' | 'bank' | 'kakaopay' | 'naverpay';
}

// Notification types
export interface NotificationData {
  title: string;
  body: string;
  data?: {
    type: 'announcement' | 'assignment' | 'community' | 'course';
    id: string;
  };
}

// App State types
export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  user: User | null;
  notifications: NotificationData[];
} 