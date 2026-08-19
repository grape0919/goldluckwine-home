import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { FileImageOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listPartners,
  updatePartnerStatus,
  updatePartnerAdmin,
  getPartnerDocUrl,
  createManualPartner,
} from '@/api/partners';
import type { PartnerRow, PartnerStatus } from '@/api/partners';

const STATUS_META: Record<PartnerStatus, { label: string; color: string }> = {
  pending: { label: '승인대기', color: 'gold' },
  approved: { label: '승인', color: 'green' },
  rejected: { label: '반려', color: 'red' },
  suspended: { label: '중지', color: 'default' },
};

/** 거래처 관리 — 가입 승인/반려/중지, 할인율·메모. DB 조회형이라 '사이트 반영' 불필요. */
const PartnerAdmin = () => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [reasonFor, setReasonFor] = useState<{
    row: PartnerRow;
    status: PartnerStatus;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [form] = Form.useForm<{ discount_rate: number; memo: string }>();
  const [manualForm] = Form.useForm<{
    business_name: string;
    business_no: string;
    ceo_name: string;
    contact_name: string;
    phone: string;
    email: string;
    invoice_email: string;
    address: string;
    discount_rate: number;
  }>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listPartners());
    } catch (e) {
      message.error(
        `거래처 목록을 불러오지 못했습니다: ${(e as Error).message}`,
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (
    row: PartnerRow,
    status: PartnerStatus,
    statusReason = '',
  ) => {
    try {
      await updatePartnerStatus(row.id, status, statusReason);
      setRows((rs) =>
        rs.map((r) =>
          r.id === row.id ? { ...r, status, status_reason: statusReason } : r,
        ),
      );
      message.success(`${STATUS_META[status].label} 처리했습니다.`);
    } catch (e) {
      message.error(`처리 실패: ${(e as Error).message}`);
    }
  };

  const openDocs = async (row: PartnerRow) => {
    try {
      for (const path of row.license_images) {
        window.open(await getPartnerDocUrl(path), '_blank', 'noopener');
      }
    } catch (e) {
      message.error(`서류 열람 실패: ${(e as Error).message}`);
    }
  };

  /** 계정 없는 수기 거래처 등록 — 대리 발주·명세표·계산서용 */
  const saveManual = async () => {
    const values = await manualForm.validateFields();
    setManualSaving(true);
    try {
      await createManualPartner({
        ...values,
        business_no: values.business_no.replace(/\D/g, ''),
        discount_rate: values.discount_rate ?? 0,
      });
      setManualOpen(false);
      manualForm.resetFields();
      await load();
      message.success('수기 거래처를 등록했습니다.');
    } catch (e) {
      message.error(`등록 실패: ${(e as Error).message}`);
    } finally {
      setManualSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const values = await form.validateFields();
    try {
      await updatePartnerAdmin(editing.id, values);
      setRows((rs) =>
        rs.map((r) => (r.id === editing.id ? { ...r, ...values } : r)),
      );
      setEditing(null);
      message.success('저장했습니다.');
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          r.business_name.toLowerCase().includes(q) ||
          r.business_no.includes(q) ||
          r.contact_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      )
    : rows;
  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  const columns: ColumnsType<PartnerRow> = [
    {
      title: '상호 / 사업자번호',
      render: (_, r) => (
        <>
          <b>{r.business_name}</b>
          <br />
          <Typography.Text type='secondary'>{r.business_no}</Typography.Text>
          {r.nts_status && (
            <Tag
              style={{ marginLeft: 6 }}
              color={r.nts_status === '계속사업자' ? 'green' : 'orange'}
            >
              {r.nts_status}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: '담당자',
      render: (_, r) => (
        <>
          {r.contact_name}
          <br />
          <Typography.Text type='secondary'>
            {r.phone} · {r.email}
          </Typography.Text>
        </>
      ),
    },
    {
      title: '상태',
      width: 90,
      filters: (
        Object.entries(STATUS_META) as [
          PartnerStatus,
          { label: string },
        ][]
      ).map(([value, m]) => ({ text: m.label, value })),
      onFilter: (value, r) => r.status === value,
      render: (_, r) => (
        <>
          <Tag color={STATUS_META[r.status].color}>
            {STATUS_META[r.status].label}
          </Tag>
          {!r.user_id && <Tag>수기</Tag>}
        </>
      ),
    },
    {
      title: '할인율',
      width: 80,
      render: (_, r) => `${r.discount_rate}%`,
    },
    {
      title: '',
      width: 300,
      render: (_, r) => (
        <Space size={4} wrap>
          {r.license_images.length > 0 && (
            <Button
              size='small'
              type='text'
              icon={<FileImageOutlined />}
              onClick={() => openDocs(r)}
            >
              서류 {r.license_images.length}
            </Button>
          )}
          <Button
            size='small'
            onClick={() => {
              setEditing(r);
              form.setFieldsValue({
                discount_rate: r.discount_rate,
                memo: r.memo,
              });
            }}
          >
            수정
          </Button>
          {r.status === 'pending' && (
            <>
              <Popconfirm
                title={`${r.business_name} 을(를) 승인할까요?`}
                onConfirm={() => setStatus(r, 'approved')}
              >
                <Button
                  size='small'
                  type='primary'
                >
                  승인
                </Button>
              </Popconfirm>
              <Button
                size='small'
                danger
                onClick={() => {
                  setReason(r.status_reason);
                  setReasonFor({ row: r, status: 'rejected' });
                }}
              >
                반려
              </Button>
            </>
          )}
          {r.status === 'approved' && (
            <Button
              size='small'
              onClick={() => {
                setReason('');
                setReasonFor({ row: r, status: 'suspended' });
              }}
            >
              중지
            </Button>
          )}
          {(r.status === 'suspended' || r.status === 'rejected') && (
            <Popconfirm
              title='이 거래처를 승인 상태로 되돌릴까요?'
              onConfirm={() => setStatus(r, 'approved')}
            >
              <Button size='small'>승인으로 복귀</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {pendingCount > 0 && (
        <Alert
          type='warning'
          showIcon
          style={{ marginBottom: 16 }}
          message={`승인 대기 중인 가입 신청이 ${pendingCount}건 있습니다.`}
        />
      )}
      <Space
        wrap
        style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}
      >
        <Input.Search
          allowClear
          placeholder='상호/사업자번호/담당자/이메일 검색'
          style={{ width: 280 }}
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Space size={8}>
          <Button onClick={() => setManualOpen(true)}>거래처 직접 등록</Button>
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
        scroll={{ x: 'max-content' }}
        expandable={{
          expandedRowRender: (r) => (
            <Typography.Paragraph style={{ margin: 0 }}>
              대표자 {r.ceo_name || '—'} · 배송지 {r.address || '—'} ·
              세금계산서 {r.invoice_email || r.email}
              <br />
              가입 {new Date(r.created_at).toLocaleString('ko-KR')}
              {r.terms_agreed_at &&
                ` · 약관 동의 ${new Date(r.terms_agreed_at).toLocaleString('ko-KR')}`}
              {r.status_reason && (
                <>
                  <br />
                  사유: {r.status_reason}
                </>
              )}
              {r.memo && (
                <>
                  <br />
                  메모: {r.memo}
                </>
              )}
            </Typography.Paragraph>
          ),
        }}
      />

      <Modal
        title='거래처 직접 등록 (계정 없음 — 대리 발주용)'
        open={manualOpen}
        onOk={saveManual}
        onCancel={() => setManualOpen(false)}
        confirmLoading={manualSaving}
        okText='등록'
        cancelText='취소'
        destroyOnClose
      >
        <Form
          form={manualForm}
          layout='vertical'
        >
          <Form.Item
            name='business_name'
            label='상호'
            rules={[{ required: true, message: '상호를 입력하세요' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='business_no'
            label='사업자등록번호'
            rules={[{ required: true, message: '사업자번호를 입력하세요' }]}
          >
            <Input placeholder='000-00-00000' />
          </Form.Item>
          <Form.Item
            name='ceo_name'
            label='대표자'
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='contact_name'
            label='담당자'
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='phone'
            label='연락처'
          >
            <Input placeholder='010-0000-0000' />
          </Form.Item>
          <Form.Item
            name='email'
            label='이메일 (선택 — 있으면 발주 알림 발송)'
          >
            <Input type='email' />
          </Form.Item>
          <Form.Item
            name='invoice_email'
            label='세금계산서 이메일 (선택, 비우면 이메일과 동일)'
          >
            <Input type='email' />
          </Form.Item>
          <Form.Item
            name='address'
            label='배송지 주소'
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='discount_rate'
            label='할인율(%)'
          >
            <InputNumber
              min={0}
              max={99}
              step={0.5}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${editing?.business_name ?? ''} — 할인율·메모`}
        open={Boolean(editing)}
        onOk={saveEdit}
        onCancel={() => setEditing(null)}
        okText='저장'
        cancelText='취소'
        destroyOnClose
      >
        <Form
          form={form}
          layout='vertical'
        >
          <Form.Item
            name='discount_rate'
            label='거래처 할인율(%) — 품목 단가 위에 곱해서 적용'
          >
            <InputNumber
              min={0}
              max={99}
              step={0.5}
            />
          </Form.Item>
          <Form.Item
            name='memo'
            label='관리자 메모'
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          reasonFor
            ? `${reasonFor.row.business_name} — ${STATUS_META[reasonFor.status].label} 사유`
            : ''
        }
        open={Boolean(reasonFor)}
        onOk={async () => {
          if (!reasonFor) return;
          await setStatus(reasonFor.row, reasonFor.status, reason);
          setReasonFor(null);
        }}
        onCancel={() => setReasonFor(null)}
        okText={reasonFor ? STATUS_META[reasonFor.status].label : ''}
        cancelText='취소'
        destroyOnClose
      >
        <Input.TextArea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='거래처에게 표시되는 사유입니다.'
        />
      </Modal>
    </>
  );
};

export default PartnerAdmin;
