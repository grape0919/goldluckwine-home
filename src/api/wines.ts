import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { WineRow, WineryRow } from '@/lib/supabase';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';

/** DB 행 → 화면에서 쓰는 기존 타입으로 변환 */
const toWineInfo = (r: WineRow): WineInfoType => ({
  wineryId: r.winery_id,
  wineId: r.id,
  wineNameEN: r.name_en,
  wineNameKR: r.name_kr,
  wineType: r.wine_type,
  wineVariety: r.variety ?? [],
  wineDescription: r.description,
  wineImagePath: r.image_path,
  // 마이그레이션 전(컬럼 없음, undefined)은 판매 중으로 취급
  soldOut: r.sold_out === true,
});

/** 공개 사이트 노출 대상만 — 마이그레이션 전(컬럼 없음, undefined)은 노출로 취급 */
const isVisible = (r: WineRow) => r.is_visible !== false;

const toWineryInfo = (r: WineryRow): WineryInfoType => ({
  id: r.id,
  domaine: r.domaine,
  domaineKR: r.domaine_kr,
  location: r.location,
  description: r.description,
  imagePath: r.image_path,
});

export async function fetchWines(): Promise<WineInfoType[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    console.error('[fetchWines]', error.message);
    return [];
  }
  return (data as WineRow[]).filter(isVisible).map(toWineInfo);
}

/** SSG getStaticPaths용 — 프리렌더할 와인 id 목록 (빌드 시 Supabase 조회).
 *  숨김 와인은 프리렌더·sitemap에서 제외된다.
 *  (select('*') 인 것은 의도 — is_visible 컬럼이 아직 없는 DB에서도 동작) */
export async function fetchWineIds(): Promise<number[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .order('id', { ascending: true });
  if (error) {
    console.error('[fetchWineIds]', error.message);
    return [];
  }
  return (data as WineRow[]).filter(isVisible).map((r) => r.id);
}

/** SSG getStaticPaths용 — 프리렌더할 와이너리 id 목록 */
export async function fetchWineryIds(): Promise<number[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wineries')
    .select('id')
    .order('id', { ascending: true });
  if (error) {
    console.error('[fetchWineryIds]', error.message);
    return [];
  }
  return (data as { id: number }[]).map((r) => r.id);
}

/** 홈 'OUR COLLECTION' 등에 노출할 추천 와인 */
export async function fetchFeaturedWines(): Promise<WineInfoType[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[fetchFeaturedWines]', error.message);
    return [];
  }
  const visible = ((data as WineRow[]) ?? []).filter(isVisible);
  // 관리자가 아직 아무 와인도 홈 노출로 지정하지 않았다면 전체 목록 앞 3개로 폴백
  if (visible.length === 0) {
    return (await fetchWines()).slice(0, 3);
  }
  return visible.map(toWineInfo);
}

export async function fetchWineById(id: number): Promise<WineInfoType | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[fetchWineById]', error.message);
    return null;
  }
  // 숨김 와인은 직접 URL 접근도 404 처리 (loader가 /not-found로 보낸다)
  if (!data || !isVisible(data as WineRow)) return null;
  return toWineInfo(data as WineRow);
}

export async function fetchWineryById(
  id: number,
): Promise<WineryInfoType | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('wineries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[fetchWineryById]', error.message);
    return null;
  }
  return data ? toWineryInfo(data as WineryRow) : null;
}

export async function fetchWineries(): Promise<WineryInfoType[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('wineries')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    console.error('[fetchWineries]', error.message);
    return [];
  }
  return (data as WineryRow[]).map(toWineryInfo);
}
