import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchMyPartner } from '@/api/partners';
import type { PartnerRow } from '@/api/partners';

/** /order 영역 공용 — 세션 + 내 거래처 행 로드.
 *  partner === null 이면서 session 이 있으면 "가입 2단계(사업자 정보) 미완료" 상태다. */
export function useOrderAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [partner, setPartner] = useState<PartnerRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setPartner(data.session ? await fetchMyPartner() : null);
    } catch {
      setPartner(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  return { session, partner, loading, refresh };
}
