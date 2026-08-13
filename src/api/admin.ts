import { supabase } from '@/lib/supabase';
import type { WineRow, WineryRow } from '@/lib/supabase';
import { optimizeImageFile } from '@/utils/image';

/** 관리자 CRUD — RLS 정책상 authenticated 세션에서만 쓰기가 가능합니다. */

export type WineryInput = Omit<WineryRow, 'id'>;
export type WineInput = Omit<WineRow, 'id'>;

const BUCKET = 'wine-assets';

/** Storage 업로드 후 공개 URL 반환 (업로드 전 1600px·WebP로 자동 최적화) */
export async function uploadImage(
  file: File,
  folder: 'wines' | 'wineries' | 'home',
): Promise<string> {
  const optimized = await optimizeImageFile(file);
  const ext = optimized.name.split('.').pop() ?? 'png';
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, optimized);
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Vercel Deploy Hook 설정 여부 — 없으면 '사이트 반영' 버튼이 안내 모드로 동작 */
export const deployHookUrl = import.meta.env.VITE_DEPLOY_HOOK_URL as
  | string
  | undefined;

/**
 * 사이트 재배포 트리거.
 * 사이트가 SSG(빌드 시점 프리렌더)라 DB를 수정해도 재배포 전까지
 * 공개 페이지에 반영되지 않는다 — 저장 후 이 훅으로 재빌드한다.
 * Deploy Hook은 응답에 CORS 헤더가 없어 no-cors로 발사(fire-and-forget)한다.
 */
export async function triggerDeploy(): Promise<void> {
  if (!deployHookUrl) throw new Error('VITE_DEPLOY_HOOK_URL 이 없습니다.');
  await fetch(deployHookUrl, { method: 'POST', mode: 'no-cors' });
}

/**
 * 미반영 변경 추적 — 컴포넌트 state 만으로는 새로고침·재로그인 시 사라지고
 * 편집자 간 공유도 안 되므로, 마지막 "콘텐츠 변경 시각"과 "배포 트리거 시각"을
 * site_meta 에 기록해 비교한다. (삭제는 updated_at 을 남기지 않아 max(updated_at)
 * 비교로는 잡히지 않는다 — 변경 시각을 직접 기록하는 이유)
 */
const LAST_CHANGE_KEY = 'last_content_change_at';
const LAST_DEPLOY_KEY = 'last_deploy_triggered_at';

async function fetchSiteMeta(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('site_meta')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

async function upsertSiteMeta(key: string, value: string): Promise<void> {
  const { error } = await supabase.from('site_meta').upsert({ key, value });
  if (error) throw error;
}

export const recordContentChanged = () =>
  upsertSiteMeta(LAST_CHANGE_KEY, new Date().toISOString());

export const recordDeployTriggered = () =>
  upsertSiteMeta(LAST_DEPLOY_KEY, new Date().toISOString());

/** DB 기준 미반영 변경 여부 — 마지막 변경이 마지막 배포 트리거보다 나중이면 true */
export async function fetchPendingChanges(): Promise<boolean> {
  const [change, deploy] = await Promise.all([
    fetchSiteMeta(LAST_CHANGE_KEY),
    fetchSiteMeta(LAST_DEPLOY_KEY),
  ]);
  if (!change) return false;
  if (!deploy) return true;
  return change > deploy;
}

export const fetchLastDeployTriggeredAt = () => fetchSiteMeta(LAST_DEPLOY_KEY);

export async function listWineries(): Promise<WineryRow[]> {
  const { data, error } = await supabase
    .from('wineries')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return data as WineryRow[];
}

export async function createWinery(input: WineryInput): Promise<void> {
  const { error } = await supabase.from('wineries').insert(input);
  if (error) throw error;
}

export async function updateWinery(
  id: number,
  input: Partial<WineryInput>,
): Promise<void> {
  const { error } = await supabase.from('wineries').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteWinery(id: number): Promise<void> {
  const { error } = await supabase.from('wineries').delete().eq('id', id);
  if (error) throw error;
}

export async function listWines(): Promise<WineRow[]> {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return data as WineRow[];
}

export async function createWine(input: WineInput): Promise<void> {
  const { error } = await supabase.from('wines').insert(input);
  if (error) throw error;
}

export async function updateWine(
  id: number,
  input: Partial<WineInput>,
): Promise<void> {
  const { error } = await supabase.from('wines').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteWine(id: number): Promise<void> {
  const { error } = await supabase.from('wines').delete().eq('id', id);
  if (error) throw error;
}
