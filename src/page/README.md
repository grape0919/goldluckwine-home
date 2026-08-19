# src/page/ — 공개 사이트 페이지

`order/`, `admin/` 은 각 폴더의 README 를 보세요. 이 문서는 **누구나 볼 수 있는 페이지**를 다룹니다.

| 파일 | 경로 | 비고 |
| --- | --- | --- |
| `HomePage.tsx` | `/` | `homeLoader` 로 홈 콘텐츠·추천 와인 로드. 섹션은 `home/` 폴더 |
| `WineListPage.tsx` | `/winelist` | 통합 검색창 + 타입/도멘 필터. 카드에 `OrderQuickAdd` 노출(승인 거래처만) |
| `WineIntroPage.tsx` | `/wines/:wineId` | 상세. `getStaticPaths` 로 전 와인 프리렌더 |
| `WineriesPage.tsx` | `/wineries` | 도멘 목록 |
| `WIneryIntroPage.tsx` | `/wineries/:wineryId` | 도멘 상세 (파일명 오타는 기존 그대로 — import 경로가 이 이름) |
| `ContactFooter.tsx` | `/contact` | 문의 폼 |
| `NotFoundPage.tsx` | `/not-found`, `*` | 프리렌더 후 `dist/404.html` 로 복사돼 진짜 404 응답에 쓰임 |

`home/` 하위: `HeroSection`, `IntroSection`, `GermanySection`, `GallerySection`.
`GermanySection` 은 주력을 독일 와인(슈나이더)으로 전환하며 교체된 섹션입니다.

## SSG 규칙

- 모든 데이터는 **loader** 에서 가져옵니다(`homeLoader`, `wineListLoader`, `wineLoader` …).
  빌드 시점에 실행되어 정적 HTML 에 박히므로, loader 안에서 세션·브라우저 API 를 쓰면 안 됩니다.
- 동적 경로는 `getStaticPaths` 로 id 목록을 뽑습니다(`fetchWineIds`, `fetchWineryIds`).
  **와인을 추가하고 사이트에 반영하려면 재배포가 필요**하며, 이것이 관리자 "사이트 반영"
  버튼(Deploy Hook)의 존재 이유입니다.
- 세션에 따라 달라지는 UI(예: 공급가·담기 버튼)는 첫 렌더에서 그리지 말고, 로드 완료 후에만
  그립니다. `OrderQuickAdd` 가 승인 거래처가 아니면 `null` 을 반환하는 이유입니다.
- `sitemap.xml` 은 빌드 후 `scripts/gen-sitemap.mjs` 가 `dist` 를 스캔해 생성하므로
  프리렌더된 경로와 항상 일치합니다. `/order` 계열은 sitemap 에서 제외됩니다.

## SEO

`src/components/Seo.tsx` 로 타이틀·메타·JSON-LD 구조화 데이터를 넣습니다.
GA4 는 `src/lib/analytics.ts` (`initAnalytics`)에서 브라우저에서만 초기화합니다.
