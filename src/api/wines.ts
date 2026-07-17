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
});

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
  return (data as WineRow[]).map(toWineInfo);
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
  // 관리자가 아직 아무 와인도 홈 노출로 지정하지 않았다면 전체 목록 앞 3개로 폴백
  if (!data || data.length === 0) {
    return (await fetchWines()).slice(0, 3);
  }
  return (data as WineRow[]).map(toWineInfo);
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
  return data ? toWineInfo(data as WineRow) : null;
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
