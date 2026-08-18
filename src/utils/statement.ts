import type { OrderRow } from '@/api/orders';
import type { OrderSettings } from '@/api/pricing';

/** 거래명세표 — 발주 1건을 인쇄용 창으로 연다 (브라우저 인쇄 → 종이 또는 PDF 저장).
 *  공급자 정보는 관리자 설정 탭(order_settings.supplier_*)에서 입력한다. */

export interface StatementBuyer {
  business_name: string;
  business_no: string;
  ceo_name: string;
  address: string;
  phone?: string;
}

const won = (n: number) => n.toLocaleString('ko-KR');
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 부가세 포함 금액 → 공급가액/세액 (행 단위 역산) */
const splitVat = (amount: number) => {
  const supply = Math.round(amount / 1.1);
  return { supply, vat: amount - supply };
};

export function openStatement(
  order: OrderRow,
  buyer: StatementBuyer,
  settings: OrderSettings,
): void {
  const lines = order.order_items.map((i) => {
    const { supply, vat } = splitVat(i.amount);
    return { ...i, supply, vat };
  });
  const totalSupply = lines.reduce((s, l) => s + l.supply, 0);
  const totalVat = lines.reduce((s, l) => s + l.vat, 0);
  const date = (order.done_at ?? order.created_at).slice(0, 10);

  const partyRow = (
    label: string,
    name: string,
    businessNo: string,
    ceo: string,
    address: string,
    phone: string,
  ) => `
    <td class="party">
      <div class="party-label">${label}</div>
      <table class="party-table">
        <tr><th>등록번호</th><td>${esc(businessNo) || '-'}</td></tr>
        <tr><th>상호</th><td>${esc(name)}</td><th>성명</th><td>${esc(ceo) || '-'}</td></tr>
        <tr><th>주소</th><td colspan="3">${esc(address) || '-'}</td></tr>
        <tr><th>연락처</th><td colspan="3">${esc(phone) || '-'}</td></tr>
      </table>
    </td>`;

  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"/>
<title>거래명세표_No${order.id}_${esc(buyer.business_name)}</title>
<style>
  body { font-family: 'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif;
         color: #111; margin: 0; padding: 32px; font-size: 12px; }
  .sheet { max-width: 720px; margin: 0 auto; }
  h1 { text-align: center; font-size: 22px; letter-spacing: 12px; margin: 0 0 4px;
       text-indent: 12px; }
  .meta { display: flex; justify-content: space-between; margin: 12px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  .parties > tbody > tr > td { border: 1px solid #333; padding: 0; width: 50%; vertical-align: top; }
  .party { padding: 0; }
  .party-label { text-align: center; font-weight: 700; padding: 4px; background: #f2efe8;
                 border-bottom: 1px solid #333; }
  .party-table th, .party-table td { border: 1px solid #bbb; border-width: 0 1px 1px 0;
    padding: 4px 6px; font-size: 11.5px; text-align: left; }
  .party-table th { background: #faf8f2; white-space: nowrap; width: 56px; font-weight: 500; }
  .items { margin-top: 10px; }
  .items th, .items td { border: 1px solid #333; padding: 5px 8px; }
  .items th { background: #f2efe8; font-weight: 600; }
  .items td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .items td.center { text-align: center; }
  tfoot td { font-weight: 700; background: #faf8f2; }
  .note { margin-top: 10px; border: 1px solid #333; padding: 8px 10px; min-height: 34px; }
  .sign { margin-top: 14px; display: flex; justify-content: space-between; }
  .sign div { width: 46%; border-bottom: 1px solid #333; padding: 18px 4px 6px; }
  .toolbar { text-align: center; margin: 20px 0; }
  .toolbar button { padding: 8px 28px; font-size: 14px; cursor: pointer; }
  @media print { .toolbar { display: none; } body { padding: 0; } }
</style></head>
<body>
<div class="sheet">
  <h1>거래명세표</h1>
  <div class="meta">
    <span>발주 No.${order.id}</span>
    <span>거래일자: ${date}</span>
  </div>
  <table class="parties"><tbody><tr>
    ${partyRow(
      '공 급 자',
      settings.supplier_name,
      settings.supplier_business_no,
      settings.supplier_ceo,
      settings.supplier_address,
      settings.supplier_phone,
    )}
    ${partyRow(
      '공급받는자',
      buyer.business_name,
      buyer.business_no,
      buyer.ceo_name,
      buyer.address,
      buyer.phone ?? '',
    )}
  </tr></tbody></table>

  <table class="items">
    <thead><tr>
      <th>품명</th><th>수량(병)</th><th>단가</th><th>공급가액</th><th>세액</th><th>합계</th>
    </tr></thead>
    <tbody>
      ${lines
        .map(
          (l) => `<tr>
        <td>${esc(l.name_en)}${l.name_kr ? ` <span style="color:#777">${esc(l.name_kr)}</span>` : ''}</td>
        <td class="center">${l.qty}</td>
        <td class="num">${won(l.unit_price)}</td>
        <td class="num">${won(l.supply)}</td>
        <td class="num">${won(l.vat)}</td>
        <td class="num">${won(l.amount)}</td>
      </tr>`,
        )
        .join('')}
    </tbody>
    <tfoot><tr>
      <td>합계</td>
      <td class="center">${order.total_bottles}</td>
      <td></td>
      <td class="num">${won(totalSupply)}</td>
      <td class="num">${won(totalVat)}</td>
      <td class="num">${won(order.total_amount)}</td>
    </tr></tfoot>
  </table>

  <div class="note">배송지: ${esc(order.address || '-')}${order.memo ? `<br/>비고: ${esc(order.memo)}` : ''}</div>

  <div class="sign">
    <div>공급자 확인: (인)</div>
    <div>인수자 확인: (인)</div>
  </div>

  <div class="toolbar">
    <button onclick="window.print()">인쇄 / PDF 저장</button>
  </div>
</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
