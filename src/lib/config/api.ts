// 환경에 따른 API URL 설정
export const getApiUrl = () => {
  // Netlify 배포 환경 확인
  const isNetlify = typeof window !== 'undefined' 
    ? window.location.hostname.includes('.netlify.app') || window.location.hostname.includes('.netlify.com')
    : process.env.NETLIFY === 'true';

  // 로컬 개발 환경
  const isLocal = typeof window !== 'undefined'
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    : process.env.NODE_ENV === 'development';

  if (isNetlify) {
    // Netlify Functions 사용
    return '/.netlify/functions';
  } else if (isLocal) {
    // Next.js API Routes 사용
    return '/api';
  } else {
    // 기본값 (Next.js API Routes)
    return '/api';
  }
};

// API 엔드포인트들
export const API_ENDPOINTS = {
  signup: () => `${getApiUrl()}/auth${getApiUrl().includes('.netlify') ? '-signup' : '/signup'}`,
  login: () => `${getApiUrl()}/auth${getApiUrl().includes('.netlify') ? '-login' : '/login'}`,
  forgotPassword: () => `${getApiUrl()}/auth${getApiUrl().includes('.netlify') ? '-forgot-password' : '/forgot-password'}`,
};

// 디버깅용 정보
export const getApiConfig = () => {
  const apiUrl = getApiUrl();
  const isNetlify = apiUrl.includes('.netlify');
  
  return {
    apiUrl,
    isNetlify,
    endpoints: {
      signup: API_ENDPOINTS.signup(),
      login: API_ENDPOINTS.login(),
      forgotPassword: API_ENDPOINTS.forgotPassword(),
    }
  };
}; 