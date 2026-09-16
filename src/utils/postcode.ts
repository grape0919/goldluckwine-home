/** 카카오(다음) 우편번호 서비스 — 주소 검색 팝업.
 *  무료·API 키 불필요. 버튼 클릭 시점에 스크립트를 lazy 로드하므로
 *  SSG 프리렌더·hydration 에 영향이 없다.
 *  https://postcode.map.daum.net/guide */

const SCRIPT_SRC =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

interface DaumPostcodeData {
  /** 사용자가 선택한 형식(도로명/지번)의 주소 */
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  /** 법정동/건물명 등 참고 항목 */
  buildingName: string;
}

interface DaumPostcode {
  new (options: {
    oncomplete: (data: DaumPostcodeData) => void;
    onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void;
  }): { open: () => void };
}

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcode };
  }
}

let loader: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loader = null; // 다음 클릭에서 재시도
        reject(new Error('주소 검색 스크립트를 불러오지 못했습니다.'));
      };
      document.head.appendChild(script);
    });
  }
  return loader;
}

export interface PostcodeResult {
  /** 도로명(또는 사용자가 지번을 선택하면 지번) + 건물명 */
  address: string;
  zonecode: string;
}

/** 주소 검색 팝업을 열고 선택된 주소를 돌려준다. 선택 없이 닫으면 null.
 *  반드시 클릭 핸들러(사용자 제스처) 안에서 호출할 것 — 팝업 차단 방지. */
export async function openPostcode(): Promise<PostcodeResult | null> {
  await loadScript();
  const { Postcode } = window.daum!;
  return new Promise((resolve) => {
    let done = false;
    new Postcode({
      oncomplete: (data) => {
        done = true;
        const building =
          data.buildingName && !data.address.includes(data.buildingName)
            ? ` (${data.buildingName})`
            : '';
        resolve({
          address: `${data.address}${building}`,
          zonecode: data.zonecode,
        });
      },
      onclose: () => {
        // oncomplete 가 먼저 불린 뒤에도 닫힘 이벤트가 온다 — 중복 resolve 방지
        if (!done) resolve(null);
      },
    }).open();
  });
}
