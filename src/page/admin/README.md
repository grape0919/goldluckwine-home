# src/page/admin/ — 관리자 `/admin`

## 구조

`AdminRoot.tsx` → (lazy) `AdminPage.tsx` → antd `Tabs`.

`AdminRoot` 가 antd `ConfigProvider`/`App` 을 **이 서브트리에만** 적용하고 `lazy()` 로
불러오므로 공개 사이트 번들에 antd 가 들어가지 않습니다. 이 구조를 깨지 마세요.
`/admin` 은 프리렌더에서 제외(antd CJS 의 SSR 문제)되고 `vercel.json` rewrite 로 서빙됩니다.

탭 키는 URL 해시로 유지됩니다(새로고침해도 같은 탭).

## 탭

| 키 | 파일 | 내용 |
| --- | --- | --- |
| `dashboard` | `DashboardAdmin.tsx` | 첫 화면. 액션 카드(접수·배송중·미입금·이번 달), 대기 목록(승인대기·계산서 미발행·재고 부족·새 문의), 진행 중 발주, 차트 3종 |
| `wines` | `WineAdmin.tsx` | 와인 CRUD, 노출·솔드아웃·발주가능·추천 스위치, **공급가/할인가·재고**, 드래그 정렬 |
| `wineries` | `WineryAdmin.tsx` | 도멘 CRUD, 검색, 노출, 와인 수 |
| `home` | `HomeContentAdmin.tsx` | 홈 문구·이미지 |
| `orders` | `OrderAdmin.tsx` | 발주 관리 (아래 상세) |
| `partners` | `PartnerAdmin.tsx` | 거래처 승인/반려, 할인율·메모, 서류 열람, 수기 거래처 생성 |
| `inquiries` | `InquiryAdmin.tsx` | 문의 처리 |
| `settings` | `SettingsAdmin.tsx` | 최소 병수·입금 기한·계좌·공지·공급자 정보 |
| `backlabels` | `backlabel/` | 백라벨 편집·시트 인쇄(`LabelSheet`, `printPdf`, `RecycleMark`) |

보조 파일: `ImageUploadItem.tsx`(업로드 폼 아이템), `SortableTableRow.tsx`(dnd-kit ×
antd Table `components` 결합), `charts.tsx`(경량 SVG 차트).

## OrderAdmin.tsx — 가장 복잡한 화면

한 파일에 다음이 모여 있습니다(약 1000줄). 손볼 때 영향 범위를 먼저 확인하세요.

- 목록 + 검색 + 미입금/기한초과 필터 + 상태 필터
- 상태 변경(접수 → 배송중 → 완료 / 취소), **입금 확인 토글**(상태와 별개)
- **대리 발주** — 회원가입 없는 수기 거래처 포함, 발주 Off·숨김 와인도 선택 가능
- **발주 수정 다이얼로그** — 수량·단가 수정, 품목 추가·삭제 (전부 RPC 경유, 재고 연동)
- **발주 복사** — 기존 발주를 새 발주의 초기값으로
- 메모 편집(거래명세표 비고란에 출력)
- 거래명세표 인쇄/PDF (`src/utils/statement.ts`)
- **CSV 2종** — 세금계산서 대장, 발주 내역
- **행 선택 일괄 처리** — 배송중←접수, 완료←배송중, 입금확인←미입금, 계산서←완료·미발행

### 일괄 처리 안전장치 (제거 금지)

```ts
const bulkRun = async (label, applicable: (r) => boolean, fn) => { ... }
useEffect(() => { setSelected([]); }, [filter, payFilter, search]);
```

- 각 작업마다 **적용 대상 조건**을 넘겨, 조건에 안 맞는 행은 건너뛰고 결과를 알린다.
- 필터·검색이 바뀌면 **선택을 해제**한다. (안 하면 화면에 없는 행이 처리된다.)

### CSV 작성 시

엑셀 한글 깨짐 방지를 위해 앞에 BOM 을 붙이는데, 템플릿 리터럴에 원시 BOM 문자를 넣으면
ESLint `no-irregular-whitespace` 로 빌드가 실패합니다. 반드시 `\uFEFF` 이스케이프로 쓰세요.

## charts.tsx

차트 라이브러리를 추가하지 않고 SVG 로 직접 그립니다.

- `ColumnChart` — 월별 발주 추이 / `BarChart` — 거래처·와인 Top 5
- 단일 계열이므로 색은 하나(`#7d5296`, 색각·대비 검증 통과). 텍스트는 잉크 토큰
  (`INK`/`MUTED`/`GRID`)이며 계열 색을 글자에 쓰지 않는다.
- 라벨은 최댓값에만 직접 표기, 나머지는 `<title>` 호버. `aria-label` 로 요약 제공.
- 계열이 늘어난다면 색을 늘리기 전에 차트를 나누는 쪽을 먼저 검토할 것.

## UI 프레임워크에 대한 결정

**antd 를 유지합니다.** Table 5개(컬럼 37)·Form 7개와 dnd-kit 정렬이 antd Table API 에
결합돼 있어 shadcn 전환은 관리자 전면 재작성입니다. antd 가 `/admin` 에만 lazy 로드되어
공개 사이트 성능에 영향이 없다는 점도 근거입니다.
