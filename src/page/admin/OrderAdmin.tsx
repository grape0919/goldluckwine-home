import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Badge,
  Button,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listOrders,
  updateOrderStatus,
  markInvoiced,
  fetchOrderableWines,
  adminSubmitOrder,
  adminUpdateItemPrice,
  adminUpdateOrderMemo,
  ORDER_STATUS_LABEL,
} from '@/api/orders';
import type { AdminOrderRow, OrderStatus } from '@/api/orders';
import {
  fetchOrderSettings,
  fetchWinePrices,
  effectiveUnitPrice,
  vatOf,
  ORDER_SETTING_DEFAULTS,
} from '@/api/pricing';
import type { OrderSettings, WinePriceRow } from '@/api/pricing';
import { listPartners } from '@/api/partners';
import type { PartnerRow } from '@/api/partners';
import type { WineRow } from '@/lib/supabase';
import { openStatement } from '@/utils/statement';

interface ProxyItem {
  wine_id?: number;
  qty: number;
  unit_price: number;
}

/** 공급가액·세액 — 부가세 별도 발주는 저장값 사용,
 *  구버전(부가세 포함가 시절, vat_amount=0) 발주는 역산 호환 */
const splitVat = (r: AdminOrderRow) => {
  if (r.vat_amount > 0) {
    return { supply: r.total_amount - r.vat_amount, vat: r.vat_amount };
  }
  const supply = Math.round(r.total_amount / 1.1);
  return { supply, vat: r.total_amount - supply };
};

/** 완료·미발행 발주들의 세금계산서 대장 CSV (UTF-8 BOM — 엑셀에서 바로 열림) */
function invoiceCsv(rows: AdminOrderRow[]): string {
  const header = [
    '발주번호',
    '작성일자(완료일)',
    '공급받는자 등록번호',
    '상호',
    '대표자',
    '계산서 이메일',
    '주소',
    '품목',
    '공급가액',
    '세액',
    '합계금액',
  ];
  const BOM = '﻿'; // 엑셀이 UTF-8 한글을 올바르게 열도록
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) => {
    const { supply, vat } = splitVat(r);
    const first = r.order_items[0];
    const item =
      r.order_items.length > 1
        ? `${first?.name_en ?? ''} 외 ${r.order_items.length - 1}건`
        : (first?.name_en ?? '');
    return [
      r.id,
      (r.done_at ?? r.created_at).slice(0, 10),
      r.partners?.business_no ?? '',
      r.partners?.business_name ?? '',
      r.partners?.ceo_name ?? '',
      r.partners?.invoice_email || r.partners?.email || '',
      r.partners?.address ?? '',
      item,
      supply,
      vat,
      r.total_amount,
    ]
      .map(esc)
      .join(',');
  });
  return `${BOM}${header.map(esc).join(',')}\n${lines.join('\n')}`;
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  awaiting_deposit: 'gold',
  paid: 'blue',
  shipping: 'geekblue',
  done: 'green',
  canceled: 'default',
};

/** 다음 단계 버튼 — 상태 흐름: 입금대기 → 입금확인 → 배송중 → 완료 */
const NEXT_ACTION: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string }>
> = {
  awaiting_deposit: { next: 'paid', label: '입금확인' },
  paid: { next: 'shipping', label: '배송중으로' },
  shipping: { next: 'done', label: '완료(배송완료)' },
};

/** 발주 관리 — 상태 변경. 완료 처리 시 세금계산서 자동 발행은 Phase 4 에서 연결된다. */
const OrderAdmin = () => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [settings, setSettings] = useState<OrderSettings>({
    ...ORDER_SETTING_DEFAULTS,
  });

  useEffect(() => {
    fetchOrderSettings()
      .then(setSettings)
      .catch(() => undefined);
  }, []);

  // ── 대리 발주 (전화·카톡 주문 입력) ──────────────────────
  const [proxyOpen, setProxyOpen] = useState(false);
  const [proxySaving, setProxySaving] = useState(false);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [wines, setWines] = useState<WineRow[]>([]);
  const [prices, setPrices] = useState<Record<number, WinePriceRow>>({});
  const [proxyPartnerId, setProxyPartnerId] = useState<number | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>([
    { qty: 1, unit_price: 0 },
  ]);
  const [proxyAddress, setProxyAddress] = useState('');
  const [proxyMemo, setProxyMemo] = useState('');

  const openProxy = async () => {
    setProxyOpen(true);
    if (partners.length === 0) {
      try {
        const [ps, ws, pm] = await Promise.all([
          listPartners(),
          fetchOrderableWines(),
          fetchWinePrices(),
        ]);
        setPartners(ps.filter((p) => p.status === 'approved'));
        setWines(ws);
        setPrices(pm);
      } catch (e) {
        message.error(`불러오기 실패: ${(e as Error).message}`);
      }
    }
  };

  const proxyPartner = partners.find((p) => p.id === proxyPartnerId);

  const setProxyItem = (idx: number, patch: Partial<ProxyItem>) =>
    setProxyItems((items) =>
      items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );

  const proxySupply = proxyItems.reduce(
    (s, it) => s + (it.wine_id ? it.unit_price * it.qty : 0),
    0,
  );
  const proxyVat = proxyItems.reduce(
    (s, it) => s + (it.wine_id ? vatOf(it.unit_price * it.qty) : 0),
    0,
  );

  const submitProxy = async () => {
    const items = proxyItems.filter(
      (it): it is Required<ProxyItem> => it.wine_id != null && it.qty > 0,
    );
    if (!proxyPartnerId || items.length === 0) {
      message.warning('거래처와 품목을 선택하세요.');
      return;
    }
    setProxySaving(true);
    try {
      const id = await adminSubmitOrder(
        proxyPartnerId,
        items.map((it) => ({
          wine_id: it.wine_id,
          qty: it.qty,
          unit_price: it.unit_price,
        })),
        proxyAddress,
        proxyMemo,
      );
      message.success(`대리 발주 No.${id} 를 등록했습니다.`);
      setProxyOpen(false);
      setProxyPartnerId(undefined);
      setProxyItems([{ qty: 1, unit_price: 0 }]);
      setProxyAddress('');
      setProxyMemo('');
      await load();
    } catch (e) {
      message.error(`등록 실패: ${(e as Error).message}`);
    } finally {
      setProxySaving(false);
    }
  };

  // ── 품목 단가 수정 ───────────────────────────────────────
  const [editingItem, setEditingItem] = useState<{
    id: number;
    price: number;
  } | null>(null);

  // ── 메모 수정 (거래명세표 비고란에 표시) ─────────────────
  const [editingMemo, setEditingMemo] = useState<{
    id: number;
    memo: string;
  } | null>(null);

  const saveMemo = async () => {
    if (!editingMemo) return;
    try {
      await adminUpdateOrderMemo(editingMemo.id, editingMemo.memo.trim());
      setRows((rs) =>
        rs.map((r) =>
          r.id === editingMemo.id ? { ...r, memo: editingMemo.memo.trim() } : r,
        ),
      );
      setEditingMemo(null);
      message.success('메모를 저장했습니다. 거래명세표 비고란에 표시됩니다.');
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    }
  };

  const saveItemPrice = async () => {
    if (!editingItem) return;
    try {
      await adminUpdateItemPrice(editingItem.id, editingItem.price);
      setEditingItem(null);
      await load();
      message.success('단가를 수정했습니다. 합계·부가세가 재계산되었습니다.');
    } catch (e) {
      message.error(`수정 실패: ${(e as Error).message}`);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listOrders());
    } catch (e) {
      message.error(`발주 목록을 불러오지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (row: AdminOrderRow, status: OrderStatus) => {
    try {
      await updateOrderStatus(row.id, status);
      await load();
      message.success(`No.${row.id} → ${ORDER_STATUS_LABEL[status]}`);
    } catch (e) {
      message.error(`상태 변경 실패: ${(e as Error).message}`);
    }
  };

  /** 홈택스 발행 후 발행 여부 기록 */
  const toggleInvoiced = async (row: AdminOrderRow, on: boolean) => {
    try {
      await markInvoiced(row.id, on);
      setRows((rs) =>
        rs.map((r) =>
          r.id === row.id
            ? { ...r, invoiced_at: on ? new Date().toISOString() : null }
            : r,
        ),
      );
    } catch (e) {
      message.error(`기록 실패: ${(e as Error).message}`);
    }
  };

  /** 완료 상태·미발행 발주를 홈택스 일괄발행용 대장으로 다운로드 */
  const downloadInvoiceCsv = () => {
    const targets = rows.filter((r) => r.status === 'done' && !r.invoiced_at);
    if (targets.length === 0) {
      message.info('완료 상태의 미발행 발주가 없습니다.');
      return;
    }
    const blob = new Blob([invoiceCsv(targets)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `세금계산서대장-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(
      `${targets.length}건 대장을 내려받았습니다. 홈택스 발행 후 각 발주에 '계산서 발행됨'을 체크해 주세요.`,
    );
  };

  const overdue = (r: AdminOrderRow) =>
    r.status === 'awaiting_deposit' &&
    r.deposit_deadline != null &&
    new Date(r.deposit_deadline) < new Date();

  const filtered =
    filter === 'all' ? rows : rows.filter((r) => r.status === filter);
  const countOf = (s: OrderStatus) =>
    rows.filter((r) => r.status === s).length;

  const columns: ColumnsType<AdminOrderRow> = [
    {
      title: 'No.',
      dataIndex: 'id',
      width: 70,
      render: (v: number) => <b>{v}</b>,
    },
    {
      title: '거래처',
      render: (_, r) => (
        <>
          {r.partners?.business_name ?? `#${r.partner_id}`}
          <br />
          <Typography.Text type='secondary'>
            {r.partners?.contact_name} {r.partners?.phone}
          </Typography.Text>
        </>
      ),
    },
    {
      title: '접수일',
      dataIndex: 'created_at',
      width: 110,
      render: (v: string) => new Date(v).toLocaleDateString('ko-KR'),
    },
    { title: '병수', dataIndex: 'total_bottles', width: 70 },
    {
      title: '금액',
      dataIndex: 'total_amount',
      width: 110,
      render: (v: number) => `${v.toLocaleString()}원`,
    },
    {
      title: '상태',
      width: 110,
      render: (_, r) => (
        <>
          <Tag color={STATUS_COLOR[r.status]}>
            {ORDER_STATUS_LABEL[r.status]}
          </Tag>
          {overdue(r) && <Tag color='red'>기한초과</Tag>}
          {r.status === 'done' && (
            <Tag color={r.invoiced_at ? 'green' : 'orange'}>
              {r.invoiced_at ? '계산서 ✓' : '계산서 미발행'}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: '',
      width: 220,
      render: (_, r) => {
        const action = NEXT_ACTION[r.status];
        return (
          <Space size={4}>
            {action && (
              <Popconfirm
                title={`No.${r.id} 을 '${ORDER_STATUS_LABEL[action.next]}' 처리할까요?`}
                onConfirm={() => setStatus(r, action.next)}
              >
                <Button
                  size='small'
                  type='primary'
                >
                  {action.label}
                </Button>
              </Popconfirm>
            )}
            {r.status !== 'canceled' && r.status !== 'done' && (
              <Popconfirm
                title={`No.${r.id} 을 취소할까요?`}
                onConfirm={() => setStatus(r, 'canceled')}
              >
                <Button
                  size='small'
                  danger
                >
                  취소
                </Button>
              </Popconfirm>
            )}
            {r.status !== 'canceled' && (
              <Button
                size='small'
                onClick={() =>
                  openStatement(
                    r,
                    {
                      business_name: r.partners?.business_name ?? '',
                      business_no: r.partners?.business_no ?? '',
                      ceo_name: r.partners?.ceo_name ?? '',
                      address: r.address || (r.partners?.address ?? ''),
                      phone: r.partners?.phone,
                    },
                    settings,
                  )
                }
              >
                명세표
              </Button>
            )}
            {r.status === 'done' &&
              (r.invoiced_at ? (
                <Button
                  size='small'
                  onClick={() => toggleInvoiced(r, false)}
                >
                  발행 취소
                </Button>
              ) : (
                <Button
                  size='small'
                  onClick={() => toggleInvoiced(r, true)}
                >
                  계산서 발행됨
                </Button>
              ))}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Space
        wrap
        style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}
      >
        <Radio.Group
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <Radio.Button value='all'>전체 {rows.length}</Radio.Button>
          {(
            Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]
          ).map((s) => (
            <Radio.Button
              key={s}
              value={s}
            >
              <Badge
                dot={s === 'awaiting_deposit' && countOf(s) > 0}
                offset={[4, 0]}
              >
                {ORDER_STATUS_LABEL[s]} {countOf(s)}
              </Badge>
            </Radio.Button>
          ))}
        </Radio.Group>
        <Space size={8}>
          <Button
            type='primary'
            onClick={openProxy}
          >
            대리 발주
          </Button>
          <Button onClick={downloadInvoiceCsv}>
            세금계산서 대장
            {(() => {
              const n = rows.filter(
                (r) => r.status === 'done' && !r.invoiced_at,
              ).length;
              return n > 0 ? ` (미발행 ${n})` : '';
            })()}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={load}
          >
            새로고침
          </Button>
        </Space>
      </Space>
      <Table
        rowKey='id'
        size='middle'
        loading={loading}
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 20 }}
        expandable={{
          expandedRowRender: (r) => (
            <Typography.Paragraph style={{ margin: 0 }}>
              {r.order_items.map((i) => (
                <span key={i.id}>
                  {i.name_en} × {i.qty}병 = {i.amount.toLocaleString()}원 (병당{' '}
                  {editingItem?.id === i.id ? (
                    <>
                      <InputNumber
                        size='small'
                        min={0}
                        step={1000}
                        value={editingItem.price}
                        onChange={(v) =>
                          setEditingItem({ id: i.id, price: v ?? 0 })
                        }
                        style={{ width: 100 }}
                      />
                      원{' '}
                      <Button
                        size='small'
                        type='primary'
                        onClick={saveItemPrice}
                      >
                        저장
                      </Button>{' '}
                      <Button
                        size='small'
                        onClick={() => setEditingItem(null)}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      {i.unit_price.toLocaleString()}원
                      {r.status !== 'canceled' && (
                        <Button
                          size='small'
                          type='link'
                          onClick={() =>
                            setEditingItem({ id: i.id, price: i.unit_price })
                          }
                        >
                          단가 수정
                        </Button>
                      )}
                    </>
                  )}
                  )
                  <br />
                </span>
              ))}
              공급가 {r.subtotal.toLocaleString()}원 · 할인 −
              {r.discount_amount.toLocaleString()}원
              {r.vat_amount > 0 && (
                <> · 부가세 {r.vat_amount.toLocaleString()}원</>
              )}{' '}
              · 입금액 <b>{r.total_amount.toLocaleString()}원</b>
              <br />
              배송지 {r.address || '—'}
              {r.deposit_deadline && (
                <>
                  {' '}
                  · 입금 기한{' '}
                  {new Date(r.deposit_deadline).toLocaleDateString('ko-KR')}
                </>
              )}
              <br />
              {editingMemo?.id === r.id ? (
                <Space
                  style={{ marginTop: 4, width: '100%' }}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{ width: 360 }}
                    value={editingMemo.memo}
                    onChange={(e) =>
                      setEditingMemo({ id: r.id, memo: e.target.value })
                    }
                    placeholder='명세표 비고란에 표시됩니다'
                  />
                  <Button
                    size='small'
                    type='primary'
                    onClick={saveMemo}
                  >
                    저장
                  </Button>
                  <Button
                    size='small'
                    onClick={() => setEditingMemo(null)}
                  >
                    취소
                  </Button>
                </Space>
              ) : (
                <>
                  메모 {r.memo || '—'}
                  <Button
                    size='small'
                    type='link'
                    onClick={() =>
                      setEditingMemo({ id: r.id, memo: r.memo })
                    }
                  >
                    메모 수정
                  </Button>
                  <Typography.Text type='secondary'>
                    (거래명세표 비고란에 표시)
                  </Typography.Text>
                </>
              )}
            </Typography.Paragraph>
          ),
        }}
      />

      <Modal
        title='대리 발주 — 전화·카톡 주문 입력'
        open={proxyOpen}
        onOk={submitProxy}
        onCancel={() => setProxyOpen(false)}
        confirmLoading={proxySaving}
        okText='발주 등록'
        cancelText='취소'
        width={640}
        destroyOnClose
      >
        <Space
          direction='vertical'
          style={{ width: '100%' }}
          size={12}
        >
          <Select
            showSearch
            placeholder='거래처 선택 (승인·수기 포함)'
            style={{ width: '100%' }}
            value={proxyPartnerId}
            optionFilterProp='label'
            options={partners.map((p) => ({
              value: p.id,
              label: `${p.business_name} (${p.business_no})${p.user_id ? '' : ' [수기]'}`,
            }))}
            onChange={(id: number) => {
              setProxyPartnerId(id);
              const p = partners.find((x) => x.id === id);
              setProxyAddress(p?.address ?? '');
              // 이미 고른 품목들의 단가를 이 거래처 적용가로 갱신
              setProxyItems((items) =>
                items.map((it) =>
                  it.wine_id && prices[it.wine_id]
                    ? {
                        ...it,
                        unit_price: effectiveUnitPrice(
                          prices[it.wine_id],
                          p?.discount_rate ?? 0,
                        ),
                      }
                    : it,
                ),
              );
            }}
          />
          {proxyItems.map((it, idx) => (
            <Space key={idx}>
              <Select
                showSearch
                placeholder='품목'
                style={{ width: 260 }}
                value={it.wine_id}
                optionFilterProp='label'
                options={wines
                  .filter((w) => prices[w.id])
                  .map((w) => ({
                    value: w.id,
                    label: `${w.name_en}${w.sold_out ? ' (솔드아웃)' : ''}`,
                  }))}
                onChange={(wineId: number) =>
                  setProxyItem(idx, {
                    wine_id: wineId,
                    unit_price: prices[wineId]
                      ? effectiveUnitPrice(
                          prices[wineId],
                          proxyPartner?.discount_rate ?? 0,
                        )
                      : 0,
                  })
                }
              />
              <InputNumber
                min={1}
                value={it.qty}
                onChange={(v) => setProxyItem(idx, { qty: v ?? 1 })}
                addonAfter='병'
                style={{ width: 100 }}
              />
              <InputNumber
                min={0}
                step={1000}
                value={it.unit_price}
                onChange={(v) => setProxyItem(idx, { unit_price: v ?? 0 })}
                addonAfter='원'
                style={{ width: 140 }}
              />
              <Button
                size='small'
                danger
                disabled={proxyItems.length === 1}
                onClick={() =>
                  setProxyItems((items) => items.filter((_, i) => i !== idx))
                }
              >
                삭제
              </Button>
            </Space>
          ))}
          <Button
            size='small'
            onClick={() =>
              setProxyItems((items) => [...items, { qty: 1, unit_price: 0 }])
            }
          >
            + 품목 추가
          </Button>
          <Input
            placeholder='배송지 (비우면 거래처 기본 주소)'
            value={proxyAddress}
            onChange={(e) => setProxyAddress(e.target.value)}
          />
          <Input
            placeholder='메모 (선택)'
            value={proxyMemo}
            onChange={(e) => setProxyMemo(e.target.value)}
          />
          <Typography.Text>
            공급가 {proxySupply.toLocaleString()}원 + 부가세{' '}
            {proxyVat.toLocaleString()}원 ={' '}
            <b>입금액 {(proxySupply + proxyVat).toLocaleString()}원</b>
            <Typography.Text
              type='secondary'
              style={{ marginLeft: 8 }}
            >
              (단가는 거래처 적용가 기본, 수정 가능 · 최소 병수 미적용)
            </Typography.Text>
          </Typography.Text>
        </Space>
      </Modal>
    </>
  );
};

export default OrderAdmin;
