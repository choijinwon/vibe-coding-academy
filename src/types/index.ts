// User types
export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description?: string;
  curriculum?: string;
  instructorId: string;
  instructor?: User;
  price: number;
  maxStudents: number;
  currentStudents: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment types
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Enrollment {
  id: string;
  studentId: string;
  student?: User;
  courseId: string;
  course?: Course;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
}

// Netlify Identity types
export interface NetlifyUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmation_sent_at: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: {
    provider: string;
    roles?: string[];
  };
  user_metadata: {
    full_name?: string;
    name?: string;
    role?: UserRole;
    phone?: string;
    avatar_url?: string;
  };
  identities: any[];
  created_at: string;
  updated_at: string;
  token?: {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    token_type: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 