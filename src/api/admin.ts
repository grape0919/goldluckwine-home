import { supabase } from '@/lib/supabase';
import type { WineRow, WineryRow } from '@/lib/supabase';

/** 관리자 CRUD — RLS 정책상 authenticated 세션에서만 쓰기가 가능합니다. */

export type WineryInput = Omit<WineryRow, 'id'>;
export type WineInput = Omit<WineRow, 'id'>;

const BUCKET = 'wine-assets';

/** Storage 업로드 후 공개 URL 반환 */
export async function uploadImage(
  file: File,
  folder: 'wines' | 'wineries',
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
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
