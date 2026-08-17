import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CART_CHANGED_EVENT } from '@/api/orders';

/** GNB ORDER 배지용 담긴 병수 — 비로그인·미승인이면 RLS 로 빈 결과라 0이다 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (alive) setCount(0);
        return;
      }
      const { data: rows } = await supabase.from('cart_items').select('qty');
      if (alive) {
        setCount(
          ((rows as { qty: number }[]) ?? []).reduce((s, r) => s + r.qty, 0),
        );
      }
    };
    load();
    window.addEventListener(CART_CHANGED_EVENT, load);
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      alive = false;
      window.removeEventListener(CART_CHANGED_EVENT, load);
      sub.subscription.unsubscribe();
    };
  }, []);

  return count;
}
