// 데이터베이스 연결 테스트 스크립트
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function testDatabase() {
  console.log('🗄️ 데이터베이스 연결 테스트 시작...\n');
  
  try {
    // 1. 기본 연결 테스트
    console.log('1️⃣ 기본 연결 테스트...');
    const healthCheck = await sql`SELECT 1 as health, NOW() as current_time`;
    console.log('   ✅ 연결 성공!', healthCheck[0]);
    
    // 2. 테이블 존재 확인
    console.log('\n2️⃣ 테이블 존재 확인...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('   📋 생성된 테이블들:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // 3. 사용자 테이블 구조 확인
    console.log('\n3️⃣ Users 테이블 구조 확인...');
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('   👤 Users 테이블 컬럼들:');
    userColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 4. 테스트 데이터 삽입 (선택사항)
    console.log('\n4️⃣ 테스트 데이터 확인...');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   📊 현재 사용자 수: ${userCount[0].count}명`);
    
    console.log('\n🎉 모든 테스트 통과! 데이터베이스가 정상적으로 작동합니다.');
    
  } catch (error) {
    console.error('❌ 데이터베이스 테스트 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
testDatabase(); 