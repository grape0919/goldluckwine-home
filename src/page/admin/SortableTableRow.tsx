import React, { createContext, useContext, useMemo } from 'react';
import { Button } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

/** antd Table 행을 dnd-kit sortable로 만드는 공용 컴포넌트 (antd v5 공식 패턴).
 *  핸들(⠿)로만 드래그되도록 listeners 를 Context 로 핸들 셀에 전달한다. */

interface RowContextValue {
  setActivatorNodeRef?: (el: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = createContext<RowContextValue>({});

/** 순서 컬럼에 넣는 드래그 핸들 버튼 */
export const DragHandle = ({ disabled }: { disabled?: boolean }) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type='text'
      size='small'
      icon={<HolderOutlined />}
      style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
      ref={setActivatorNodeRef}
      disabled={disabled}
      {...(disabled ? {} : listeners)}
    />
  );
};

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': number;
}

/** Table components={{ body: { row: SortableRow } }} 로 주입 */
export const SortableRow = (props: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9 } : {}),
  };

  const contextValue = useMemo<RowContextValue>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr
        {...props}
        ref={setNodeRef}
        style={style}
        {...attributes}
      />
    </RowContext.Provider>
  );
};
