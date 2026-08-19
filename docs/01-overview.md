# 01. 프로젝트 개요

## 무엇인가

독일 와인 수입사 **골드럭와인**의 공식 홈페이지이자, 거래처(사업자)가 온라인으로
발주하는 B2B 시스템입니다. 하나의 Vite 앱 안에 세 영역이 공존합니다.

| 영역 | 경로 | 접근 | 렌더링 |
| --- | --- | --- | --- |
| 공개 사이트 | `/`, `/winelist`, `/wineries`, `/wines/:id`, `/contact` | 누구나 | SSG 프리렌더 |
| 거래처 발주 | `/order/**` | 승인된 사업자 회원 | SSG 프리렌더(셸) + CSR |
| 관리자 | `/admin` | `admins` 테이블 등록자 | CSR 전용(프리렌더 제외) |

## 기술 스택

- **React 18 + TypeScript + Vite 5**
- **vite-react-ssg 0.8.9** — 빌드 시 각 라우트를 정적 HTML 로 프리렌더. 라우트는
  `src/App.tsx` 의 `routes` 배열 하나로 정의하고, 동적 경로는 `getStaticPaths` 로 확장.
- **styled-components v6** — 공개 사이트·발주 영역의 유일한 스타일 수단.
  SSR 번들에 포함해야 하므로 `vite.config.ts` 의 `ssr.noExternal` 에 등록되어 있음.
- **antd 5** — **관리자 전용**. `AdminRoot` 에서 `lazy()` 로 불러 `/admin` 서브트리에만
  적용되므로 공개 사이트 번들에 antd 가 들어가지 않는다.
- **@dnd-kit** — 관리자 표 행 드래그 정렬(antd Table `components` API 에 결합).
- **motion** — 홈·리스트의 스크롤 리빌. SSG 안전 패턴(`src/components/motion/reveal.tsx`).
- **Supabase** — Auth, Postgres(+RLS), Storage, Database Webhooks, RPC.
- **Vercel** — 정적 호스팅 + `api/` 서버리스 함수 + Deploy Hook.

## 라우팅과 렌더링 규칙

`src/App.tsx` 가 전체 라우트, `src/main.tsx` 가 SSG 엔트리(+ GA4 초기화)입니다.

`vite.config.ts` 의 `ssgOptions.includedRoutes` 가 **`/admin` 만 프리렌더에서 제외**합니다.

- `/admin` 제외 이유: antd 가 CJS 라 SSR 시 문제가 나서 CSR + `vercel.json` rewrite 로 서빙.
- `/order` 는 **프리렌더 포함**. 과거 rewrite 로 홈 HTML 을 서빙했더니 hydration 불일치
  (React #418/#423)가 발생 → 초기 렌더가 세션과 무관한 로딩 셸이므로 프리렌더가 안전하다.
  (이 결정을 되돌리지 말 것 — 회귀하면 콘솔 에러 + manifest 404 가 재발한다.)
- `dirStyle: 'nested'` — `/wines/1` → `dist/wines/1/index.html`.
- `/not-found` 는 명시 라우트라 프리렌더되고, 빌드 후 `dist/404.html` 로 복사돼
  Vercel 이 진짜 404 응답에 사용한다(소프트 404 방지).

## 명령어

```bash
yarn dev        # vite-react-ssg dev (포트 4000)
yarn build      # tsc → vite-react-ssg build → scripts/gen-sitemap.mjs
yarn lint       # eslint, --max-warnings 0
yarn preview
```

> 의존성 설치가 느릴 때 `npx tsc` 를 바로 부르면 엉뚱한 `tsc@2.x` 를 설치한다.
> `node_modules/.bin/tsc` 가 생길 때까지 기다린 뒤 실행할 것.

## 환경변수

### 클라이언트 (`.env` / Vercel Environment Variables, `VITE_` 접두사)

| 이름 | 용도 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | anon 공개 키 |
| `VITE_GA4_ID` | GA4 측정 ID (`G-CZSW1LBB9X`) |
| `VITE_DEPLOY_HOOK_URL` | 관리자 "사이트 반영" 버튼용 Vercel Deploy Hook |

### 서버 (Vercel Functions 전용 — `VITE_` 없음)

| 이름 | 용도 |
| --- | --- |
| `NTS_API_KEY` | 국세청 사업자 상태조회 인증키(디코딩본). 없으면 `available:false` 로 우회 |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | 알림 메일 기본 발송 경로(Gmail SMTP) |
| `RESEND_API_KEY` / `RESEND_FROM` | 대안 경로. Gmail 미설정 시에만 사용 |
| `NOTIFY_WEBHOOK_SECRET` | Supabase Webhook → `/api/notify` 요청 검증 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버에서 설정·품목 조회 (절대 클라이언트 노출 금지) |

## 디렉터리 지도

```
api/                  Vercel Functions (notify, verify-business)
docs/                 이 문서들
public/               robots.txt, sitemap.xml(빌드 시 갱신)
scripts/              gen-sitemap.mjs, gen-seed.mjs
src/
  api/                Supabase 접근 계층 (도메인별 파일)
  components/         공용 컴포넌트 + layout/ motion/
  lib/                supabase 클라이언트, analytics
  page/               공개 페이지 + home/ order/ admin/
  styles/theme.ts     색·폰트 토큰 (공개·관리자 공용)
  types/ enum/ utils/ 도메인 타입·상수·유틸
supabase/
  migrations/         날짜순 SQL — Dashboard SQL Editor 에 수동 실행
  schema.sql seed.sql 초기 스키마·시드
```
