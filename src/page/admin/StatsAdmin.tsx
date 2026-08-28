import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Select, Space, Table, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listOrders, isUnpaid } from '@/api/orders';
import type { AdminOrderRow } from '@/api/orders';
import { ColumnChart } from '@/page/admin/charts';
import type { BarDatum } from '@/page/admin/charts';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/** 매출 귀속일 — 명세표·원장의 거래일자와 동일 규칙 (완료일 우선) */
const dateOf = (o: AdminOrderRow) => o.done_at ?? o.created_at;

interface StatRow {
  key: number;
  name: string;
  /** [0]=1월 … [11]=12월 매출 (취소 제외, 입금액 기준) */
  months: number[];
  total: number;
}

/** 매출 통계 — 연도를 골라 월별 추이 차트 + 거래처×월 매출 표.
 *  매출 = 취소 제외 발주의 입금액(total_amount, 공급가+부가세). */
const StatsAdmin = () => {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await listOrders());
    } catch (e) {
      message.error(`발주 내역을 불러오지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const valid = orders.filter((o) => o.status !== 'canceled');

  const years = [...new Set(valid.map((o) => Number(dateOf(o).slice(0, 4))))]
    .sort((a, b) => b - a);
  const selectedYear = year ?? years[0];

  const inYear = valid.filter(
    (o) => Number(dateOf(o).slice(0, 4)) === selectedYear,
  );
  const monthOf = (o: AdminOrderRow) => Number(dateOf(o).slice(5, 7)) - 1;

  // ── 월별 합계 (차트 + 표의 합계 행) ─────────────────────
  const monthTotals = Array.from({ length: 12 }, () => 0);
  for (const o of inYear) monthTotals[monthOf(o)] += o.total_amount;

  const chartData: BarDatum[] = monthTotals.map((sum, i) => ({
    label: `${i + 1}월`,
    value: sum,
    display: `${Math.round(sum / 10000).toLocaleString()}만원`,
  }));

  // ── 거래처 × 월 매출 ────────────────────────────────────
  const byPartner = new Map<number, StatRow>();
  for (const o of inYear) {
    let row = byPartner.get(o.partner_id);
    if (!row) {
      row = {
        key: o.partner_id,
        name: o.partners?.business_name ?? `#${o.partner_id}`,
        months: Array.from({ length: 12 }, () => 0),
        total: 0,
      };
      byPartner.set(o.partner_id, row);
    }
    row.months[monthOf(o)] += o.total_amount;
    row.total += o.total_amount;
  }
  const rows = [...byPartner.values()].sort((a, b) => b.total - a.total);

  const yearTotal = monthTotals.reduce((s, v) => s + v, 0);
  const unpaidTotal = inYear
    .filter(isUnpaid)
    .reduce((s, o) => s + o.total_amount, 0);

  const cell = (v: number) =>
    v === 0 ? (
      <Typography.Text type='secondary'>-</Typography.Text>
    ) : (
      v.toLocaleString('ko-KR')
    );

  const columns: ColumnsType<StatRow> = [
    {
      title: '거래처',
      dataIndex: 'name',
      fixed: 'left',
      width: 180,
      render: (v: string) => <b>{v}</b>,
    },
    ...Array.from({ length: 12 }, (_, i) => ({
      title: `${i + 1}월`,
      align: 'right' as const,
      width: 96,
      render: (_: unknown, r: StatRow) => cell(r.months[i]),
    })),
    {
      title: '합계',
      dataIndex: 'total',
      fixed: 'right',
      align: 'right',
      width: 120,
      render: (v: number) => <b>{v.toLocaleString('ko-KR')}</b>,
    },
  ];

  return (
    <Space
      direction='vertical'
      size={16}
      style={{ width: '100%' }}
    >
      <Space
        wrap
        style={{ justifyContent: 'space-between', width: '100%' }}
      >
        <Space size={12}>
          <Select
            style={{ width: 120 }}
            value={selectedYear}
            onChange={setYear}
            options={years.map((y) => ({ value: y, label: `${y}년` }))}
            placeholder='연도'
          />
          {selectedYear !== undefined && (
            <Typography.Text>
              {selectedYear}년 매출 <b>{won(yearTotal)}</b> · 발주{' '}
              {inYear.length}건
              {unpaidTotal > 0 && (
                <Typography.Text type='danger'>
                  {' '}
                  · 미입금 {won(unpaidTotal)}
                </Typography.Text>
              )}
            </Typography.Text>
          )}
        </Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
        >
          새로고침
        </Button>
      </Space>

      <Card
        title={`월별 매출 추이${selectedYear !== undefined ? ` (${selectedYear}년)` : ''}`}
        size='small'
      >
        <ColumnChart
          data={chartData}
          empty='해당 연도의 발주가 없습니다'
        />
      </Card>

      <Card
        title='거래처 × 월 매출'
        size='small'
      >
        <Table<StatRow>
          size='small'
          rowKey='key'
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1480 }}
          summary={() =>
            rows.length > 0 ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <b>월 합계</b>
                  </Table.Summary.Cell>
                  {monthTotals.map((v, i) => (
                    <Table.Summary.Cell
                      key={i}
                      index={i + 1}
                      align='right'
                    >
                      {cell(v)}
                    </Table.Summary.Cell>
                  ))}
                  <Table.Summary.Cell
                    index={13}
                    align='right'
                  >
                    <b>{yearTotal.toLocaleString('ko-KR')}</b>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            ) : null
          }
        />
        <Typography.Text
          type='secondary'
          style={{ display: 'block', marginTop: 8 }}
        >
          금액은 부가세 포함 입금액 기준, 취소 발주 제외. 귀속월은 완료일(완료
          전에는 접수일) 기준으로 명세표·원장과 같습니다. 단위: 원
        </Typography.Text>
      </Card>
    </Space>
  );
};

export default StatsAdmin;
