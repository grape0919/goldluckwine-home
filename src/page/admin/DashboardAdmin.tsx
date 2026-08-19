import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listOrders, ORDER_STATUS_LABEL } from '@/api/orders';
import type { AdminOrderRow } from '@/api/orders';
import { listPartners } from '@/api/partners';
import type { PartnerRow } from '@/api/partners';
import { listInquiries } from '@/api/inquiries';
import type { InquiryRow } from '@/api/inquiries';
import { BarChart, ColumnChart } from '@/page/admin/charts';
import type { BarDatum } from '@/page/admin/charts';

interface DashboardProps {
  /** 클릭 시 해당 탭으로 이동 */
  onGoTab: (key: string) => void;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
const isOpen = (o: AdminOrderRow) =>
  o.status !== 'done' && o.status !== 'canceled';

/** 운영 대시보드 — 하루 운영(신규 발주 → 배송 → 입금 → 계산서)을 한 화면에서 파악 */
const DashboardAdmin = ({ onGoTab }: DashboardProps) => {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [os, ps, qs] = await Promise.all([
        listOrders(),
        listPartners().catch(() => [] as PartnerRow[]),
        listInquiries().catch(() => [] as InquiryRow[]),
      ]);
      setOrders(os);
      setPartners(ps);
      setInquiries(qs);
    } catch (e) {
      message.error(`대시보드를 불러오지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 처리 대기 — 오늘 관리자가 손대야 할 것들
  const newOrders = orders.filter((o) => o.status === 'awaiting_deposit');
  const shipping = orders.filter((o) => o.status === 'shipping');
  const unpaid = orders.filter((o) => !o.paid_at && o.status !== 'canceled');
  const overdue = unpaid.filter(
    (o) => o.deposit_deadline && new Date(o.deposit_deadline) < now,
  );
  const needInvoice = orders.filter((o) => o.status === 'done' && !o.invoiced_at);
  const pendingPartners = partners.filter((p) => p.status === 'pending');
  const newInquiries = inquiries.filter((q) => q.status === 'new');

  // 이번 달 매출 (취소 제외, 입금액 기준)
  const monthOrders = orders.filter(
    (o) => o.status !== 'canceled' && new Date(o.created_at) >= monthStart,
  );
  const monthTotal = monthOrders.reduce((s, o) => s + o.total_amount, 0);
  const unpaidTotal = unpaid.reduce((s, o) => s + o.total_amount, 0);

  // ── 차트 데이터 (취소 발주 제외) ─────────────────────────
  const valid = orders.filter((o) => o.status !== 'canceled');

  /** 최근 6개월 월별 발주 금액 */
  const monthly: BarDatum[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const sum = valid
      .filter((o) => {
        const t = new Date(o.created_at);
        return t >= d && t < next;
      })
      .reduce((s, o) => s + o.total_amount, 0);
    return {
      label: `${d.getMonth() + 1}월`,
      value: sum,
      display: `${Math.round(sum / 10000).toLocaleString()}만원`,
    };
  });

  /** 거래처별 매출 Top 5 */
  const byPartner = new Map<string, number>();
  for (const o of valid) {
    const name = o.partners?.business_name ?? `#${o.partner_id}`;
    byPartner.set(name, (byPartner.get(name) ?? 0) + o.total_amount);
  }
  const topPartners: BarDatum[] = [...byPartner.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  /** 와인별 판매 Top 5 (병수) */
  const byWine = new Map<string, number>();
  for (const o of valid) {
    for (const i of o.order_items) {
      byWine.set(i.name_en, (byWine.get(i.name_en) ?? 0) + i.qty);
    }
  }
  const topWines: BarDatum[] = [...byWine.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({
      label,
      value,
      display: `${value}병`,
    }));

  const todoColumns: ColumnsType<AdminOrderRow> = [
    {
      title: 'No.',
      dataIndex: 'id',
      width: 64,
      render: (v: number) => <b>{v}</b>,
    },
    {
      title: '거래처',
      render: (_, r) => r.partners?.business_name ?? `#${r.partner_id}`,
    },
    {
      title: '접수일',
      dataIndex: 'created_at',
      width: 100,
      render: (v: string) => new Date(v).toLocaleDateString('ko-KR'),
    },
    {
      title: '금액',
      dataIndex: 'total_amount',
      width: 110,
      align: 'right',
      render: (v: number) => won(v),
    },
    {
      title: '상태',
      width: 150,
      render: (_, r) => (
        <>
          <Tag>{ORDER_STATUS_LABEL[r.status]}</Tag>
          {!r.paid_at && <Tag color='gold'>미입금</Tag>}
          {r.deposit_deadline &&
            !r.paid_at &&
            new Date(r.deposit_deadline) < now && (
              <Tag color='red'>기한초과</Tag>
            )}
        </>
      ),
    },
  ];

  const openOrders = orders.filter(isOpen);

  return (
    <>
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'flex-end' }}
      >
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={load}
        >
          새로고침
        </Button>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size='small'>
            <Statistic
              title='접수 (배송 대기)'
              value={newOrders.length}
              suffix='건'
            />
            <Button
              size='small'
              type='link'
              style={{ paddingLeft: 0 }}
              onClick={() => onGoTab('orders')}
            >
              발주 관리 →
            </Button>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size='small'>
            <Statistic
              title='배송중'
              value={shipping.length}
              suffix='건'
            />
            <Button
              size='small'
              type='link'
              style={{ paddingLeft: 0 }}
              onClick={() => onGoTab('orders')}
            >
              완료 처리 →
            </Button>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size='small'>
            <Statistic
              title='미입금'
              value={unpaid.length}
              suffix='건'
              valueStyle={overdue.length > 0 ? { color: '#cf1322' } : undefined}
            />
            <Typography.Text type='secondary'>
              {won(unpaidTotal)}
              {overdue.length > 0 && ` · 기한초과 ${overdue.length}건`}
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size='small'>
            <Statistic
              title='이번 달 발주'
              value={monthOrders.length}
              suffix='건'
            />
            <Typography.Text type='secondary'>{won(monthTotal)}</Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row
        gutter={[16, 16]}
        style={{ marginTop: 16 }}
      >
        <Col xs={24} md={8}>
          <Card
            size='small'
            title='승인 대기 거래처'
            extra={
              <Button
                size='small'
                type='link'
                onClick={() => onGoTab('partners')}
              >
                거래처 →
              </Button>
            }
          >
            {pendingPartners.length === 0 ? (
              <Typography.Text type='secondary'>없음</Typography.Text>
            ) : (
              pendingPartners.slice(0, 5).map((p) => (
                <div key={p.id}>
                  {p.business_name}{' '}
                  <Typography.Text type='secondary'>
                    {p.business_no}
                  </Typography.Text>
                </div>
              ))
            )}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            size='small'
            title='세금계산서 미발행'
            extra={
              <Button
                size='small'
                type='link'
                onClick={() => onGoTab('orders')}
              >
                대장 →
              </Button>
            }
          >
            {needInvoice.length === 0 ? (
              <Typography.Text type='secondary'>없음</Typography.Text>
            ) : (
              <>
                <b>{needInvoice.length}건</b>{' '}
                <Typography.Text type='secondary'>
                  {won(needInvoice.reduce((s, o) => s + o.total_amount, 0))}
                </Typography.Text>
              </>
            )}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            size='small'
            title='새 문의'
            extra={
              <Button
                size='small'
                type='link'
                onClick={() => onGoTab('inquiries')}
              >
                문의 →
              </Button>
            }
          >
            {newInquiries.length === 0 ? (
              <Typography.Text type='secondary'>없음</Typography.Text>
            ) : (
              newInquiries.slice(0, 5).map((q) => (
                <div key={q.id}>
                  {q.name}
                  {q.company ? ` (${q.company})` : ''}
                </div>
              ))
            )}
          </Card>
        </Col>
      </Row>

      <Card
        size='small'
        title='월별 발주 금액 (최근 6개월)'
        style={{ marginTop: 16 }}
      >
        <ColumnChart data={monthly} />
      </Card>

      <Row
        gutter={[16, 16]}
        style={{ marginTop: 16 }}
      >
        <Col xs={24} lg={12}>
          <Card
            size='small'
            title='거래처별 매출 Top 5'
          >
            <BarChart
              data={topPartners}
              empty='발주 데이터가 없습니다'
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            size='small'
            title='와인별 판매 Top 5 (병수)'
          >
            <BarChart
              data={topWines}
              empty='발주 데이터가 없습니다'
            />
          </Card>
        </Col>
      </Row>

      <Card
        size='small'
        title='진행 중 발주'
        style={{ marginTop: 16 }}
        extra={
          <Button
            size='small'
            type='link'
            onClick={() => onGoTab('orders')}
          >
            전체 보기 →
          </Button>
        }
      >
        {openOrders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='진행 중인 발주가 없습니다'
          />
        ) : (
          <Table
            rowKey='id'
            size='small'
            loading={loading}
            columns={todoColumns}
            dataSource={openOrders.slice(0, 10)}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </>
  );
};

export default DashboardAdmin;
