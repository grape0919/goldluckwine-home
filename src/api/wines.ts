import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { WineRow, WineryRow } from '@/lib/supabase';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { wines as dummyWines } from '@/dummy/wines';
import { wineriesData as dummyWineries } from '@/dummy/wineries';

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

/**
 * 와인 목록. Supabase 미설정 시(로컬 개발 초기 등) 기존 더미 데이터로 폴백합니다.
 * 마이그레이션이 끝나면 폴백은 제거해도 됩니다.
 */
export async function fetchWines(): Promise<WineInfoType[]> {
  if (!isSupabaseConfigured) return dummyWines;
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    console.error('[fetchWines]', error.message);
    return dummyWines;
  }
  return (data as WineRow[]).map(toWineInfo);
}

/** 홈 'OUR COLLECTION' / 'ALL THAT LOIRE' 등에 노출할 추천 와인 */
export async function fetchFeaturedWines(): Promise<WineInfoType[]> {
  if (!isSupabaseConfigured) return dummyWines.slice(0, 3);
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[fetchFeaturedWines]', error.message);
    return dummyWines.slice(0, 3);
  }
  // 관리자가 아직 아무 와인도 홈 노출로 지정하지 않았다면 전체 목록 앞 3개로 폴백
  if (!data || data.length === 0) {
    return (await fetchWines()).slice(0, 3);
  }
  return (data as WineRow[]).map(toWineInfo);
}

export async function fetchWineries(): Promise<WineryInfoType[]> {
  if (!isSupabaseConfigured) return dummyWineries;
  const { data, error } = await supabase
    .from('wineries')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    console.error('[fetchWineries]', error.message);
    return dummyWineries;
  }
  return (data as WineryRow[]).map(toWineryInfo);
}
