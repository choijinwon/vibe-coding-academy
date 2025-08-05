import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Neon 데이터베이스 연결
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// 스키마 테이블들을 개별적으로 export
export const {
  users,
  courses,
  courseRegistrations,
  attendance,
  assignments,
  assignmentSubmissions,
  announcements,
  announcementReads,
  communityPosts,
  communityComments,
  payments
} = schema;

// 유틸리티 함수들
export const getDb = () => db;

// 데이터베이스 헬스 체크
export async function healthCheck() {
  try {
    const result = await sql`SELECT 1 as health`;
    return { healthy: true, result };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error };
  }
} 