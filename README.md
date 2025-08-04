# 바이브코딩 아카데미 - 종합 학습 플랫폼

더 나은 교육을 위한 종합 학습 플랫폼입니다.

## 🚀 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### Backend & Database
- **Netlify Functions** - 서버리스 API
- **Netlify Identity** - 사용자 인증
- **Neon PostgreSQL** - 서버리스 데이터베이스
- **Drizzle ORM** - 타입세이프 ORM

### Infrastructure
- **Netlify** - 호스팅 및 배포
- **Cloudinary** - 미디어 관리

## 🛠️ 개발 환경 설정

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DATABASE_URL="your-neon-database-url"

# Netlify
NEXT_PUBLIC_NETLIFY_SITE_URL="your-netlify-site-url"

# Upload
UPLOAD_DIR="./uploads"
```

### 3. 로컬 개발 서버 실행
```bash
# Next.js 개발 서버
pnpm dev

# 또는 Netlify Dev (Functions 포함)
pnpm netlify:dev
```

## 🚀 Netlify 배포

### 1. Netlify CLI 설치 및 로그인
```bash
npm install -g netlify-cli
netlify login
```

### 2. 사이트 초기화
```bash
netlify init
```

### 3. 환경 변수 설정
Netlify 대시보드에서 다음 환경 변수들을 설정하세요:

- `DATABASE_URL`: Neon PostgreSQL 연결 문자열
- `NEXT_PUBLIC_NETLIFY_SITE_URL`: 배포된 사이트 URL

### 4. Identity 서비스 활성화
1. Netlify 대시보드 → Site settings → Identity
2. "Enable Identity" 클릭
3. Registration preferences: "Open" 또는 "Invite only"
4. External providers 설정 (선택사항)

### 5. 배포
```bash
# 테스트 배포
pnpm netlify:deploy

# 프로덕션 배포
pnpm netlify:deploy:prod
```

## 🔐 인증 시스템

### 테스트 계정
로컬 개발 및 Netlify Functions에서 사용할 수 있는 테스트 계정:

- **학생 계정**
  - 이메일: `test@example.com`
  - 비밀번호: `password123`

- **강사 계정**
  - 이메일: `teacher@example.com`
  - 비밀번호: `password123`

### API 엔드포인트
시스템은 환경에 따라 자동으로 적절한 API를 사용합니다:

- **로컬 개발**: Next.js API Routes (`/api/auth/*`)
- **Netlify 배포**: Netlify Functions (`/.netlify/functions/auth-*`)

## 📁 프로젝트 구조

```
src/
├── app/                    # App Router 페이지
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   └── api/               # Next.js API Routes
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── forms/            # 폼 컴포넌트
├── lib/                  # 라이브러리 및 유틸리티
│   ├── auth/             # 인증 관련
│   ├── config/           # 설정
│   ├── db/               # 데이터베이스
│   ├── utils/            # 유틸리티
│   └── validators/       # 스키마 검증
├── types/                # TypeScript 타입 정의
└── constants/            # 상수

netlify/
└── functions/            # Netlify Functions
```

## 🎯 주요 기능

- ✅ **사용자 인증** - 회원가입, 로그인, 비밀번호 재설정
- 🏗️ **강의 관리** - 개발 예정
- 🏗️ **과제 시스템** - 개발 예정
- 🏗️ **출석 관리** - 개발 예정
- 🏗️ **커뮤니티** - 개발 예정

## 🔧 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint

# Netlify 로컬 개발
pnpm netlify:dev

# Netlify 배포
pnpm netlify:deploy
pnpm netlify:deploy:prod
```

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Made with ❤️ by 바이브코딩 아카데미 Team
