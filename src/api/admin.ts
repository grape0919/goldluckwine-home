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

/** 현재 로그인 사용자가 관리자(admins 등재)인지 — RLS상 본인 행만 조회된다 */
export async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    // admins 테이블 미생성(마이그레이션 전)이면 기존 동작(로그인=관리자) 유지
    return true;
  }
  return Boolean(data);
}

/** Storage 공개 URL → 버킷 내 경로 (우리 버킷의 업로드 파일이 아니면 null) */
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

/**
 * 어떤 행도 더 이상 참조하지 않는 업로드 이미지를 Storage 에서 삭제한다.
 * 이미지 교체·행 삭제 후에 호출 — 복제된 와인이 같은 파일을 공유할 수 있어
 * 참조가 남아 있으면 지우지 않는다. 정리 실패는 치명적이지 않으므로
 * 호출부에서 await 없이(fire-and-forget) 써도 된다.
 */
export async function removeImageIfOrphan(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  const path = storagePathFromUrl(url);
  if (!path) return; // public/ 정적 자산 등은 대상이 아니다
  const [wines, wineries, home] = await Promise.all([
    supabase.from('wines').select('id').eq('image_path', url).limit(1),
    supabase.from('wineries').select('id').eq('image_path', url).limit(1),
    supabase.from('home_content').select('key').eq('value', url).limit(1),
  ]);
  if (wines.data?.length || wineries.data?.length || home.data?.length) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

/** 도멘별 와인 수 — 도멘 표의 '와인 N종' 표시·삭제 경고용 */
export async function countWinesByWinery(): Promise<Record<number, number>> {
  const { data, error } = await supabase.from('wines').select('winery_id');
  if (error) throw error;
  const counts: Record<number, number> = {};
  for (const r of (data as { winery_id: number }[]) ?? []) {
    counts[r.winery_id] = (counts[r.winery_id] ?? 0) + 1;
  }
  return counts;
}

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
  // cascade 로 함께 지워질 와인 이미지들을 삭제 전에 수집해 두었다가 고아면 정리
  const [{ data: wineImages }, { data: winery }] = await Promise.all([
    supabase.from('wines').select('image_path').eq('winery_id', id),
    supabase.from('wineries').select('image_path').eq('id', id).maybeSingle(),
  ]);
  const { error } = await supabase.from('wineries').delete().eq('id', id);
  if (error) throw error;
  const urls = new Set(
    [
      ...((wineImages as { image_path: string }[]) ?? []).map(
        (r) => r.image_path,
      ),
      (winery as { image_path: string } | null)?.image_path,
    ].filter(Boolean),
  );
  await Promise.allSettled([...urls].map((u) => removeImageIfOrphan(u)));
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

export async function createWine(input: WineInput): Promise<number> {
  const { data, error } = await supabase
    .from('wines')
    .insert(input)
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: number }).id;
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
