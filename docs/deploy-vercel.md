# Vercel 배포 가이드

## 1) GitHub 연결 배포 절차

1. Vercel 대시보드에서 `Add New Project`를 선택합니다.
2. 배포할 GitHub 저장소(별꿈다락 굿즈 스토어)를 연결합니다.
3. Framework Preset이 Next.js로 자동 인식되는지 확인합니다.
4. Build Command를 `npm run vercel-build`로 설정합니다.
5. Deploy를 실행합니다.
6. 이후 `main` 브랜치 Push 시 자동 배포가 동작합니다.

## 2) Build Command 설정 (중요)

Vercel Project Settings > Build & Development Settings에서 Build Command를 아래로 지정하세요.

```bash
npm run vercel-build
```

`vercel-build` 내용:

```bash
prisma generate && prisma migrate deploy && prisma db seed && next build
```

이 순서로 마이그레이션/시드가 먼저 적용되어, 빌드 프리렌더 단계에서 `prisma.product.findMany()`가 실행되더라도 테이블 미존재(P2021) 오류를 방지합니다.

## 3) 환경변수 설정 항목

Vercel 프로젝트 `Settings > Environment Variables`에 아래 값을 설정합니다.

- `DATABASE_URL`
- `ADMIN_PASSWORD`

권장:

- `DATABASE_URL`은 PostgreSQL 연결 문자열을 사용합니다. (Neon/Supabase/Vercel Postgres 등)
- `ADMIN_PASSWORD`는 충분히 긴 랜덤 문자열을 사용합니다.

## 4) SQLite 사용 시 주의점 (개발용)

- SQLite(`file:./dev.db`)는 로컬 개발/실험에는 편하지만, Vercel 같은 서버리스 운영에는 부적합합니다.
- 프로덕션에서는 PostgreSQL 같은 관리형 DB를 사용하세요.

## 5) 프로덕션 DB 전환 체크

1. 관리형 PostgreSQL 인스턴스 생성
2. `DATABASE_URL` 설정
3. 첫 배포에서 `npm run vercel-build` 실행 확인
4. `/products`, `/admin/orders` 등 DB 의존 라우트 정상 응답 확인
