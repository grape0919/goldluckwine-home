-- 와인 백라벨(70x35mm) 표시사항 데이터
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
--
-- 라벨 내용은 법정 표시 항목의 목록이라 구조가 바뀔 수 있어 jsonb 로 저장한다.
-- (src/page/admin/backlabel/labelData.ts 의 BackLabelData 타입과 일치)

create table if not exists public.back_labels (
  id         bigint generated always as identity primary key,
  wine_id    bigint not null unique references public.wines(id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_back_labels_updated on public.back_labels;
create trigger trg_back_labels_updated before update on public.back_labels
  for each row execute function public.set_updated_at();

-- 백라벨은 공개 사이트에 쓰이지 않는 관리자 전용 데이터 — 로그인 사용자만 접근
alter table public.back_labels enable row level security;

drop policy if exists "admin all back_labels" on public.back_labels;
create policy "admin all back_labels" on public.back_labels
  for all to authenticated using (true) with check (true);
