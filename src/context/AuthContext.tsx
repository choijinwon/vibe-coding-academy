import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // API 서비스에 토큰 설정
        apiService.setAuthToken(token);
        
        // 토큰 유효성 확인
        try {
          await apiService.getCurrentUser();
        } catch (error) {
          // 토큰이 만료되었거나 유효하지 않음
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { user: userData, access_token } = response.data;
        
        // 로컬 스토리지에 저장
        await AsyncStorage.setItem('auth_token', access_token);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        // API 서비스에 토큰 설정
        apiService.setAuthToken(access_token);
        
        setUser(userData);
      } else {
        throw new Error(response.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await apiService.register(email, password, name);
      
      if (response.success && response.data) {
        const { user: userData, access_token } = response.data;
        
        // 로컬 스토리지에 저장
        await AsyncStorage.setItem('auth_token', access_token);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        // API 서비스에 토큰 설정
        apiService.setAuthToken(access_token);
        
        setUser(userData);
      } else {
        throw new Error(response.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await apiService.refreshToken(refreshToken);
      
      if (response.success && response.data) {
        const { access_token, refresh_token, user: userData } = response.data;
        
        // 새 토큰 저장
        await AsyncStorage.setItem('auth_token', access_token);
        if (refresh_token) {
          await AsyncStorage.setItem('refresh_token', refresh_token);
        }
        if (userData) {
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          setUser(userData);
        }
        
        // API 서비스에 새 토큰 설정
        apiService.setAuthToken(access_token);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await clearAuth();
      throw error;
    }
  };

  const clearAuth = async () => {
    try {
      // 로컬 스토리지 클리어
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      
      // API 서비스 토큰 제거
      apiService.clearAuthToken();
      
      setUser(null);
    } catch (error) {
      console.error('Clear auth error:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 