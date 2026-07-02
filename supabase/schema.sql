-- Gold Luck Wine — Supabase schema
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 기존 타입(WineryInfoType, WineInfoType)과 1:1 매핑됩니다.

-- ────────────────────────────────────────────────────────────
-- 1) 와인 타입 enum (src/enum/wine.ts 와 동일)
-- ────────────────────────────────────────────────────────────
do $$ begin
  create type wine_type as enum
    ('White', 'Red', 'Petnat', 'Sweet', 'Orange', 'Rose', 'Sparkling');
exception
  when duplicate_object then null;
end $$;

-- ────────────────────────────────────────────────────────────
-- 2) 와이너리 (도멘)
-- ────────────────────────────────────────────────────────────
create table if not exists public.wineries (
  id          bigint generated always as identity primary key,
  domaine     text not null,              -- 도멘 영문명 (WineryInfoType.domaine)
  domaine_kr  text not null default '',   -- 도멘 한글명 (domaineKR)
  location    text not null default '',   -- 지역 (location)
  description text not null default '',    -- 설명 (description)
  image_path  text not null default '',   -- 이미지 경로/URL (imagePath)
  sort_order  int  not null default 0,     -- 정렬 순서
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 3) 와인
-- ────────────────────────────────────────────────────────────
create table if not exists public.wines (
  id          bigint generated always as identity primary key,
  winery_id   bigint not null references public.wineries(id) on delete cascade,
  name_en     text not null,              -- wineNameEN
  name_kr     text not null default '',   -- wineNameKR
  wine_type   wine_type not null,          -- wineType
  variety     text[] not null default '{}', -- wineVariety (품종 배열)
  description text not null default '',     -- wineDescription
  image_path  text not null default '',   -- wineImagePath
  is_featured boolean not null default false, -- 홈 'ALL THAT LOIRE' / OUR COLLECTION 노출용
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists wines_winery_id_idx on public.wines(winery_id);
create index if not exists wines_featured_idx  on public.wines(is_featured);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_wineries_updated on public.wineries;
create trigger trg_wineries_updated before update on public.wineries
  for each row execute function public.set_updated_at();

drop trigger if exists trg_wines_updated on public.wines;
create trigger trg_wines_updated before update on public.wines
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 4) RLS — 공개 사이트는 읽기만, 관리자(로그인 사용자)는 쓰기 가능
-- ────────────────────────────────────────────────────────────
alter table public.wineries enable row level security;
alter table public.wines    enable row level security;

-- 누구나 조회 (공개 홈페이지)
drop policy if exists "public read wineries" on public.wineries;
create policy "public read wineries" on public.wineries
  for select using (true);

drop policy if exists "public read wines" on public.wines;
create policy "public read wines" on public.wines
  for select using (true);

-- 로그인한 관리자만 쓰기 (Supabase Auth 로 로그인한 사용자)
drop policy if exists "admin write wineries" on public.wineries;
create policy "admin write wineries" on public.wineries
  for all to authenticated using (true) with check (true);

drop policy if exists "admin write wines" on public.wines;
create policy "admin write wines" on public.wines
  for all to authenticated using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- 5) 이미지 스토리지 버킷 (관리자 페이지에서 와인병/도멘 사진 업로드)
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('wine-assets', 'wine-assets', true)
on conflict (id) do nothing;

-- 공개 읽기
drop policy if exists "public read wine-assets" on storage.objects;
create policy "public read wine-assets" on storage.objects
  for select using (bucket_id = 'wine-assets');

-- 관리자 업로드/수정/삭제
drop policy if exists "admin write wine-assets" on storage.objects;
create policy "admin write wine-assets" on storage.objects
  for all to authenticated
  using (bucket_id = 'wine-assets')
  with check (bucket_id = 'wine-assets');
