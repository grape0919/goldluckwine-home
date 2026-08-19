# 골드럭와인 문서 — 시작점

다음 세션에서 이 저장소를 다시 다룰 때 **여기부터** 읽으면 됩니다.
문서는 "전체 문서(docs/)"와 "폴더별 문서(각 디렉터리의 README.md)" 두 층으로 나뉩니다.

## 전체 문서

| 문서 | 내용 |
| --- | --- |
| [01-overview.md](01-overview.md) | 프로젝트 개요, 기술 스택, 라우팅, 빌드·배포, 환경변수 |
| [02-b2b-order-spec.md](02-b2b-order-spec.md) | **B2B 발주 시스템 기획 확정본** — 정책·상태 흐름·가격 규칙·화면 |
| [03-history.md](03-history.md) | 개발 히스토리 (PR 타임라인과 각 단계의 결정 이유) |
| [04-backlog.md](04-backlog.md) | 남은 작업, 보류/불필요로 결정된 항목, 운영자 미완 설정 |

## 폴더별 문서

| 위치 | 내용 |
| --- | --- |
| [../src/api/README.md](../src/api/README.md) | Supabase 접근 계층 — 파일별 책임과 주요 함수 |
| [../src/page/README.md](../src/page/README.md) | 공개 사이트 페이지(홈·와인·도멘·문의) |
| [../src/page/order/README.md](../src/page/order/README.md) | 거래처 발주 영역 `/order` |
| [../src/page/admin/README.md](../src/page/admin/README.md) | 관리자 `/admin` (antd) |
| [../src/components/README.md](../src/components/README.md) | 공용 컴포넌트·레이아웃·유틸 |
| [../supabase/README.md](../supabase/README.md) | 스키마·마이그레이션·RLS·RPC 전체 지도 |
| [../api/README.md](../api/README.md) | Vercel Functions (국세청 검증, 이메일 알림) |

## 30초 요약

독일 와인(슈나이더) 수입사 **골드럭와인**의 홈페이지 + B2B 발주 시스템입니다.

- 공개 사이트는 **SSG(vite-react-ssg)** 로 프리렌더 — 홈, 와인 리스트/상세, 도멘.
- `/order` 는 **사업자 회원 전용 발주** — 가입(국세청 검증) → 관리자 승인 → 발주 → 배송 → 입금.
- `/admin` 은 **관리자 전용**(antd, lazy 로드) — 대시보드·와인·도멘·홈 콘텐츠·발주·거래처·문의·설정·백라벨.
- 백엔드는 **Supabase**(Auth/Postgres RLS/Storage/Webhook) + **Vercel Functions** 2개.
- 결제 없음. 세금계산서는 홈택스 반자동(대장 CSV).
