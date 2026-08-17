-- 발주 가격·설정 (B2B 발주 시스템 PR 2-A)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260817_admins.sql, 20260817_partners.sql
--
-- 가격을 wines 컬럼이 아니라 별도 테이블로 두는 이유:
-- wines 는 공개 read 라 행 단위 RLS 로는 가격 컬럼만 숨길 수 없다.
-- wine_prices 는 승인 거래처와 관리자만 조회할 수 있다.

-- 승인 거래처 여부 — 가격·설정 RLS 에서 사용
create or replace function public.is_approved_partner()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.partners
    where user_id = auth.uid() and status = 'approved'
  )
$$;

revoke all on function public.is_approved_partner() from public;
grant execute on function public.is_approved_partner() to authenticated, anon;

-- ────────────────────────────────────────────────────────────
-- 1) 품목 공급가 (원 단위)
-- ────────────────────────────────────────────────────────────
create table if not exists public.wine_prices (
  wine_id    bigint primary key references public.wines(id) on delete cascade,
  price      int not null,          -- 정가(공급가)
  sale_price int,                   -- 할인가 (null 이면 정가 적용)
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_wine_prices_updated on public.wine_prices;
create trigger trg_wine_prices_updated before update on public.wine_prices
  for each row execute function public.set_updated_at();

alter table public.wine_prices enable row level security;

drop policy if exists "partner read wine_prices" on public.wine_prices;
create policy "partner read wine_prices" on public.wine_prices
  for select to authenticated
  using (public.is_admin() or public.is_approved_partner());

drop policy if exists "admin write wine_prices" on public.wine_prices;
create policy "admin write wine_prices" on public.wine_prices
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 발주 가능 플래그 — 가격이 아닌 노출 여부만 wines 에 둔다
alter table public.wines
  add column if not exists orderable boolean not null default false;

-- ────────────────────────────────────────────────────────────
-- 2) 발주 운영 설정 (key-value)
--    min_bottles(최소 병수) · bank_name · bank_account · bank_holder ·
--    deposit_days(입금 기한 일수) · notice(발주 화면 공지) · admin_email(알림 수신)
-- ────────────────────────────────────────────────────────────
create table if not exists public.order_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_order_settings_updated on public.order_settings;
create trigger trg_order_settings_updated before update on public.order_settings
  for each row execute function public.set_updated_at();

alter table public.order_settings enable row level security;

-- 승인 거래처는 읽기(입금 계좌·최소 병수·공지), 쓰기는 관리자만
drop policy if exists "partner read order_settings" on public.order_settings;
create policy "partner read order_settings" on public.order_settings
  for select to authenticated
  using (public.is_admin() or public.is_approved_partner());

drop policy if exists "admin write order_settings" on public.order_settings;
create policy "admin write order_settings" on public.order_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 기본값
insert into public.order_settings (key, value) values
  ('min_bottles', '6'),
  ('deposit_days', '3')
on conflict (key) do nothing;
