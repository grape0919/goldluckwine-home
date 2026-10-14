/** 신규 가입(1단계 계정 생성) 공개 여부.
 *
 *  스팸봇 가입(2026-10, gmail dot-trick + 랜덤 LLC)이 반복되어 임시로 닫아둔다.
 *  false 면: 로그인 화면의 가입 링크가 안내 문구로 바뀌고, /order/signup 의
 *  1단계(계정 생성)가 차단된다. 이미 계정을 만든 거래처의 2단계(사업자 정보)는
 *  계속 동작하므로 진행 중인 가입은 끊기지 않는다.
 *
 *  ⚠️ 코드만으로는 API 레벨 가입을 막지 못한다 — Supabase Dashboard →
 *  Authentication → Sign In / Up 의 "Allow new users to sign up" 도 함께 꺼야
 *  봇이 직접 API 로 계정을 만드는 것까지 막힌다. (기존 계정 로그인은 영향 없음)
 *
 *  다시 열 때: 이 값을 true 로 + 대시보드 설정 ON. CAPTCHA·이메일 인증을 붙인
 *  뒤 여는 것을 권장.
 */
export const SIGNUP_OPEN = false;

/** 가입 중단 안내에 표시할 연락처 */
export const SIGNUP_CONTACT = {
  email: 'goldluckwine@gmail.com',
  phone: '010-9594-1426',
};
