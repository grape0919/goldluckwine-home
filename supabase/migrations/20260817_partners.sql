-- 거래처(사업자 회원) 테이블 (B2B 발주 시스템 PR 1-B)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260817_admins.sql (is_admin() 사용)
--
-- ⚠️ 함께 필요한 대시보드 설정: Authentication → Sign In / Up 에서
-- "Allow new users to sign up" 을 다시 켜야 거래처 가입이 가능하다.
-- (관리자 기능은 admins RLS 로 이미 보호되므로 안전)
-- 이메일 인증(Confirm email)은 꺼두면 가입 흐름이 한 번에 끝난다(권장).

create table if not exists public.partners (
  id             bigint generated always as identity primary key,
  user_id        uuid not null unique references auth.users(id) on delete cascade,
  business_no    text not null,                 -- 사업자등록번호 (숫자 10자리)
  business_name  text not null,                 -- 상호
  ceo_name       text not null default '',      -- 대표자명
  contact_name   text not null default '',      -- 담당자명
  phone          text not null default '',      -- 담당자 휴대폰
  email          text not null default '',      -- 가입 이메일 (auth 와 동일)
  invoice_email  text not null default '',      -- 세금계산서 수신 이메일
  address        text not null default '',      -- 배송지 주소
  license_images text[] not null default '{}',  -- 사업자등록증·영업신고증 등 (private 버킷 경로)
  status         text not null default 'pending', -- pending | approved | rejected | suspended
  status_reason  text not null default '',      -- 반려/중지 사유
  nts_status     text not null default '',      -- 국세청 조회 결과 (가입 시점 스냅샷)
  discount_rate  numeric(4, 1) not null default 0, -- 거래처 할인율(%)
  memo           text not null default '',      -- 관리자 메모
  terms_agreed_at timestamptz,                  -- 약관·개인정보·성인확약 동의 시각
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists partners_status_idx on public.partners(status);

drop trigger if exists trg_partners_updated on public.partners;
create trigger trg_partners_updated before update on public.partners
  for each row execute function public.set_updated_at();

-- 거래처 본인 update 시 보호 컬럼(할인율·상태·메모 등) 변경을 차단한다.
-- RLS 는 컬럼 단위 제어가 안 되므로 트리거로 막는다.
create or replace function public.partners_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.business_no   := old.business_no;
    new.status        := old.status;
    new.status_reason := old.status_reason;
    new.nts_status    := old.nts_status;
    new.discount_rate := old.discount_rate;
    new.memo          := old.memo;
    new.terms_agreed_at := old.terms_agreed_at;
  end if;
  return new;
end $$;

drop trigger if exists trg_partners_guard on public.partners;
create trigger trg_partners_guard before update on public.partners
  for each row execute function public.partners_guard();

alter table public.partners enable row level security;

-- 본인 행 조회·생성·수정 (수정 가능한 컬럼은 위 트리거가 제한)
drop policy if exists "self read partners" on public.partners;
create policy "self read partners" on public.partners
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "self insert partners" on public.partners;
create policy "self insert partners" on public.partners
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "self update partners" on public.partners;
create policy "self update partners" on public.partners
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 관리자 전체
drop policy if exists "admin all partners" on public.partners;
create policy "admin all partners" on public.partners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 사업자 서류 전용 private 버킷 (사업자등록증 등 — 공개 금지)
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('partner-docs', 'partner-docs', false)
on conflict (id) do nothing;

-- 본인 업로드 (Supabase 가 owner 를 auth.uid() 로 기록한다)
drop policy if exists "self upload partner-docs" on storage.objects;
create policy "self upload partner-docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'partner-docs' and owner = auth.uid());

-- 본인 + 관리자 조회 (signed URL 발급 포함)
drop policy if exists "self admin read partner-docs" on storage.objects;
create policy "self admin read partner-docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'partner-docs' and (owner = auth.uid() or public.is_admin()));

-- 관리자 삭제
drop policy if exists "admin delete partner-docs" on storage.objects;
create policy "admin delete partner-docs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'partner-docs' and public.is_admin());
