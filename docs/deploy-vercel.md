# Vercel 배포 가이드

## 1) GitHub 연결 배포 절차

1. Vercel 대시보드에서 `Add New Project`를 선택합니다.
2. 배포할 GitHub 저장소(별꿈다락 굿즈 스토어)를 연결합니다.
3. Framework Preset이 Next.js로 자동 인식되는지 확인합니다.
4. Build/Install 명령은 기본값을 사용하거나 아래처럼 지정합니다.
   - Install Command: `npm install`
   - Build Command: `npm run build`
5. `Deploy`를 눌러 첫 배포를 진행합니다.
6. 이후 `main` 브랜치 Push 시 자동 배포가 동작합니다.

## 2) 환경변수 설정 항목

Vercel 프로젝트 `Settings > Environment Variables`에 아래 값을 설정합니다.

- `DATABASE_URL`
- `ADMIN_PASSWORD`

권장:

- `DATABASE_URL`은 운영용 관리형 DB(PostgreSQL 등) 연결 문자열을 사용합니다.
- `ADMIN_PASSWORD`는 충분히 긴 랜덤 문자열을 사용합니다.

## 3) SQLite 사용 시 주의점 (개발용)

- SQLite(`file:./dev.db`)는 로컬 개발/테스트에 적합합니다.
- 서버리스/다중 인스턴스 운영 환경에서는 파일 기반 SQLite가 지속성/동시성 측면에서 불리합니다.
- Vercel 프로덕션에서는 PostgreSQL, MySQL, PlanetScale, Neon, Supabase 같은 관리형 DB로 전환을 권장합니다.

## 4) 프로덕션 DB 전환 제안

1. 관리형 DB를 생성하고 연결 문자열을 확보합니다.
2. `DATABASE_URL`을 운영 DB 연결 문자열로 교체합니다.
3. 프로덕션 마이그레이션 전략을 수립합니다.
   - 배포 파이프라인에서 `prisma migrate deploy` 사용 권장
4. 시드 데이터가 필요하면 운영용 시드 정책(최소 데이터/관리자 초기 데이터)을 분리합니다.

