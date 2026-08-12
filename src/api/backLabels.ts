import { supabase } from '@/lib/supabase';
import type { BackLabelData } from '@/page/admin/backlabel/labelData';
import { normalizeLabelData } from '@/page/admin/backlabel/labelData';

/** 백라벨 CRUD — 관리자 전용(RLS: authenticated only) */

export interface BackLabelRow {
  id: number;
  wine_id: number;
  data: BackLabelData;
  updated_at: string;
}

export async function fetchBackLabel(
  wineId: number,
): Promise<BackLabelData | null> {
  const { data, error } = await supabase
    .from('back_labels')
    .select('data')
    .eq('wine_id', wineId)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeLabelData(data.data) : null;
}

export async function upsertBackLabel(
  wineId: number,
  label: BackLabelData,
): Promise<void> {
  const { error } = await supabase
    .from('back_labels')
    .upsert({ wine_id: wineId, data: label }, { onConflict: 'wine_id' });
  if (error) throw error;
}

/** 라벨이 저장돼 있는 wine_id 목록 — 와인 선택 드롭다운 표시용 */
export async function listLabeledWineIds(): Promise<number[]> {
  const { data, error } = await supabase.from('back_labels').select('wine_id');
  if (error) throw error;
  return (data ?? []).map((r) => r.wine_id as number);
}
