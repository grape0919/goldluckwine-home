# scripts/ — 빌드 보조 스크립트

| 파일 | 언제 실행 | 역할 |
| --- | --- | --- |
| `gen-sitemap.mjs` | `yarn build` 마지막 단계 (자동) | `dist` 를 스캔해 `sitemap.xml` 생성. 프리렌더된 경로 = sitemap 이므로 실제 페이지와 항상 일치한다. `/order` 계열은 제외하고, `not-found` 결과물을 `dist/404.html` 로 복사해 진짜 404 응답에 쓰이게 한다 |
| `gen-seed.mjs` | 수동 (`node scripts/gen-seed.mjs`) | 초기 구축 때 쓰던 더미 데이터 → `supabase/seed.sql` 생성. 지금은 거의 쓰지 않는다 |
| `_seed-entry.ts` | — | `gen-seed.mjs` 가 esbuild 로 번들할 때 쓰는 엔트리 |

`gen-sitemap.mjs` 는 `dist` 가 있어야 동작합니다. 빌드 없이 단독 실행하면 빈 결과가 나옵니다.
