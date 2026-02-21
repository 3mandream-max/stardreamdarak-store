# 별꿈다락 굿즈 스토어

별꿈다락 굿즈 스토어는 MVP 빠른 런칭을 목표로 한 Next.js + Prisma 기반 이커머스 웹앱입니다.  
모바일 우선 UI, 기본 접근성, 관리자 주문 확인 흐름까지 포함합니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- Prisma
- SQLite (개발 기본값)
- Tailwind CSS

## 로컬 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 환경변수 설정

`.env.example`을 참고해 `.env`를 생성합니다.

```bash
cp .env.example .env
```

3. DB 마이그레이션

```bash
npm run db:migrate
```

4. 시드 데이터 입력

```bash
npm run db:seed
```

5. 개발 서버 실행

```bash
npm run dev
```

## 환경변수 안내

`.env.example` 기준 필수 항목:

- `DATABASE_URL`: Prisma 데이터베이스 연결 문자열 (개발 기본값: `file:./dev.db`)
- `ADMIN_PASSWORD`: `/admin` 로그인 비밀번호

## 주요 라우트

- `/`: 홈
- `/products`: 상품 목록
- `/cart`: 장바구니
- `/checkout`: 주문/결제 정보 입력
- `/admin`: 관리자 로그인 및 상품 확인
- `/admin/orders`: 관리자 주문 목록

## 관리자 로그인 방식 주의사항

- 현재 관리자 인증은 `ADMIN_PASSWORD` 대조 후 `httpOnly` 쿠키(`admin_auth`)를 발급하는 MVP 방식입니다.
- 세션/권한 체계가 단순하므로, 운영 환경에서는 정식 인증 시스템(예: OAuth, RBAC, 세션 스토어)으로 대체를 권장합니다.
- `ADMIN_PASSWORD`는 절대 코드에 하드코딩하지 말고 배포 환경변수로만 주입하세요.

