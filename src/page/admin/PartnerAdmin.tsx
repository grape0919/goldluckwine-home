import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  App,
  Descriptions,
  Divider,
  Drawer,
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
  adminUploadPartnerDoc,
  removePartnerDoc,
  createManualPartner,
} from '@/api/partners';
import type { PartnerRow, PartnerStatus } from '@/api/partners';
import { formatBizNo } from '@/utils/bizNo';
import { openPostcode } from '@/utils/postcode';

const STATUS_META: Record<PartnerStatus, { label: string; color: string }> = {
  pending: { label: '승인대기', color: 'gold' },
  approved: { label: '승인', color: 'green' },
  rejected: { label: '반려', color: 'red' },
  suspended: { label: '중지', color: 'default' },
};

/** 거래처 관리 — 가입 승인/반려/중지, 할인율·메모. DB 조회형이라 '사이트 반영' 불필요. */
interface PartnerAdminProps {
  /** 탭 활성 여부 — 활성화될 때마다 재조회 (새 가입 신청 반영) */
  active?: boolean;
}

const PartnerAdmin = ({ active = true }: PartnerAdminProps) => {
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
  const [form] = Form.useForm<{
    discount_rate: number;
    memo: string;
    // 수기 거래처 전용 — 계정 거래처 모달에서는 렌더되지 않는다
    business_name?: string;
    business_no?: string;
    ceo_name?: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    invoice_email?: string;
    address?: string;
  }>();
  const [manualForm] = Form.useForm<{
    business_name: string;
    business_no: string;
    ceo_name: string;
    contact_name: string;
    phone: string;
    email: string;
    invoice_email: string;
    address: string;
    /** 저장 시 address 에 합쳐진다 — DB 는 단일 주소 텍스트 */
    address_detail?: string;
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
    if (active) load();
  }, [active, load]);

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

  // 행 클릭 → 상세 Drawer (발주 탭과 동일 패턴). 상태 변경 후에도 최신을 보도록 id 참조
  const [detailId, setDetailId] = useState<number | null>(null);

  // ── 서류 관리 — 개별 열람·등록·삭제 (미제출 거래처는 따로 받아 관리자가 등록) ──
  const [docBusy, setDocBusy] = useState(false);

  const openDoc = async (path: string) => {
    try {
      window.open(await getPartnerDocUrl(path), '_blank', 'noopener');
    } catch (e) {
      message.error(`서류 열람 실패: ${(e as Error).message}`);
    }
  };

  const setDocs = async (row: PartnerRow, next: string[]) => {
    await updatePartnerAdmin(row.id, { license_images: next });
    setRows((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, license_images: next } : r)),
    );
  };

  const addDoc = (row: PartnerRow) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setDocBusy(true);
      try {
        const path = await adminUploadPartnerDoc(row.id, file);
        await setDocs(row, [...row.license_images, path]);
        message.success('서류를 등록했습니다.');
      } catch (e) {
        message.error(`서류 등록 실패: ${(e as Error).message}`);
      } finally {
        setDocBusy(false);
      }
    };
    input.click();
  };

  const removeDoc = async (row: PartnerRow, path: string) => {
    setDocBusy(true);
    try {
      await removePartnerDoc(path);
      await setDocs(
        row,
        row.license_images.filter((p) => p !== path),
      );
      message.success('서류를 삭제했습니다.');
    } catch (e) {
      message.error(`서류 삭제 실패: ${(e as Error).message}`);
    } finally {
      setDocBusy(false);
    }
  };

  /** 계정 없는 수기 거래처 등록 — 대리 발주·명세표·계산서용 */
  const saveManual = async () => {
    const { address_detail, ...values } = await manualForm.validateFields();
    setManualSaving(true);
    try {
      await createManualPartner({
        ...values,
        business_no: values.business_no.replace(/\D/g, ''),
        discount_rate: values.discount_rate ?? 0,
        address: [values.address?.trim(), address_detail?.trim()]
          .filter(Boolean)
          .join(' '),
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
    if (typeof values.business_no === 'string') {
      values.business_no = values.business_no.replace(/\D/g, '');
    }
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
  // 사업자번호는 숫자만 저장되므로 검색어의 하이픈도 무시하고 비교
  const qDigits = q.replace(/\D/g, '');
  const filtered = q
    ? rows.filter(
        (r) =>
          r.business_name.toLowerCase().includes(q) ||
          (qDigits !== '' && r.business_no.includes(qDigits)) ||
          r.contact_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      )
    : rows;
  const pendingCount = rows.filter((r) => r.status === 'pending').length;
  const detail =
    detailId == null ? null : rows.find((r) => r.id === detailId) ?? null;

  const columns: ColumnsType<PartnerRow> = [
    {
      title: '상호 / 사업자번호',
      render: (_, r) => (
        <>
          <b>{r.business_name}</b>
          <br />
          <Typography.Text type='secondary'>
            {formatBizNo(r.business_no)}
          </Typography.Text>
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
      // 자주 쓰는 승인·반려만 행에 — 나머지(서류·수정·중지·복귀)는 상세 Drawer 로
      title: '',
      width: 150,
      render: (_, r) =>
        r.status === 'pending' ? (
          <Space size={4}>
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
          </Space>
        ) : null,
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
        onRow={(r) => ({
          style: { cursor: 'pointer' },
          onClick: (e) => {
            const el = e.target as HTMLElement;
            if (el.closest('button, a, .ant-checkbox-wrapper')) return;
            setDetailId(r.id);
          },
        })}
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
            <Input
              placeholder='[검색]으로 입력 (직접 입력 가능)'
              addonAfter={
                <Button
                  size='small'
                  type='text'
                  onClick={async () => {
                    const r = await openPostcode().catch(() => null);
                    if (r) {
                      manualForm.setFieldValue('address', r.address);
                      manualForm.getFieldInstance?.('address_detail')?.focus?.();
                    }
                  }}
                >
                  검색
                </Button>
              }
            />
          </Form.Item>
          <Form.Item
            name='address_detail'
            label='상세주소'
          >
            <Input placeholder='동·호수·층 등 (없으면 비워두세요)' />
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
        title={`${editing?.business_name ?? ''} — ${editing && !editing.user_id ? '정보 수정' : '할인율·메모'}`}
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
          {editing && !editing.user_id && (
            <>
              <Typography.Text
                type='secondary'
                style={{ display: 'block', marginBottom: 12 }}
              >
                수기 거래처는 계정이 없어 관리자가 정보를 직접 수정합니다.
              </Typography.Text>
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
                <Input />
              </Form.Item>
              <Form.Item
                name='email'
                label='이메일'
              >
                <Input type='email' />
              </Form.Item>
              <Form.Item
                name='invoice_email'
                label='세금계산서 수신 이메일'
              >
                <Input type='email' />
              </Form.Item>
              <Form.Item
                name='address'
                label='배송지 주소'
              >
                <Input
                  placeholder='주소 검색 후 상세주소를 이어서 입력'
                  addonAfter={
                    <Button
                      size='small'
                      type='text'
                      onClick={async () => {
                        const r = await openPostcode().catch(() => null);
                        if (r) form.setFieldValue('address', `${r.address} `);
                      }}
                    >
                      검색
                    </Button>
                  }
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            name='discount_rate'
            label='거래처 할인율(%) — 품목 단가 위에 곱해서 적용'
          >
            <InputNumber
              min={0}
              max={99}
              step={0.5}
              suffix='%'
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
          if (!reason.trim()) {
            message.warning('사유를 입력해 주세요. 거래처 화면에 표시됩니다.');
            return;
          }
          await setStatus(reasonFor.row, reasonFor.status, reason.trim());
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

      <Drawer
        title={detail ? detail.business_name : ''}
        open={detail != null}
        onClose={() => setDetailId(null)}
        width='min(520px, 100vw)'
      >
        {detail && (
          <Space
            direction='vertical'
            size={16}
            style={{ width: '100%' }}
          >
            <div>
              <Tag color={STATUS_META[detail.status].color}>
                {STATUS_META[detail.status].label}
              </Tag>
              {!detail.user_id && <Tag>수기</Tag>}
              {detail.nts_status && (
                <Tag
                  color={detail.nts_status === '계속사업자' ? 'green' : 'orange'}
                >
                  {detail.nts_status}
                </Tag>
              )}
            </div>

            <Descriptions
              size='small'
              column={1}
              bordered
              items={[
                {
                  key: 'no',
                  label: '사업자번호',
                  children: formatBizNo(detail.business_no),
                },
                { key: 'ceo', label: '대표자', children: detail.ceo_name || '—' },
                {
                  key: 'contact',
                  label: '담당자',
                  children: `${detail.contact_name || '—'} · ${detail.phone || '—'}`,
                },
                { key: 'email', label: '이메일', children: detail.email || '—' },
                {
                  key: 'invoice',
                  label: '세금계산서',
                  children: detail.invoice_email || detail.email || '—',
                },
                {
                  key: 'address',
                  label: '배송지',
                  children: detail.address || '—',
                },
                {
                  key: 'discount',
                  label: '할인율',
                  children: `${detail.discount_rate}%`,
                },
                {
                  key: 'created',
                  label: '가입일',
                  children: new Date(detail.created_at).toLocaleString('ko-KR'),
                },
                ...(detail.terms_agreed_at
                  ? [
                      {
                        key: 'terms',
                        label: '약관 동의',
                        children: new Date(
                          detail.terms_agreed_at,
                        ).toLocaleString('ko-KR'),
                      },
                    ]
                  : []),
                ...(detail.status_reason
                  ? [
                      {
                        key: 'reason',
                        label: '사유',
                        children: detail.status_reason,
                      },
                    ]
                  : []),
                ...(detail.memo
                  ? [{ key: 'memo', label: '메모', children: detail.memo }]
                  : []),
              ]}
            />

            <div>
              <Typography.Text strong>
                서류 (사업자등록증·영업신고증)
              </Typography.Text>
              <Space
                direction='vertical'
                size={6}
                style={{ width: '100%', marginTop: 8 }}
              >
                {detail.license_images.length === 0 && (
                  <Typography.Text type='secondary'>
                    제출된 서류가 없습니다 — 거래처에게 받아 아래에서 등록해
                    주세요.
                  </Typography.Text>
                )}
                {detail.license_images.map((path, i) => (
                  <Space key={path}>
                    <Button
                      size='small'
                      icon={<FileImageOutlined />}
                      onClick={() => openDoc(path)}
                    >
                      서류 {i + 1} 열기
                    </Button>
                    <Popconfirm
                      title={`서류 ${i + 1} 을 삭제할까요?`}
                      description='파일이 함께 삭제되며 복구할 수 없습니다.'
                      okText='삭제'
                      okButtonProps={{ danger: true }}
                      onConfirm={() => removeDoc(detail, path)}
                    >
                      <Button
                        size='small'
                        danger
                        type='text'
                        loading={docBusy}
                      >
                        삭제
                      </Button>
                    </Popconfirm>
                  </Space>
                ))}
                <Button
                  size='small'
                  loading={docBusy}
                  onClick={() => addDoc(detail)}
                >
                  + 서류 등록 (이미지)
                </Button>
              </Space>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            <Space
              size={8}
              wrap
            >

              <Button
                onClick={() => {
                  setEditing(detail);
                  form.setFieldsValue(
                    detail.user_id
                      ? { discount_rate: detail.discount_rate, memo: detail.memo }
                      : {
                          business_name: detail.business_name,
                          business_no: formatBizNo(detail.business_no),
                          ceo_name: detail.ceo_name,
                          contact_name: detail.contact_name,
                          phone: detail.phone,
                          email: detail.email,
                          invoice_email: detail.invoice_email,
                          address: detail.address,
                          discount_rate: detail.discount_rate,
                          memo: detail.memo,
                        },
                  );
                }}
              >
                {detail.user_id ? '할인율·메모 수정' : '정보 수정'}
              </Button>
              {detail.status === 'pending' && (
                <>
                  <Popconfirm
                    title={`${detail.business_name} 을(를) 승인할까요?`}
                    onConfirm={() => setStatus(detail, 'approved')}
                  >
                    <Button type='primary'>승인</Button>
                  </Popconfirm>
                  <Button
                    danger
                    onClick={() => {
                      setReason(detail.status_reason);
                      setReasonFor({ row: detail, status: 'rejected' });
                    }}
                  >
                    반려
                  </Button>
                </>
              )}
              {detail.status === 'approved' && (
                <Button
                  onClick={() => {
                    setReason(detail.status_reason);
                    setReasonFor({ row: detail, status: 'suspended' });
                  }}
                >
                  중지
                </Button>
              )}
              {(detail.status === 'suspended' ||
                detail.status === 'rejected') && (
                <Popconfirm
                  title={`${detail.business_name} 을(를) 승인 상태로 되돌릴까요?`}
                  onConfirm={() =>
                    setStatus(detail, 'approved', detail.status_reason)
                  }
                >
                  <Button>승인으로 복귀</Button>
                </Popconfirm>
              )}
            </Space>
          </Space>
        )}
      </Drawer>

    </>
  );
};

export default PartnerAdmin;
