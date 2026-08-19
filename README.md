# 골드럭와인 (goldluckwine-home)

독일 와인 수입사 **골드럭와인**의 공식 홈페이지 + B2B 발주 시스템.
React 18 · TypeScript · Vite · vite-react-ssg · Supabase · Vercel.

## 문서

> **작업을 시작하기 전에 [docs/README.md](docs/README.md) 를 먼저 읽으세요.**

| 문서 | 내용 |
| --- | --- |
| [docs/01-overview.md](docs/01-overview.md) | 스택·라우팅·빌드·환경변수 |
| [docs/02-b2b-order-spec.md](docs/02-b2b-order-spec.md) | B2B 발주 기획 확정본 |
| [docs/03-history.md](docs/03-history.md) | 개발 히스토리 |
| [docs/04-backlog.md](docs/04-backlog.md) | 남은 작업 |

폴더별 상세는 각 디렉터리의 `README.md` 에 있습니다 —
[`src/api`](src/api/README.md) · [`src/page`](src/page/README.md) ·
[`src/page/order`](src/page/order/README.md) · [`src/page/admin`](src/page/admin/README.md) ·
[`src/components`](src/components/README.md) · [`supabase`](supabase/README.md) ·
[`api`](api/README.md) · [`scripts`](scripts/README.md).

## 로컬 실행

```bash
yarn install
cp .env.example .env      # Supabase URL/anon key 채우기
yarn dev                  # http://localhost:4000
```

```bash
yarn build   # tsc → SSG 빌드 → sitemap 생성
yarn lint    # 경고 0 기준
```

## 영역

| 영역 | 경로 | 접근 |
| --- | --- | --- |
| 공개 사이트 | `/`, `/winelist`, `/wineries`, `/wines/:id`, `/contact` | 누구나 |
| 거래처 발주 | `/order/**` | 승인된 사업자 회원 |
| 관리자 | `/admin` | `admins` 테이블 등록자 |

## 운영 메모

- DB 마이그레이션은 **Supabase Dashboard → SQL Editor 에 사람이 직접 실행**합니다
  (CLI 연동 없음). 순서와 선행 조건은 [supabase/README.md](supabase/README.md) 참고.
- 와인 정보 변경을 공개 사이트에 반영하려면 **재배포**가 필요합니다
  (SSG). 관리자 화면의 "사이트 반영" 버튼이 Vercel Deploy Hook 을 호출합니다.
