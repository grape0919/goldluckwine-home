// 국세청 사업자등록 상태조회 (Vercel Function)
// 공공데이터포털 "국세청_사업자등록정보 진위확인 및 상태조회 서비스" 사용.
// 환경변수 NTS_API_KEY(디코딩된 인증키)가 없으면 available:false 를 반환하고,
// 가입 화면은 "가입 후 관리자가 수동 확인" 모드로 동작한다.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const key = process.env.NTS_API_KEY;
  if (!key) {
    res.status(200).json({ available: false });
    return;
  }
  const businessNo = String(req.body?.businessNo ?? '').replace(/\D/g, '');
  if (businessNo.length !== 10) {
    res.status(400).json({ error: '사업자등록번호는 숫자 10자리여야 합니다.' });
    return;
  }
  try {
    const upstream = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b_no: [businessNo] }),
      },
    );
    if (!upstream.ok) {
      res.status(502).json({ error: `국세청 조회 실패 (${upstream.status})` });
      return;
    }
    const json = await upstream.json();
    const item = json?.data?.[0];
    if (!item) {
      res.status(502).json({ error: '국세청 응답이 비어 있습니다.' });
      return;
    }
    // b_stt_cd: "01" 계속사업자 | "02" 휴업자 | "03" 폐업자 | 없음(미등록)
    // 미등록이면 tax_type 에 "국세청에 등록되지 않은 사업자등록번호입니다" 가 온다
    const registered = Boolean(item.b_stt);
    const ok = item.b_stt_cd === '01'; // 계속사업자만 정상 — 휴·폐업은 경고 표시
    res.status(200).json({
      available: true,
      registered,
      ok,
      status: registered ? item.b_stt : (item.tax_type ?? '국세청 미등록'),
      taxType: registered ? (item.tax_type ?? '') : '',
      endDate: item.end_dt ?? '',
    });
  } catch (e) {
    res.status(502).json({ error: `국세청 조회 오류: ${e.message}` });
  }
}
