import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Badge,
  Button,
  Popconfirm,
  Radio,
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
  ORDER_STATUS_LABEL,
} from '@/api/orders';
import type { AdminOrderRow, OrderStatus } from '@/api/orders';
import { fetchOrderSettings, ORDER_SETTING_DEFAULTS } from '@/api/pricing';
import type { OrderSettings } from '@/api/pricing';
import { openStatement } from '@/utils/statement';

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
                  {i.unit_price.toLocaleString()}원)
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
              {r.memo && <> · 메모 {r.memo}</>}
              {r.deposit_deadline && (
                <>
                  {' '}
                  · 입금 기한{' '}
                  {new Date(r.deposit_deadline).toLocaleDateString('ko-KR')}
                </>
              )}
            </Typography.Paragraph>
          ),
        }}
      />
    </>
  );
};

export default OrderAdmin;
