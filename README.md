# 별꿈다락 굿즈 스토어

별꿈다락 굿즈 스토어는 MVP 빠른 런칭을 목표로 한 Next.js + Prisma 기반 이커머스 웹앱입니다.
운영 배포는 PostgreSQL(Neon/Supabase/Vercel Postgres 등) 기준입니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS

## 로컬 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 환경변수 설정

```bash
cp .env.example .env
```

3. `.env`의 `DATABASE_URL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN` 설정

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
ADMIN_PASSWORD="change-this-to-a-strong-password"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token"
```

4. 마이그레이션/시드 적용

```bash
npm run db:migrate
npm run db:seed
```

5. 개발 서버 실행

```bash
npm run dev
```

## 로컬 이미지 업로드 활성화

1. Vercel에서 Blob 토큰 확인
- 경로: `Project(stardreamdarak-store) -> Settings -> Environment Variables -> BLOB_READ_WRITE_TOKEN`

2. 로컬 환경변수 파일 생성

```bash
cp .env.local.example .env.local
```

`.env.local`에 `BLOB_READ_WRITE_TOKEN` 값을 붙여넣습니다.

3. 개발 서버 재시작
- 환경변수 변경 후에는 서버를 반드시 다시 시작해야 합니다.

```bash
npm run dev
```

4. 업로드 테스트
- `/admin` 로그인
- 상품 카드에서 파일 선택 후 `이미지 업로드` 클릭
- 업로드 성공 후 목록/상세 페이지에 이미지가 반영되는지 확인

## 환경변수 안내

필수:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `ADMIN_PASSWORD`: `/admin` 로그인 비밀번호
- `BLOB_READ_WRITE_TOKEN`: 관리자 이미지 업로드용 Vercel Blob 토큰

선택(런타임 DB 초기화):

- `RUNTIME_DB_INIT_ENABLED`: `true`일 때 런타임 초기화 기능 활성화
- `RUNTIME_DB_INIT_ON_FIRST_REQUEST`: `true`일 때 첫 DB 요청 시 `prisma migrate deploy` 1회 시도
- `RUNTIME_DB_INIT_ALLOW_SEED`: `true`일 때 초기화 엔드포인트에서 `seed` 허용
- `INIT_DB_TOKEN`: `/api/admin/init` 호출 인증 토큰

## 주요 라우트

- `/`: 홈
- `/products`: 상품 목록
- `/cart`: 장바구니
- `/checkout`: 주문/결제 정보 입력
- `/admin`: 관리자 로그인 및 상품 확인
- `/admin/products/new`: 관리자 상품 등록
- `/admin/products/[id]/edit`: 관리자 상품 수정
- `/admin/orders`: 관리자 주문 목록
- `/api/admin/init`: 보호된 런타임 DB 초기화 엔드포인트
- `/api/upload`: 관리자 이미지 업로드 엔드포인트

## 관리자 로그인 방식 주의사항

- 현재 관리자 인증은 `ADMIN_PASSWORD` 대조 후 `httpOnly` 쿠키(`admin_auth`)를 발급하는 MVP 방식입니다.
- 운영 환경에서는 정식 인증 시스템(OAuth, RBAC, 세션 스토어 등)으로 대체를 권장합니다.
- `ADMIN_PASSWORD`는 절대 코드에 하드코딩하지 말고 배포 환경변수로만 주입하세요.

## Vercel 배포 설정

- Build Command:

```bash
npm run vercel-build
```

- 현재 `vercel-build`는 DB 접속을 강제하지 않도록 `next build`만 수행합니다.

## 초기 DB 세팅 방법 (프로덕션)

옵션 A. 배포 외부에서 직접 실행 (권장)

```bash
DATABASE_URL="..." npx prisma migrate deploy
DATABASE_URL="..." npx prisma db seed
```

옵션 B. 런타임 초기화 엔드포인트 사용

1. Vercel 환경변수 설정
   - `RUNTIME_DB_INIT_ENABLED=true`
   - `INIT_DB_TOKEN=<긴 랜덤 토큰>`
   - (선택) `RUNTIME_DB_INIT_ALLOW_SEED=true`
2. 배포 후 보호된 엔드포인트 호출

```bash
curl -X POST https://<your-domain>/api/admin/init \
  -H "Authorization: Bearer <INIT_DB_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"seed":false}'
```

3. 시드가 필요하면 `{"seed":true}`로 1회 실행
