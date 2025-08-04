// App Configuration
export const APP_CONFIG = {
  NAME: '바이브코딩 아카데미',
  DESCRIPTION: '더 나은 교육을 위한 종합 학습 플랫폼',
  VERSION: '1.0.0',
  AUTHOR: '바이브코딩 아카데미 Team',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 10000,
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COURSES: '/courses',
  ASSIGNMENTS: '/assignments',
  ATTENDANCE: '/attendance',
  COMMUNITY: '/community',
  DASHBOARD: {
    STUDENT: '/dashboard/student',
    INSTRUCTOR: '/dashboard/instructor',
    ADMIN: '/dashboard/admin',
  },
  API: {
    AUTH: '/api/auth',
    COURSES: '/api/courses',
    USERS: '/api/users',
  },
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\-\+\(\)\s]+$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: '로그인되었습니다.',
  LOGOUT: '로그아웃되었습니다.',
  REGISTER: '회원가입이 완료되었습니다.',
  UPDATE: '정보가 업데이트되었습니다.',
} as const; 