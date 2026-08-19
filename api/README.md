# api/ — Vercel Functions

`api/*.js` 는 Vercel 이 자동으로 서버리스 함수로 배포합니다(`/api/<파일명>`).
프론트 번들과 별개이므로 여기서만 서버 비밀키를 쓸 수 있습니다.
**`VITE_` 접두사가 붙은 변수는 클라이언트에 노출**되므로 비밀은 절대 그 이름으로 두지 마세요.

## verify-business.js — 국세청 사업자 상태조회

`POST /api/verify-business { businessNo }`

공공데이터포털 "국세청_사업자등록정보 진위확인 및 상태조회" 를 호출합니다.

- `NTS_API_KEY`(디코딩된 인증키)가 없으면 `{ available: false }` 를 반환하고,
  가입 화면은 "가입 후 관리자가 수동 확인" 모드로 동작합니다.
- 사업자번호는 숫자 10자리로 정규화 후 검증.
- **정상 판정은 `b_stt_cd === '01'`(계속사업자) 하나뿐입니다.**
  휴업(`02`)·폐업(`03`)도 `b_stt` 에 값이 들어오기 때문에, 값 존재 여부로 판정하면
  폐업자가 통과합니다(실제로 그런 버그가 있었습니다).

## notify.js — 이메일 알림

`POST /api/notify` ← **Supabase Database Webhook** 이 `partners`/`orders` 의
INSERT·UPDATE 를 보냅니다. 클라이언트는 발송에 관여하지 않으므로 위조가 불가능합니다.

발송 경로 우선순위:

1. **Gmail SMTP** (`GMAIL_USER` + `GMAIL_APP_PASSWORD`) — 기본. 도메인 인증이 필요 없음
2. **Resend** (`RESEND_API_KEY` + `RESEND_FROM`) — Gmail 미설정 시 폴백

```js
const cc = to === ADMIN_CC || to === GMAIL_USER ? undefined : ADMIN_CC;
transporter.sendMail({ from: `골드럭와인 <${GMAIL_USER}>`, to, cc,
                       replyTo: ADMIN_CC, subject, html });
```

거래처에게 보내는 메일은 `goldluckwine@gmail.com` 을 **CC** 로 넣어 이력을 남깁니다.

### Resend 를 버린 이유

도메인 인증 없이는 테스트 모드로 동작해 **계정 소유자 메일로만** 발송됩니다.
(도메인 인증은 발신 주소 검증이지 수신 제한이 아니지만, 미인증 상태의 테스트 모드가
수신자를 제한합니다.) 도메인 인증이 불가해 Gmail SMTP 로 전환했습니다.

### 필요한 환경변수

`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NOTIFY_WEBHOOK_SECRET`,
`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
(선택: `RESEND_API_KEY`, `RESEND_FROM`)

환경변수를 바꾼 뒤에는 **Redeploy 해야 반영**됩니다.

### 발송 문제 진단

Supabase 에서 실제 HTTP 응답을 볼 수 있습니다.

```sql
select id, status_code, content from net._http_response order by id desc limit 20;
```

`{"sent":0,"failed":1}` 처럼 나오면 발송사(Gmail/Resend) 쪽 인증 문제입니다.
