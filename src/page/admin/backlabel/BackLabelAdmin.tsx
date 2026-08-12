import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';
import '@fontsource/nanum-gothic/400.css';
import '@fontsource/nanum-gothic/700.css';
import '@fontsource/nanum-gothic/800.css';
import { listWines } from '@/api/admin';
import {
  fetchBackLabel,
  listLabeledWineIds,
  upsertBackLabel,
} from '@/api/backLabels';
import type { WineRow } from '@/lib/supabase';
import type { BackLabelData } from '@/page/admin/backlabel/labelData';
import { draftForWine } from '@/page/admin/backlabel/labelData';
import LabelSheet, {
  LABEL_W_MM,
  LABEL_H_MM,
} from '@/page/admin/backlabel/LabelSheet';
import { downloadLabelPdf, printLabel } from '@/page/admin/backlabel/printPdf';

const { Text } = Typography;

const MM_TO_PX = 96 / 25.4;

/**
 * 인쇄 시 페이지를 라벨 실물 크기(70x35mm)로 만들고,
 * 인쇄 전용 루트(#bl-print-root)만 남기고 전부 숨긴다.
 * 이 CSS 는 관리자 번들에만 포함되므로 공개 페이지 인쇄에는 영향이 없다.
 */
const PrintStyle = createGlobalStyle`
  #bl-print-root {
    position: fixed;
    left: -10000px;
    top: 0;
    background: #fff;
  }
  @media print {
    @page { size: ${LABEL_W_MM}mm ${LABEL_H_MM}mm; margin: 0; }
    body > *:not(#bl-print-root) { display: none !important; }
    #bl-print-root { position: static !important; }
  }
`;

const BackLabelAdmin = () => {
  const { message } = App.useApp();
  const [wines, setWines] = useState<WineRow[]>([]);
  const [labeledIds, setLabeledIds] = useState<Set<number>>(new Set());
  const [wineId, setWineId] = useState<number | null>(null);
  const [label, setLabel] = useState<BackLabelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [guide, setGuide] = useState(true);
  const [scale, setScale] = useState(4);
  const printRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([listWines(), listLabeledWineIds()])
      .then(([ws, ids]) => {
        setWines(ws);
        setLabeledIds(new Set(ids));
      })
      .catch((e) => message.error(`와인 목록 로딩 실패: ${(e as Error).message}`));
  }, [message]);

  const selectedWine = wines.find((w) => w.id === wineId) ?? null;
  const wineName = selectedWine
    ? selectedWine.name_kr || selectedWine.name_en
    : '';

  const selectWine = async (id: number) => {
    setWineId(id);
    setLabel(null);
    setLoading(true);
    try {
      const saved = await fetchBackLabel(id);
      const wine = wines.find((w) => w.id === id);
      setLabel(saved ?? (wine ? draftForWine(wine) : null));
      setDirty(!saved);
    } catch (e) {
      message.error(`라벨 로딩 실패: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const patch = (p: Partial<BackLabelData>) => {
    setLabel((prev) => (prev ? { ...prev, ...p } : prev));
    setDirty(true);
  };

  const handleSave = async () => {
    if (wineId == null || !label) return;
    setSaving(true);
    try {
      await upsertBackLabel(wineId, label);
      setLabeledIds((prev) => new Set(prev).add(wineId));
      setDirty(false);
      message.success('백라벨을 저장했습니다.');
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    const node = printRootRef.current?.querySelector('.bl-label');
    if (!node) return;
    setDownloading(true);
    try {
      await downloadLabelPdf(
        node as HTMLElement,
        `백라벨_${wineName}_${LABEL_W_MM}x${LABEL_H_MM}.pdf`,
      );
    } catch (e) {
      message.error(`PDF 생성 실패: ${(e as Error).message}`);
    } finally {
      setDownloading(false);
    }
  };

  const previewW = LABEL_W_MM * MM_TO_PX * scale;
  const previewH = LABEL_H_MM * MM_TO_PX * scale;

  return (
    <Wrapper>
      <PrintStyle />

      <Space
        wrap
        style={{ marginBottom: 16 }}
      >
        <Select
          style={{ minWidth: 260 }}
          placeholder='와인을 선택하세요'
          value={wineId}
          onChange={selectWine}
          loading={!wines.length}
          showSearch
          optionFilterProp='label'
          options={wines.map((w) => ({
            value: w.id,
            label:
              (w.name_kr || w.name_en) +
              (labeledIds.has(w.id) ? '' : ' (라벨 없음)'),
          }))}
        />
        <Button
          type='primary'
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
          disabled={!label || !dirty}
        >
          저장
        </Button>
        <Button
          icon={<PrinterOutlined />}
          onClick={() => printLabel(`백라벨_${wineName}`)}
          disabled={!label}
        >
          인쇄하기
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={downloading}
          disabled={!label}
        >
          PDF 다운로드
        </Button>
        {selectedWine && (
          <Popconfirm
            title='편집 내용을 버리고 기본 템플릿으로 되돌릴까요?'
            onConfirm={() => {
              setLabel(draftForWine(selectedWine));
              setDirty(true);
            }}
            okText='되돌리기'
            cancelText='취소'
          >
            <Button danger>템플릿으로 초기화</Button>
          </Popconfirm>
        )}
      </Space>

      {dirty && label && (
        <Alert
          type='warning'
          showIcon
          style={{ marginBottom: 16 }}
          message='저장되지 않은 변경사항이 있습니다.'
        />
      )}

      {!label && !loading && (
        <Alert
          type='info'
          showIcon
          message='와인을 선택하면 저장된 백라벨을 불러오거나, 없으면 기본 템플릿으로 초안을 만들어줍니다.'
        />
      )}

      {label && (
        <Row gutter={24}>
          <Col
            xs={24}
            lg={10}
          >
            <Card
              size='small'
              title='표시사항 항목'
            >
              {label.items.map((t, i) => (
                <Space.Compact
                  key={i}
                  block
                  style={{ marginBottom: 6 }}
                >
                  <Input
                    value={t}
                    onChange={(e) => {
                      const items = label.items.slice();
                      items[i] = e.target.value;
                      patch({ items });
                    }}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      patch({ items: label.items.filter((_, j) => j !== i) })
                    }
                  />
                </Space.Compact>
              ))}
              <Button
                block
                type='dashed'
                icon={<PlusOutlined />}
                onClick={() =>
                  patch({ items: [...label.items, `${label.items.length + 1}.`] })
                }
              >
                항목 추가
              </Button>

              <Divider style={{ margin: '16px 0 12px' }} />

              <Field label='과음경고문구'>
                <Input.TextArea
                  rows={3}
                  value={label.warning}
                  onChange={(e) => patch({ warning: e.target.value })}
                />
              </Field>
              <Field label='강조표시 (반전 배지)'>
                <Select
                  mode='tags'
                  style={{ width: '100%' }}
                  value={label.badges}
                  onChange={(badges) => patch({ badges })}
                  open={false}
                  suffixIcon={null}
                  placeholder='입력 후 Enter'
                />
              </Field>
              <Space
                wrap
                size='large'
              >
                <Field label='분리배출 재질'>
                  <Input
                    style={{ width: 90 }}
                    value={label.recycle}
                    onChange={(e) => patch({ recycle: e.target.value })}
                  />
                </Field>
                <Field label='본문 크기(pt)'>
                  <InputNumber
                    min={4}
                    max={12}
                    step={0.1}
                    value={label.bodyPt}
                    onChange={(v) => patch({ bodyPt: v ?? 7 })}
                  />
                </Field>
                <Field label='경고문 크기(pt)'>
                  <InputNumber
                    min={4}
                    max={12}
                    step={0.1}
                    value={label.warnPt}
                    onChange={(v) => patch({ warnPt: v ?? 7 })}
                  />
                </Field>
              </Space>
              <Field label='신고 안내'>
                <Input
                  value={label.report}
                  onChange={(e) => patch({ report: e.target.value })}
                />
              </Field>
            </Card>
          </Col>

          <Col
            xs={24}
            lg={14}
          >
            <Card
              size='small'
              title='미리보기'
              extra={
                <Space size='large'>
                  <Space size='small'>
                    <Text type='secondary'>재단선</Text>
                    <Switch
                      size='small'
                      checked={guide}
                      onChange={setGuide}
                    />
                  </Space>
                  <Space size='small'>
                    <Text type='secondary'>배율 {scale}x</Text>
                    <Slider
                      min={2}
                      max={8}
                      step={0.5}
                      value={scale}
                      onChange={setScale}
                      style={{ width: 120 }}
                    />
                  </Space>
                </Space>
              }
            >
              <div className='preview-scroll'>
                <div
                  style={{
                    width: previewW,
                    height: previewH,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      position: 'absolute',
                    }}
                  >
                    <LabelSheet
                      data={label}
                      guide={guide}
                    />
                  </div>
                </div>
              </div>
              <Text type='secondary'>
                실물 크기 {LABEL_W_MM}×{LABEL_H_MM}mm — 인쇄는 Chrome/Edge에서
                여백 &quot;없음&quot;, 배율 100%로 하세요. 재단선은 화면
                확인용이며 인쇄/PDF에는 포함되지 않습니다.
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* 인쇄·PDF 캡처용 실물 크기 라벨 — 화면 밖에 렌더, 인쇄 시에만 노출 */}
      {label &&
        createPortal(
          <div
            id='bl-print-root'
            ref={printRootRef}
          >
            <LabelSheet data={label} />
          </div>,
          document.body,
        )}
    </Wrapper>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ marginBottom: 4 }}>
      <Text type='secondary'>{label}</Text>
    </div>
    {children}
  </div>
);

const Wrapper = styled.div`
  .preview-scroll {
    overflow: auto;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
`;

export default BackLabelAdmin;
