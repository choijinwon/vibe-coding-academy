import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// 화면 컴포넌트 import
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import AssignmentsScreen from '../screens/AssignmentsScreen';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import AnnouncementDetailScreen from '../screens/AnnouncementDetailScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CommunityPostScreen from '../screens/CommunityPostScreen';
import CommunityWriteScreen from '../screens/CommunityWriteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import PaymentScreen from '../screens/PaymentScreen';
import LoadingScreen from '../screens/LoadingScreen';

import { RootStackParamList, TabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// 인증이 필요한 탭 네비게이터
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Courses':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Assignments':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Community':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: '대시보드' }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen} 
        options={{ title: '강의' }}
      />
      <Tab.Screen 
        name="Assignments" 
        component={AssignmentsScreen} 
        options={{ title: '과제' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen} 
        options={{ title: '커뮤니티' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '프로필' }}
      />
    </Tab.Navigator>
  );
}

// 인증이 필요없는 스택 네비게이터
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: '로그인',
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          title: '회원가입',
          headerBackTitleVisible: false 
        }}
      />
    </Stack.Navigator>
  );
}

// 메인 앱 네비게이터
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CourseDetail" 
            component={CourseDetailScreen} 
            options={{ 
              title: '강의 상세',
              headerBackTitleVisible: false 
            }}
          />
          <Stack.Screen 
            name="AssignmentDetail" 
            component={AssignmentDetailScreen} 
            options={{ 
              title: '과제 상세',
              headerBackTitleVisible: false 
            }}
          />
          <Stack.Screen 
            name="AnnouncementDetail" 
            component={AnnouncementDetailScreen} 
            options={{ 
              title: '공지사항',
              headerBackTitleVisible: false 
            }}
          />
          <Stack.Screen 
            name="CommunityPost" 
            component={CommunityPostScreen} 
            options={{ 
              title: '게시글',
              headerBackTitleVisible: false 
            }}
          />
          <Stack.Screen 
            name="CommunityWrite" 
            component={CommunityWriteScreen} 
            options={{ 
              title: '글쓰기',
              headerBackTitleVisible: false 
            }}
          />
          <Stack.Screen 
            name="VideoPlayer" 
            component={VideoPlayerScreen} 
            options={{ 
              title: '동영상',
              headerBackTitleVisible: false,
              orientation: 'landscape' // 동영상은 가로모드
            }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen} 
            options={{ 
              title: '결제',
              headerBackTitleVisible: false 
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
} 