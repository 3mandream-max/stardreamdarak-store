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
next build
```

빌드 단계에서 DB 접속을 강제하지 않으므로, Neon 연결 불안정(P1001)로 빌드가 실패하는 문제를 줄일 수 있습니다.

## 3) 런타임 DB 초기화 옵션

보호된 엔드포인트 `/api/admin/init`를 통해 런타임에 마이그레이션을 1회 시도할 수 있습니다.

동작 조건:

- `RUNTIME_DB_INIT_ENABLED=true`
- `INIT_DB_TOKEN` 설정
- 요청 헤더 `Authorization: Bearer <INIT_DB_TOKEN>` 또는 `x-init-token`

호출 예시:

```bash
curl -X POST https://<your-domain>/api/admin/init \
  -H "Authorization: Bearer <INIT_DB_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"seed":false}'
```

시드까지 허용하려면:

- `RUNTIME_DB_INIT_ALLOW_SEED=true`
- body를 `{"seed":true}`로 호출

## 4) 첫 요청 시 자동 초기화(옵션)

- `RUNTIME_DB_INIT_ON_FIRST_REQUEST=true`를 설정하면 첫 DB 요청 시 `prisma migrate deploy`를 1회 시도합니다.
- 실패 시 페이지는 fallback 처리되며, 필요한 경우 `/api/admin/init`로 수동 초기화를 수행하세요.

## 5) 환경변수 설정 항목

필수:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `BLOB_READ_WRITE_TOKEN`

선택(런타임 초기화):

- `RUNTIME_DB_INIT_ENABLED`
- `RUNTIME_DB_INIT_ON_FIRST_REQUEST`
- `RUNTIME_DB_INIT_ALLOW_SEED`
- `INIT_DB_TOKEN`

## 6) 프로덕션 권장 절차

가장 안전한 방식은 배포 외부(CI/CD 또는 운영 콘솔)에서 DB 마이그레이션/시드를 먼저 완료한 뒤 앱을 배포하는 방식입니다.

## 7) 관리자 이미지 업로드

- 업로드 API: `POST /api/upload`
- 관리자 인증 쿠키가 있는 요청만 허용됩니다.
- `BLOB_READ_WRITE_TOKEN`은 서버에서만 사용되며 클라이언트에 노출되지 않습니다.
- Vercel Dashboard에서 Storage > Blob를 연결하면 `BLOB_READ_WRITE_TOKEN`이 프로젝트 Environment Variables에 자동 추가됩니다.
