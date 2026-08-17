import { supabase } from '@/lib/supabase';
import { optimizeImageFile } from '@/utils/image';

/** 거래처(사업자 회원) — RLS: 본인 행 + 관리자. 보호 컬럼은 DB 트리거가 지킨다. */

export type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PartnerRow {
  id: number;
  user_id: string;
  business_no: string;
  business_name: string;
  ceo_name: string;
  contact_name: string;
  phone: string;
  email: string;
  invoice_email: string;
  address: string;
  license_images: string[];
  status: PartnerStatus;
  status_reason: string;
  nts_status: string;
  discount_rate: number;
  memo: string;
  terms_agreed_at: string | null;
  created_at: string;
}

/** 가입 2단계(사업자 정보)에서 받는 입력 */
export interface PartnerProfileInput {
  business_no: string;
  business_name: string;
  ceo_name: string;
  contact_name: string;
  phone: string;
  invoice_email: string;
  address: string;
}

const DOCS_BUCKET = 'partner-docs';

/** 내 거래처 행 — 없으면 null (가입 2단계 미완료) */
export async function fetchMyPartner(): Promise<PartnerRow | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  return (data as PartnerRow) ?? null;
}

/** 사업자 서류 업로드 (private 버킷, 경로에 uid 포함) */
export async function uploadPartnerDoc(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('로그인이 필요합니다.');
  const optimized = await optimizeImageFile(file);
  const ext = optimized.name.split('.').pop() ?? 'png';
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(DOCS_BUCKET)
    .upload(path, optimized);
  if (error) throw error;
  return path; // private 버킷 — 공개 URL 이 아니라 경로를 저장한다
}

/** 서류 열람용 signed URL (본인·관리자만 RLS 통과) */
export async function getPartnerDocUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DOCS_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

/** 가입 2단계 — 사업자 정보 + 동의 기록 생성 */
export async function createMyPartner(
  input: PartnerProfileInput,
  licenseImages: string[],
  ntsStatus: string,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error('로그인이 필요합니다.');
  const { error } = await supabase.from('partners').insert({
    ...input,
    user_id: user.id,
    email: user.email ?? '',
    invoice_email: input.invoice_email || (user.email ?? ''),
    license_images: licenseImages,
    nts_status: ntsStatus,
    terms_agreed_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** 마이페이지 — 본인 수정 (보호 컬럼은 트리거가 무시한다) */
export async function updateMyPartner(
  input: Partial<
    Pick<
      PartnerRow,
      | 'contact_name'
      | 'phone'
      | 'invoice_email'
      | 'address'
      | 'ceo_name'
      | 'business_name'
    >
  >,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error('로그인이 필요합니다.');
  const { error } = await supabase
    .from('partners')
    .update(input)
    .eq('user_id', uid);
  if (error) throw error;
}

/** 국세청 사업자 상태 조회 (서버 함수 경유) */
export interface BusinessVerification {
  available: boolean;
  registered?: boolean;
  /** 계속사업자(01)일 때만 true — 휴·폐업자는 registered 여도 false */
  ok?: boolean;
  status?: string;
  taxType?: string;
  endDate?: string;
}

export async function verifyBusinessNo(
  businessNo: string,
): Promise<BusinessVerification> {
  const res = await fetch('/api/verify-business', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessNo }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `조회 실패 (${res.status})`);
  }
  return (await res.json()) as BusinessVerification;
}

// ── 관리자용 ────────────────────────────────────────────────

export async function listPartners(): Promise<PartnerRow[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as PartnerRow[];
}

export async function updatePartnerStatus(
  id: number,
  status: PartnerStatus,
  reason = '',
): Promise<void> {
  const { error } = await supabase
    .from('partners')
    .update({ status, status_reason: reason })
    .eq('id', id);
  if (error) throw error;
}

export async function updatePartnerAdmin(
  id: number,
  input: Partial<Pick<PartnerRow, 'discount_rate' | 'memo'>>,
): Promise<void> {
  const { error } = await supabase.from('partners').update(input).eq('id', id);
  if (error) throw error;
}
