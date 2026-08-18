// 발주 시스템 이메일 알림 (Vercel Function)
//
// Supabase Database Webhook 이 partners / orders 테이블의 INSERT·UPDATE 를
// 이 엔드포인트로 전달하면, 시점에 맞는 이메일을 Resend 로 발송한다.
// 클라이언트는 발송에 관여하지 않는다 — DB 변경이 곧 트리거라 위조가 불가능.
//
// 필요한 환경변수:
//   GMAIL_USER / GMAIL_APP_PASSWORD  Gmail SMTP (도메인 인증 불필요 — 기본 발송 경로)
//   RESEND_API_KEY / RESEND_FROM     (대안) Resend — Gmail 미설정 시에만 사용
//   NOTIFY_WEBHOOK_SECRET            Webhook 요청 검증용 임의 문자열
//   VITE_SUPABASE_URL                (기존) Supabase URL
//   SUPABASE_SERVICE_ROLE_KEY        서버 전용 service_role 키 (설정·품목 조회용)

import nodemailer from 'nodemailer';

const SB_URL = process.env.VITE_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
  }
  return transporter;
}

/** Supabase REST 조회 (service role — RLS 우회, 서버 전용) */
async function sb(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  if (!res.ok) throw new Error(`supabase ${path} ${res.status}`);
  return res.json();
}

async function getSettings() {
  const rows = await sb('order_settings?select=key,value');
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  // 설정 탭에서 바꿀 수 있고, 비어 있으면 기본값 사용
  if (!map.admin_email) map.admin_email = 'goldluckwine@gmail.com';
  if (!map.bank_account) {
    map.bank_name = '하나은행';
    map.bank_account = '218-910408-18407';
    map.bank_holder = '골드럭와인';
  }
  return map;
}

const ADMIN_CC = 'goldluckwine@gmail.com';

async function sendEmail(to, subject, html) {
  if (!to) return { skipped: true };
  // 기본: Gmail SMTP (발신자 = GMAIL_USER, 수신 제한 없음)
  if (GMAIL_USER && GMAIL_PASS) {
    // 거래처에게 나가는 메일은 관리자 주소를 CC — 발송 이력이 메일함에 남는다
    const cc =
      to.toLowerCase() === ADMIN_CC || to.toLowerCase() === GMAIL_USER.toLowerCase()
        ? undefined
        : ADMIN_CC;
    return getTransporter().sendMail({
      from: `골드럭와인 <${GMAIL_USER}>`,
      to,
      cc,
      replyTo: ADMIN_CC,
      subject,
      html,
    });
  }
  // 대안: Resend (도메인 인증 후 사용 시)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`resend ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;
const wrap = (body) =>
  `<div style="font-family:sans-serif;line-height:1.7;color:#262322;max-width:560px">
    <p style="font-size:18px;font-weight:700;color:#44291f">GOLDLUCKWINE</p>
    ${body}
    <hr style="border:none;border-top:1px solid #ded5c2;margin:24px 0"/>
    <p style="font-size:12px;color:#888">골드럭와인 거래처 발주 안내 메일입니다. 문의: goldluckwine@gmail.com</p>
  </div>`;

async function orderItemsHtml(orderId) {
  const items = await sb(
    `order_items?order_id=eq.${orderId}&select=name_en,qty,amount`,
  );
  return items
    .map((i) => `${i.name_en} × ${i.qty}병 = ${won(i.amount)}`)
    .join('<br/>');
}

/** partners 이벤트 → 메일 */
async function handlePartner(type, record, old) {
  const jobs = [];
  const settings = await getSettings();

  if (type === 'INSERT') {
    // 신규 가입 신청 → 관리자
    jobs.push(
      sendEmail(
        settings.admin_email,
        `[발주] 신규 거래처 가입 신청 — ${record.business_name}`,
        wrap(
          `<p><b>${record.business_name}</b> (${record.business_no}) 가입 신청이 들어왔습니다.</p>
           <p>담당자 ${record.contact_name} · ${record.phone} · ${record.email}<br/>
           국세청: ${record.nts_status || '자동조회 없음 — 수동 확인 필요'}</p>
           <p>관리자 페이지 → 거래처 탭에서 승인해 주세요.</p>`,
        ),
      ),
    );
  }

  if (type === 'UPDATE' && old && old.status !== record.status) {
    if (record.status === 'approved') {
      jobs.push(
        sendEmail(
          record.email,
          '[골드럭와인] 거래처 승인 완료 — 발주를 시작하실 수 있습니다',
          wrap(
            `<p><b>${record.business_name}</b> 님, 거래처 승인이 완료되었습니다.</p>
             <p>이제 로그인 후 발주 페이지에서 공급가 확인과 발주가 가능합니다.</p>
             <p><a href="https://goldluckwine.com/order">발주 페이지 바로가기</a></p>`,
          ),
        ),
      );
    }
    if (record.status === 'rejected') {
      jobs.push(
        sendEmail(
          record.email,
          '[골드럭와인] 거래처 가입 신청 결과 안내',
          wrap(
            `<p><b>${record.business_name}</b> 님, 아쉽지만 가입 신청이 반려되었습니다.</p>
             ${record.status_reason ? `<p>사유: ${record.status_reason}</p>` : ''}
             <p>문의: goldluckwine@gmail.com</p>`,
          ),
        ),
      );
    }
  }

  return Promise.allSettled(jobs);
}

/** orders 이벤트 → 메일 */
async function handleOrder(type, record, old) {
  const jobs = [];
  const settings = await getSettings();
  const partners = await sb(
    `partners?id=eq.${record.partner_id}&select=business_name,email,invoice_email`,
  );
  const partner = partners[0];
  if (!partner) return [];

  if (type === 'INSERT') {
    const items = await orderItemsHtml(record.id);
    const bank =
      settings.bank_name || settings.bank_account
        ? `${settings.bank_name ?? ''} ${settings.bank_account ?? ''} (예금주 ${settings.bank_holder ?? ''})`
        : '입금 계좌는 별도 안내드립니다.';
    // 입금 요청 → 거래처
    jobs.push(
      sendEmail(
        partner.email,
        `[골드럭와인] 발주 No.${record.id} 접수 — 입금 안내`,
        wrap(
          `<p><b>${partner.business_name}</b> 님, 발주가 접수되었습니다.</p>
           <p>${items}</p>
           <p>합계 <b>${record.total_bottles}병</b>${
             record.vat_amount > 0
               ? ` · 공급가 ${won(record.total_amount - record.vat_amount)} + 부가세 ${won(record.vat_amount)}`
               : ''
           } · <b>입금액 ${won(record.total_amount)}</b></p>
           <p><b>입금 안내</b><br/>${bank}<br/>
           입금자명은 상호로 해주세요.${record.deposit_deadline ? ` 기한: ${record.deposit_deadline}` : ''}</p>
           <p>상품은 접수 순서대로 배송되며, 위 계좌로 기한 내 입금해 주세요.</p>`,
        ),
      ),
    );
    // 신규 발주 → 관리자
    jobs.push(
      sendEmail(
        settings.admin_email,
        `[발주] 신규 발주 No.${record.id} — ${partner.business_name} ${won(record.total_amount)}`,
        wrap(
          `<p><b>${partner.business_name}</b> 신규 발주 (No.${record.id})</p>
           <p>${items}</p>
           <p>합계 ${record.total_bottles}병 · <b>${won(record.total_amount)}</b></p>
           <p>관리자 페이지 → 발주 탭에서 배송·입금을 처리해 주세요.</p>`,
        ),
      ),
    );
  }

  if (type === 'UPDATE' && old) {
    // 입금 확인은 상태 흐름과 분리(paid_at) — 플래그가 새로 켜질 때 안내
    if (!old.paid_at && record.paid_at) {
      jobs.push(
        sendEmail(
          partner.email,
          `[골드럭와인] 발주 No.${record.id} 입금 확인 안내`,
          wrap(
            `<p><b>${partner.business_name}</b> 님,</p>
             <p>발주 No.${record.id} 의 입금(${won(record.total_amount)})이 확인되었습니다. 감사합니다.</p>
             <p><a href="https://goldluckwine.com/order/history">발주 내역 확인</a></p>`,
          ),
        ),
      );
    }
    if (old.status !== record.status) {
      const subjects = {
        shipping: `[골드럭와인] 발주 No.${record.id} 배송이 시작되었습니다`,
        done: `[골드럭와인] 발주 No.${record.id} 배송 완료 — 세금계산서 안내`,
        canceled: `[골드럭와인] 발주 No.${record.id} 취소 안내`,
      };
      const bodies = {
        shipping: `<p>상품이 출고되어 배송 중입니다.</p>`,
        done: `<p>배송이 완료되었습니다. 세금계산서는 등록하신 이메일(${partner.invoice_email || partner.email})로 발행됩니다.</p>`,
        canceled: `<p>발주가 취소되었습니다. 문의: goldluckwine@gmail.com</p>`,
      };
      if (subjects[record.status]) {
        jobs.push(
          sendEmail(
            partner.email,
            subjects[record.status],
            wrap(
              `<p><b>${partner.business_name}</b> 님,</p>${bodies[record.status]}
               <p><a href="https://goldluckwine.com/order/history">발주 내역 확인</a></p>`,
            ),
          ),
        );
      }
    }
  }

  return Promise.allSettled(jobs);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const secret = process.env.NOTIFY_WEBHOOK_SECRET;
  if (!secret || req.headers['x-notify-secret'] !== secret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const mailReady =
    (GMAIL_USER && GMAIL_PASS) || process.env.RESEND_API_KEY;
  if (!mailReady || !SB_URL || !SB_KEY) {
    res.status(200).json({ skipped: 'notify not configured' });
    return;
  }
  try {
    const { type, table, record, old_record: old } = req.body ?? {};
    let results = [];
    if (table === 'partners') results = await handlePartner(type, record, old);
    if (table === 'orders') results = await handleOrder(type, record, old);
    const failed = results.filter((r) => r.status === 'rejected');
    // 발송 실패는 로그로 남기되 webhook 재시도 폭주를 막기 위해 200 반환
    for (const f of failed) console.error('[notify]', f.reason);
    res.status(200).json({ sent: results.length - failed.length, failed: failed.length });
  } catch (e) {
    console.error('[notify]', e);
    res.status(200).json({ error: e.message });
  }
}
