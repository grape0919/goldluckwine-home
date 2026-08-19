# supabase/ — 스키마·마이그레이션 지도

## 운영 방식

**Supabase CLI 연동이 없습니다.** `migrations/` 의 SQL 을 날짜 순서대로
**Dashboard → SQL Editor 에 사람이 직접 붙여넣어 실행**합니다.
따라서 새 마이그레이션을 만들면 파일만 추가하지 말고 실행할 SQL 전문을 사용자에게 제시해야 합니다.

각 파일 머리말에 선행 조건이 주석으로 적혀 있습니다. 순서를 어기면 `is_admin()` 미존재 등으로 실패합니다.

| 파일 | 추가되는 것 |
| --- | --- |
| `20260801_wine_is_visible.sql` | `wines.is_visible` + 인덱스 |
| `20260810_home_content.sql` | `home_content` (홈 문구 key-value) |
| `20260812_back_labels.sql` | `back_labels` (백라벨 인쇄 데이터) |
| `20260812_wine_sold_out.sql` | `wines.sold_out` |
| `20260813_inquiries.sql` | `inquiries` (문의 폼) |
| `20260813_site_meta.sql` | `site_meta` (배포 대기 플래그 등) |
| `20260814_wine_specs.sql` | 빈티지·용량·도수·서빙온도·푸드페어링 |
| `20260814_winery_is_visible.sql` | `wineries.is_visible` |
| **`20260817_admins.sql`** | **`admins` + `is_admin()` + 전 테이블 RLS 교체** ← 모든 B2B 작업의 선행 |
| `20260817_partners.sql` | `partners` + `partners_guard` 트리거 + `partner-docs` private 버킷 |
| `20260817_wine_prices.sql` | `is_approved_partner()`, `wine_prices`, `order_settings`, `wines.orderable` |
| `20260818_orders.sql` | `cart_items`·`orders`·`order_items` + `my_partner_id()` + `submit_order` + `orders_guard` |
| `20260818_invoice_mark.sql` | `orders.invoiced_at` |
| `20260818_vat_exclusive.sql` | `orders.vat_amount` + `submit_order` 부가세 별도 전환 |
| `20260818_admin_orders.sql` | `partners.user_id` nullable, `admin_submit_order`, `admin_update_item_price` |
| `20260819_admin_add_item.sql` | `admin_add_order_item` |
| `20260819_order_flow.sql` | `paid → 접수` 되돌림 허용, `admin_update_order_item` |
| **`20260819_stock.sql`** | **`wines.stock`, `restore_stock_on_cancel()` 트리거, 위 RPC 4종에 재고 로직 추가** (최신) |

`schema.sql` / `seed.sql` 은 초기 구축용이며 이후 변경은 반영돼 있지 않습니다.
현재 상태를 알고 싶으면 `schema.sql` 이 아니라 위 마이그레이션 목록을 순서대로 보세요.

## 권한 모델

세 종류의 주체가 있고, RLS 는 전부 함수 기준입니다.

| 함수 | 뜻 | 정의 |
| --- | --- | --- |
| `is_admin()` | 관리자 | `admins` 테이블에 `auth.uid()` 존재 |
| `is_approved_partner()` | 승인된 거래처 | `partners.status = 'approved'` |
| `my_partner_id()` | 내 거래처 id | 발주·장바구니 RLS 에서 사용 |

핵심 원칙:

- **공개 read 테이블(`wines`, `wineries`, `home_content`)에는 민감 정보를 두지 않는다.**
  가격을 `wine_prices` 로 분리한 이유가 이것. RLS 는 행 단위라 컬럼만 숨길 수 없다.
- **컬럼 단위 보호는 트리거로 한다.**
  - `partners_guard` — 거래처 본인이 상태·할인율·메모·사업자번호를 못 바꾸게 되돌림
  - `orders_guard` — 거래처는 `접수 → 취소` 전이만 가능, 그 외 변경은 예외

## RPC (SECURITY DEFINER)

가격 계산과 재고 조작은 전부 서버에서 합니다. 클라이언트가 보낸 금액은 신뢰하지 않습니다.

| 함수 | 호출자 | 역할 |
| --- | --- | --- |
| `submit_order(address, memo)` | 거래처 | 장바구니 → 발주. 승인·품목·재고·최소 병수 검증, 금액 계산, 재고 차감, 장바구니 비우기 |
| `admin_submit_order(partner_id, items, address, memo)` | 관리자 | 대리 발주 (발주 Off·숨김 와인 포함, 재고 부족해도 진행하되 음수 금지) |
| `admin_add_order_item(order_id, wine_id, qty, unit_price)` | 관리자 | 기존 발주에 품목 추가 |
| `admin_update_order_item(item_id, qty, unit_price)` | 관리자 | 수량·단가 수정 + 재고 증감 조정 |
| `admin_update_item_price(...)` | 관리자 | 품목 단가만 수정(레거시 경로) |

`restore_stock_on_cancel()` 은 `orders` AFTER UPDATE 트리거로, 상태가 `canceled` 로 바뀌면
`order_items` 수량만큼 재고를 되돌립니다.

## Database Webhook

`partners` / `orders` 의 INSERT·UPDATE → `https://<도메인>/api/notify`
(헤더에 `NOTIFY_WEBHOOK_SECRET`). Dashboard 의 Webhook UI 가 안 보이면
`net.http_post` 를 호출하는 트리거를 직접 만들면 됩니다.
발송 결과는 `net._http_response` 테이블을 조회해 확인할 수 있습니다.

## 자주 쓰는 점검 쿼리

```sql
-- 발송 실패 확인
select id, status_code, content from net._http_response order by id desc limit 20;

-- 재고/발주 가능 상태
select id, name_en, orderable, stock, sold_out, is_visible from public.wines order by id;

-- 미입금 발주
select id, partner_id, total_amount, deposit_deadline
from public.orders where paid_at is null and status <> 'canceled';
```
