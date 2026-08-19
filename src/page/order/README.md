# src/page/order/ — 거래처 발주 영역 `/order`

승인된 사업자 회원만 실제 기능을 쓸 수 있는 영역입니다. 스타일은 공개 사이트와 같은
크림·브라운 톤(styled-components)이며 **antd 를 쓰지 않습니다**.

## 화면

| 파일 | 경로 | 역할 |
| --- | --- | --- |
| `OrderPage.tsx` | `/order` | 진입점. 세션·거래처 상태에 따라 로그인/가입2단계/승인대기/카탈로그를 분기 |
| `OrderCatalog.tsx` | (내부) | **발주 화면 본체 겸 장바구니.** 검색·타입 필터, 수량 조절, 재고 상한, 합계 |
| `OrderCheckoutPage.tsx` | `/order/checkout` | 배송지·메모 확인 후 `submitOrder` |
| `OrderCompletePage.tsx` | `/order/complete` | 계좌·입금 기한 안내 |
| `OrderHistoryPage.tsx` | `/order/history` | 발주 내역, 접수 건 취소, 명세표 인쇄 |
| `OrderAccountPage.tsx` | `/order/account` | 내 정보 수정(담당자·배송지·계산서 메일) |
| `OrderLoginPage.tsx` | `/order/login` | 로그인 |
| `OrderSignupPage.tsx` | `/order/signup` | 2단계 가입 — 계정 → 사업자 정보(국세청 자동 조회·서류 업로드·약관 동의) |
| `OrderResetPage.tsx` | `/order/reset` | 비밀번호 재설정 |
| `OrderTermsPage.tsx` / `OrderPrivacyPage.tsx` | `/order/terms`, `/order/privacy` | 약관 · 개인정보 처리방침 |

## 공용 조각

| 파일 | 역할 |
| --- | --- |
| `OrderShell.tsx` | 영역 공용 레이아웃(styled). 폼은 ContactForm 과 같은 밑줄 입력 문법 |
| `OrderNav.tsx` | 상단 탭 — 발주하기 / 발주 내역 / 내 정보 + 계정·로그아웃 |
| `useOrderAuth.ts` | 세션 + 내 거래처 행. `session` 있는데 `partner === null` 이면 **가입 2단계 미완료** |
| `useCartCount.ts` | GNB `ORDER` 배지용 병 수. 비로그인·미승인은 RLS 로 빈 결과라 0 |

## 주의점

### 프리렌더 대상이다

`/order` 는 SSG 프리렌더에 **포함**됩니다. 초기 렌더가 세션과 무관한 로딩 셸이라 결정적이기
때문입니다. 여기에 서버·클라이언트가 달라지는 렌더(예: 첫 렌더에서 `localStorage`·세션을
읽어 분기)를 넣으면 hydration 오류(React #418/#423)가 납니다. 세션 의존 UI 는
`useOrderAuth` 가 로드된 **이후**에만 그리세요.

### 장바구니 저장 신뢰성

수량 변경은 빠르게 연타되므로 `OrderCatalog` 는

1. 저장 요청을 **순서 보장 체인(saveQueue)** 으로 직렬화하고,
2. 미확정 항목을 **dirty Set** 으로 추적하며,
3. 결제(체크아웃) 이동 직전에 **재동기화**합니다.

낙관적 UI 로 바꾸더라도 이 세 가지를 없애면 수량 유실이 재발합니다.

### 재고 상한

```ts
const cap = stock == null ? 999 : Math.min(999, stock);
```

`stock === null` 은 "재고 관리 안 함"입니다. 0 과 혼동하지 마세요.
남은 수량이 6병 이하일 때만 화면에 "남은 수량 N병"을 노출합니다.

### 가격 노출

공급가는 승인 거래처에게만 보입니다. RLS 로 `wine_prices` 조회 자체가 막히므로
프론트에서 굳이 숨김 처리를 중복할 필요가 없고, **가격이 없으면 담기 UI 를 렌더하지 않는**
방식으로 처리합니다(`OrderQuickAdd` 와 동일 규칙).
