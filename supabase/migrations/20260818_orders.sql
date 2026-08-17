-- 발주·장바구니 (B2B 발주 시스템 PR 2-B)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260817_admins.sql, 20260817_partners.sql, 20260817_wine_prices.sql

-- 내 거래처 id — RLS 정책에서 사용 (승인 여부는 정책별로 별도 확인)
create or replace function public.my_partner_id()
returns bigint
language sql stable security definer
set search_path = public
as $$
  select id from public.partners where user_id = auth.uid()
$$;

revoke all on function public.my_partner_id() from public;
grant execute on function public.my_partner_id() to authenticated;

-- ────────────────────────────────────────────────────────────
-- 1) 장바구니 — 병수 변경 시 자동 upsert, 제출 시 삭제
-- ────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id         bigint generated always as identity primary key,
  partner_id bigint not null references public.partners(id) on delete cascade,
  wine_id    bigint not null references public.wines(id) on delete cascade,
  qty        int not null check (qty > 0),
  updated_at timestamptz not null default now(),
  unique (partner_id, wine_id)
);

drop trigger if exists trg_cart_items_updated on public.cart_items;
create trigger trg_cart_items_updated before update on public.cart_items
  for each row execute function public.set_updated_at();

alter table public.cart_items enable row level security;

drop policy if exists "self all cart_items" on public.cart_items;
create policy "self all cart_items" on public.cart_items
  for all to authenticated
  using (partner_id = public.my_partner_id() and public.is_approved_partner())
  with check (partner_id = public.my_partner_id() and public.is_approved_partner());

drop policy if exists "admin all cart_items" on public.cart_items;
create policy "admin all cart_items" on public.cart_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 2) 발주 + 품목 스냅샷
-- ────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               bigint generated always as identity primary key,
  partner_id       bigint not null references public.partners(id) on delete restrict,
  status           text not null default 'awaiting_deposit',
    -- awaiting_deposit(입금대기) | paid(입금확인) | shipping(배송중) | done(완료) | canceled(취소)
  total_bottles    int not null,
  subtotal         int not null,          -- 할인 전 합계
  discount_amount  int not null default 0,
  total_amount     int not null,          -- 실제 입금 금액
  address          text not null default '', -- 배송지 스냅샷
  memo             text not null default '',
  deposit_deadline date,
  paid_at          timestamptz,
  shipped_at       timestamptz,
  done_at          timestamptz,
  canceled_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_partner_idx on public.orders(partner_id);
create index if not exists orders_status_idx on public.orders(status);

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references public.orders(id) on delete cascade,
  wine_id    bigint references public.wines(id) on delete set null,
  name_en    text not null,   -- 스냅샷 — 와인이 삭제·수정돼도 발주서는 불변
  name_kr    text not null default '',
  unit_price int not null,    -- 할인 적용된 병 단가
  qty        int not null,
  amount     int not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- 거래처 update 는 "입금대기 → 취소" 전이만 허용, 다른 컬럼 변경은 되돌린다
create or replace function public.orders_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if not (old.status = 'awaiting_deposit' and new.status = 'canceled') then
      raise exception '입금대기 상태의 발주만 취소할 수 있습니다.';
    end if;
    new := old;
    new.status := 'canceled';
    new.canceled_at := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_guard on public.orders;
create trigger trg_orders_guard before update on public.orders
  for each row execute function public.orders_guard();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "self read orders" on public.orders;
create policy "self read orders" on public.orders
  for select to authenticated using (partner_id = public.my_partner_id());

drop policy if exists "self cancel orders" on public.orders;
create policy "self cancel orders" on public.orders
  for update to authenticated
  using (partner_id = public.my_partner_id())
  with check (partner_id = public.my_partner_id());

drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "self read order_items" on public.order_items;
create policy "self read order_items" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.partner_id = public.my_partner_id()
  ));

drop policy if exists "admin all order_items" on public.order_items;
create policy "admin all order_items" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 발주 insert 는 아래 RPC 로만 한다 (클라이언트 직접 insert 정책 없음 —
-- 가격·최소 병수를 서버에서 계산해 위조를 막는다)

-- ────────────────────────────────────────────────────────────
-- 3) 발주 제출 RPC — 장바구니 → 발주 (가격은 DB 에서 계산)
-- ────────────────────────────────────────────────────────────
create or replace function public.submit_order(p_address text, p_memo text)
returns bigint
language plpgsql security definer
set search_path = public
as $$
declare
  v_partner   public.partners%rowtype;
  v_min       int;
  v_days      int;
  v_bottles   int := 0;
  v_subtotal  int := 0;
  v_total     int := 0;
  v_order_id  bigint;
  r           record;
begin
  select * into v_partner from public.partners
    where user_id = auth.uid() and status = 'approved';
  if not found then
    raise exception '승인된 거래처만 발주할 수 있습니다.';
  end if;

  select coalesce(nullif(value, '')::int, 6) into v_min
    from public.order_settings where key = 'min_bottles';
  if not found then v_min := 6; end if;
  select coalesce(nullif(value, '')::int, 3) into v_days
    from public.order_settings where key = 'deposit_days';
  if not found then v_days := 3; end if;

  -- 발주 가능·가격 있는 품목만 집계 (솔드아웃·숨김·가격삭제 품목은 제외)
  create temp table tmp_items on commit drop as
  select c.wine_id, c.qty, w.name_en, w.name_kr,
         floor((coalesce(p.sale_price, p.price))
               * (1 - v_partner.discount_rate / 100))::int as unit_price,
         coalesce(p.sale_price, p.price) as base_price
  from public.cart_items c
  join public.wines w on w.id = c.wine_id
  join public.wine_prices p on p.wine_id = c.wine_id
  where c.partner_id = v_partner.id
    and w.orderable = true
    and coalesce(w.is_visible, true) = true
    and coalesce(w.sold_out, false) = false;

  select coalesce(sum(qty), 0), coalesce(sum(base_price * qty), 0),
         coalesce(sum(unit_price * qty), 0)
    into v_bottles, v_subtotal, v_total from tmp_items;

  if v_bottles = 0 then
    raise exception '발주 가능한 품목이 장바구니에 없습니다.';
  end if;
  if v_bottles < v_min then
    raise exception '최소 발주 수량(%병)에 %병이 부족합니다.', v_min, v_min - v_bottles;
  end if;

  insert into public.orders
    (partner_id, total_bottles, subtotal, discount_amount, total_amount,
     address, memo, deposit_deadline)
  values
    (v_partner.id, v_bottles, v_subtotal, v_subtotal - v_total, v_total,
     coalesce(nullif(trim(p_address), ''), v_partner.address),
     coalesce(p_memo, ''), (now() + make_interval(days => v_days))::date)
  returning id into v_order_id;

  insert into public.order_items
    (order_id, wine_id, name_en, name_kr, unit_price, qty, amount)
  select v_order_id, wine_id, name_en, name_kr, unit_price, qty,
         unit_price * qty
  from tmp_items;

  -- 제출된 품목만 장바구니에서 비운다 (발주 불가로 제외된 품목은 남긴다)
  delete from public.cart_items c
  using tmp_items t
  where c.partner_id = v_partner.id and c.wine_id = t.wine_id;

  return v_order_id;
end $$;

revoke all on function public.submit_order(text, text) from public;
grant execute on function public.submit_order(text, text) to authenticated;
