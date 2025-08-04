// 실제 데이터베이스 사용자 조회 스크립트
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  console.log('👥 데이터베이스 사용자 조회...\n');
  
  try {
    // 모든 사용자 조회
    const users = await sql`
      SELECT id, email, name, role, email_verified, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 총 사용자 수: ${users.length}명\n`);
    
    if (users.length > 0) {
      console.log('📋 등록된 사용자 목록:');
      console.log('─'.repeat(80));
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. 이메일: ${user.email}`);
        console.log(`   이름: ${user.name}`);
        console.log(`   역할: ${user.role}`);
        console.log(`   이메일 인증: ${user.email_verified ? '✅' : '❌'}`);
        console.log(`   가입일: ${new Date(user.created_at).toLocaleString('ko-KR')}`);
        console.log('─'.repeat(40));
      });
      
      console.log('\n💡 로그인 테스트용 계정들:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. 이메일: ${user.email} (비밀번호: Password123!)`);
      });
    } else {
      console.log('❌ 등록된 사용자가 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 사용자 조회 실패:', error);
  }
}

// 스크립트 실행
checkUsers(); 