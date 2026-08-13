import { supabase } from '@/lib/supabase';

/** 문의 — 방문자는 등록만, 조회·상태변경·삭제는 RLS상 authenticated 전용 */

export interface InquiryRow {
  id: number;
  name: string;
  company: string;
  contact: string;
  message: string;
  status: 'new' | 'done';
  created_at: string;
}

export interface InquiryInput {
  name: string;
  company: string;
  contact: string;
  message: string;
}

export async function submitInquiry(input: InquiryInput): Promise<void> {
  const { error } = await supabase.from('inquiries').insert(input);
  if (error) throw error;
}

export async function listInquiries(): Promise<InquiryRow[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as InquiryRow[];
}

export async function updateInquiryStatus(
  id: number,
  status: InquiryRow['status'],
): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteInquiry(id: number): Promise<void> {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw error;
}
