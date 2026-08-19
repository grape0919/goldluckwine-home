# src/components/ — 공용 컴포넌트

관리자 전용 컴포넌트는 여기 두지 않습니다(antd 가 공개 번들로 새어 나감).
관리자용은 `src/page/admin/` 안에 둡니다.

| 파일 | 역할 |
| --- | --- |
| `layout/PageLayout.tsx` | 공개 사이트 공통 레이아웃 — GNB(ORDER 배지 포함), 아웃렛, 스크롤 복원 |
| `layout/SiteFooter.tsx` | 푸터 |
| `Seo.tsx` | 타이틀·메타·OG·JSON-LD |
| `WineCard.tsx` | 와인 카드 |
| `OrderQuickAdd.tsx` | **카탈로그용 담기 컨트롤** (아래 상세) |
| `ContactForm.tsx` | 문의 폼 (밑줄 입력 스타일의 원본) |
| `ErrorBoundary.tsx` | 렌더 오류 격리 |
| `CloverIcon.tsx` | 로고 아이콘 |
| `motion/reveal.tsx` | SSG 안전한 스크롤 리빌 래퍼 |

관련 유틸: `src/utils/image.ts`(이미지 URL·최적화), `src/utils/variety.ts`(품종 표기),
`src/utils/lines.tsx`(줄바꿈 렌더), `src/utils/statement.ts`(거래명세표 인쇄 — 발주 영역 전용).

## OrderQuickAdd.tsx

와인 리스트/상세에서 **승인 거래처에게만** 공급가와 담기 버튼을 보여줍니다.

```ts
// 승인 거래처가 아니거나 가격이 없으면 아무것도 그리지 않는다 → 공개 화면 그대로
if (!ready || !partner || !price) return null;
```

카드가 여러 개 렌더되므로 세션·가격·장바구니를 **모듈 수준 캐시**로 공유합니다.
카드마다 요청을 보내지 않도록 `inflight` 프라미스를 재사용합니다.

```ts
interface QuickAddContext { partner: PartnerRow | null;
                            prices: Record<number, WinePriceRow>;
                            cart: Record<number, number>; }
let cache: QuickAddContext | null = null;
let inflight: Promise<QuickAddContext> | null = null;
```

> 익명 객체 타입 + `typeof cache` 조합은 TS2322 를 내므로 named interface 를 씁니다.

## WineCard 의 중첩 주의

카드 전체가 `<a>` 인데 그 안에 버튼을 넣으면 링크 안의 버튼이 됩니다.
그래서 `CardWrap` div 로 감싸고 `OrderQuickAdd` 를 **링크의 형제**로 배치하며,
그리드의 flex 를 승계하도록 `> a { flex: 1 }` 을 둡니다. 이 구조를 되돌리지 마세요.

## 스타일 토큰

색·폰트는 `src/styles/theme.ts` (`customedTheme`)에서 가져옵니다.
폰트 토큰은 세 갈래입니다 — `display`: Marcellus/Lora(대형 영문 헤딩),
`en`: Barlow Semi Condensed(영문 본문·메뉴·버튼), `kr`: Pretendard(한글 본문).
관리자 antd 테마도 같은 색 토큰과 Pretendard 를 참조합니다.
