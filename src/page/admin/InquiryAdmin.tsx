import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '@/api/inquiries';
import type { InquiryRow } from '@/api/inquiries';

/** 문의 관리 — /contact 폼으로 들어온 문의 목록. 공개 사이트 빌드와 무관(DB 조회형).
 *  행 클릭 → 상세 Drawer (발주·거래처 탭과 동일 패턴). */
const InquiryAdmin = () => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listInquiries());
    } catch (e) {
      message.error(`문의 목록을 불러오지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (row: InquiryRow) => {
    const next = row.status === 'new' ? 'done' : 'new';
    try {
      await updateInquiryStatus(row.id, next);
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, status: next } : r)),
      );
      message.success(next === 'done' ? '처리완료로 표시했습니다.' : '신규로 되돌렸습니다.');
    } catch (e) {
      message.error(`상태 변경 실패: ${(e as Error).message}`);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteInquiry(id);
      setRows((rs) => rs.filter((r) => r.id !== id));
      setDetailId((d) => (d === id ? null : d));
      message.success('삭제했습니다.');
    } catch (e) {
      message.error(`삭제 실패: ${(e as Error).message}`);
    }
  };

  const newCount = rows.filter((r) => r.status === 'new').length;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q) ||
          r.contact.toLowerCase().includes(q) ||
          r.message.toLowerCase().includes(q),
      )
    : rows;

  const detail =
    detailId == null ? null : rows.find((r) => r.id === detailId) ?? null;

  const deleteConfirm = (row: InquiryRow) => ({
    title: `${row.name}${row.company ? ` (${row.company})` : ''} 님의 문의를 삭제할까요?`,
    description: '삭제하면 복구할 수 없습니다.',
    okText: '삭제',
    okButtonProps: { danger: true as const },
    cancelText: '취소',
  });

  const columns: ColumnsType<InquiryRow> = [
    {
      title: '접수일',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('ko-KR'),
    },
    { title: '이름', dataIndex: 'name', width: 110 },
    { title: '업장/회사', dataIndex: 'company', width: 150 },
    {
      title: '내용',
      dataIndex: 'message',
      ellipsis: true,
      render: (v: string) => v.replace(/\s+/g, ' '),
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      filters: [
        { text: '신규', value: 'new' },
        { text: '처리완료', value: 'done' },
      ],
      onFilter: (value, row) => row.status === value,
      render: (_: unknown, row) => (
        <Tag color={row.status === 'new' ? 'gold' : 'default'}>
          {row.status === 'new' ? '신규' : '처리완료'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: unknown, row) =>
        row.status === 'new' ? (
          <Button
            size='small'
            onClick={() => toggleStatus(row)}
          >
            완료 처리
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Space
        wrap
        style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}
      >
        <Input.Search
          allowClear
          placeholder='이름/회사/연락처/내용 검색'
          style={{ width: 260 }}
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Space size={8}>
          <Typography.Text>
            총 {rows.length}건 · 신규 <b>{newCount}</b>건
          </Typography.Text>
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
            if (el.closest('button, a')) return;
            setDetailId(r.id);
          },
        })}
      />

      <Drawer
        title={
          detail
            ? `${detail.name}${detail.company ? ` · ${detail.company}` : ''}`
            : ''
        }
        open={detail != null}
        onClose={() => setDetailId(null)}
        width={520}
      >
        {detail && (
          <Space
            direction='vertical'
            size={16}
            style={{ width: '100%' }}
          >
            <div>
              <Tag color={detail.status === 'new' ? 'gold' : 'default'}>
                {detail.status === 'new' ? '신규' : '처리완료'}
              </Tag>
            </div>
            <Descriptions
              size='small'
              column={1}
              bordered
              items={[
                {
                  key: 'created',
                  label: '접수일',
                  children: new Date(detail.created_at).toLocaleString('ko-KR'),
                },
                {
                  key: 'contact',
                  label: '연락처',
                  children: (
                    <Typography.Text copyable>{detail.contact}</Typography.Text>
                  ),
                },
              ]}
            />
            <Typography.Paragraph
              style={{ whiteSpace: 'pre-wrap', margin: 0 }}
            >
              {detail.message}
            </Typography.Paragraph>
            <Divider style={{ margin: '4px 0' }} />
            <Space size={8}>
              <Button
                type={detail.status === 'new' ? 'primary' : 'default'}
                onClick={() => toggleStatus(detail)}
              >
                {detail.status === 'new' ? '완료 처리' : '신규로 되돌리기'}
              </Button>
              <Popconfirm
                {...deleteConfirm(detail)}
                onConfirm={() => remove(detail.id)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                >
                  삭제
                </Button>
              </Popconfirm>
            </Space>
          </Space>
        )}
      </Drawer>
    </>
  );
};

export default InquiryAdmin;
