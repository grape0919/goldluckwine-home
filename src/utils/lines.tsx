import { Fragment } from 'react';

/** '\n' 저장 문구를 <br/>로 렌더링 — 모바일 `br { display: none }` 규칙이
 *  그대로 동작하도록 텍스트 노드 + br 구조를 유지한다 */
export const renderLines = (text: string) =>
  text.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
