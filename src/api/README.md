# src/api/ — Supabase 접근 계층

화면은 이 폴더를 통해서만 DB 에 접근합니다. 컴포넌트에서 `supabase.from(...)` 을 직접
부르지 말고 여기에 함수를 추가하세요. 타입도 여기서 export 합니다.

| 파일 | 담당 |
| --- | --- |
| `wines.ts` | 공개 조회 — 와인·도멘 목록/상세, SSG 용 id 목록(`fetchWineIds`, `fetchWineryIds`), 추천 와인 |
| `admin.ts` | 관리자 CRUD — 와인·도멘 생성/수정/삭제, 이미지 업로드·고아 파일 정리, 배포 훅(`triggerDeploy`), `fetchIsAdmin` |
| `homeContent.ts` | 홈 문구 key-value (`HOME_CONTENT_DEFAULTS` 가 기본값 겸 키 목록) |
| `inquiries.ts` | 문의 폼 접수·관리 |
| `backLabels.ts` | 백라벨 인쇄 데이터 |
| `partners.ts` | 거래처 — 가입(`createMyPartner`), 내 정보(`fetchMyPartner`/`updateMyPartner`), 서류 업로드·signed URL, 국세청 검증(`verifyBusinessNo`), 관리자 승인(`updatePartnerStatus`), 수기 거래처(`createManualPartner`) |
| `pricing.ts` | 가격·설정 — `wine_prices` CRUD, **`effectiveUnitPrice()`**, **`vatOf()`**, `ORDER_SETTING_DEFAULTS`, 설정 로드/저장 |
| `orders.ts` | 발주 전체 — 장바구니, 발주 제출·조회·취소, 관리자 발주 조작 |

## 반드시 지켜야 하는 것

### 1. 금액 계산은 두 곳이 짝이다

`pricing.ts` 의 `effectiveUnitPrice()` / `vatOf()` 는 **화면 표시용**이고,
진짜 계산은 Postgres `submit_order` RPC 가 합니다. 규칙을 바꾸면 **둘 다** 고쳐야
표시 금액과 저장 금액이 어긋나지 않습니다.

```ts
effectiveUnitPrice = floor( (sale_price ?? price) * (1 - discount_rate/100) )
vatOf(supply)      = round(supply * 0.1)   // 행 단위
```

### 2. 발주 상태와 입금은 별개다

```ts
ORDER_STATUS_LABEL = { awaiting_deposit: '접수', paid: '접수(입금)',
                       shipping: '배송중', done: '완료', canceled: '취소' }
isUnpaid(o) = !o.paid_at && o.status !== 'canceled'
```

`paid` 상태는 레거시입니다. 입금 여부는 항상 `paid_at` 과 `isUnpaid()` 로 판단하세요.

### 3. 관리자 조작은 RPC 를 쓴다

`adminSubmitOrder` · `adminAddOrderItem` · `adminUpdateOrderItem` 은 재고 증감을 동반하므로
테이블 직접 update 로 대체하면 재고가 어긋납니다.

### 4. 장바구니 변경은 이벤트를 쏜다

`setCartQty` 등이 `CART_CHANGED_EVENT`(`glw:cart-changed`)를 발생시키고,
GNB 배지(`useCartCount`)와 카탈로그 담기 버튼이 이를 구독합니다.
장바구니를 바꾸는 새 경로를 만들면 `notifyCartChanged()` 를 호출하세요.
