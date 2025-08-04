'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initNetlifyIdentity,
  getCurrentUser,
  onAuthStateChange,
  offAuthStateChange,
  getUserRole
} from './netlify-identity';
import { getCurrentUserFromGoTrue, signOut } from './gotrue-client';
import type { NetlifyUser, UserRole } from '@/types';

interface AuthContextType {
  user: NetlifyUser | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  signup: () => void;
  logout: () => Promise<void>;
  setUser: (user: NetlifyUser | null) => void; // 새로 추가
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<NetlifyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬 스토리지에서 사용자 정보 로드
  const loadUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('vibecoding_user');
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        return null;
      }
    }
    return null;
  };

  // 로컬 스토리지에 사용자 정보 저장
  const saveUserToStorage = (userData: NetlifyUser | null) => {
    if (typeof window !== 'undefined') {
      try {
        if (userData) {
          localStorage.setItem('vibecoding_user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('vibecoding_user');
        }
      } catch (error) {
        console.error('사용자 정보 저장 실패:', error);
      }
    }
  };

  // 사용자 상태 업데이트 함수 (외부에서 호출 가능)
  const setUser = (userData: NetlifyUser | null) => {
    setUserState(userData);
    saveUserToStorage(userData);
  };

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 먼저 로드
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      setUserState(storedUser);
    }

    // Netlify Identity 초기화
    try {
      initNetlifyIdentity();

      // 초기 사용자 상태 확인 (기존 방식과 새 방식 모두 시도)
      const currentUser = getCurrentUser() || getCurrentUserFromGoTrue();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Netlify Identity 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }

    // 인증 상태 변경 리스너
    const handleLogin = (user?: NetlifyUser) => {
      if (user) {
        setUser(user);
        console.log('로그인 성공:', user);
      }
    };

    const handleLogout = () => {
      setUser(null);
      console.log('로그아웃 완료');
    };

    const handleSignup = (user?: NetlifyUser) => {
      if (user) {
        setUser(user);
        console.log('회원가입 성공:', user);
      }
    };

    const handleInit = (user?: NetlifyUser) => {
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    };

    const handleError = (error: any) => {
      console.error('Netlify Identity 오류:', error);
      setIsLoading(false);
    };

    // 이벤트 리스너 등록
    onAuthStateChange('init', handleInit);
    onAuthStateChange('login', handleLogin);
    onAuthStateChange('logout', handleLogout);
    onAuthStateChange('signup', handleSignup);
    onAuthStateChange('error', handleError);

    // 클린업
    return () => {
      offAuthStateChange('init', handleInit);
      offAuthStateChange('login', handleLogin);
      offAuthStateChange('logout', handleLogout);
      offAuthStateChange('signup', handleSignup);
      offAuthStateChange('error', handleError);
    };
  }, []);

  const role = getUserRole(user);
  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    role,
    isLoading,
    isAuthenticated,
    setUser, // 외부에서 사용할 수 있도록 추가
    login: () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window.netlifyIdentity.open('login');
      }
    },
    signup: () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window.netlifyIdentity.open('signup');
      }
    },
    logout: async () => {
      try {
        await signOut();
        setUser(null);
      } catch (error) {
        console.error('로그아웃 오류:', error);
        // 실패해도 로컬 상태는 초기화
        setUser(null);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
} 