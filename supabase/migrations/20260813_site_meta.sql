-- 사이트 운영 메타 (마지막 콘텐츠 변경·배포 트리거 시각)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 관리자 '사이트 반영' 미반영 판단이 세션 state 가 아니라 DB 기준으로 동작하게 한다.

create table if not exists public.site_meta (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_meta_updated on public.site_meta;
create trigger trg_site_meta_updated before update on public.site_meta
  for each row execute function public.set_updated_at();

alter table public.site_meta enable row level security;

-- 관리자 전용 (공개 사이트에서는 사용하지 않음)
drop policy if exists "admin all site_meta" on public.site_meta;
create policy "admin all site_meta" on public.site_meta
  for all to authenticated using (true) with check (true);
