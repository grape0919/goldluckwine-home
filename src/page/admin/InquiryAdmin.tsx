import { useCallback, useEffect, useState } from 'react';
import { App, Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '@/api/inquiries';
import type { InquiryRow } from '@/api/inquiries';

/** 문의 관리 — /contact 폼으로 들어온 문의 목록. 공개 사이트 빌드와 무관(DB 조회형). */
const InquiryAdmin = () => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      message.error(`상태 변경 실패: ${(e as Error).message}`);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteInquiry(id);
      setRows((rs) => rs.filter((r) => r.id !== id));
      message.success('삭제했습니다.');
    } catch (e) {
      message.error(`삭제 실패: ${(e as Error).message}`);
    }
  };

  const newCount = rows.filter((r) => r.status === 'new').length;

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
      title: '연락처',
      dataIndex: 'contact',
      width: 200,
      render: (v: string) => <Typography.Text copyable>{v}</Typography.Text>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 110,
      filters: [
        { text: '신규', value: 'new' },
        { text: '처리완료', value: 'done' },
      ],
      onFilter: (value, row) => row.status === value,
      render: (_: unknown, row) => (
        <Tag
          color={row.status === 'new' ? 'gold' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => toggleStatus(row)}
        >
          {row.status === 'new' ? '신규' : '처리완료'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, row) => (
        <Popconfirm
          title='이 문의를 삭제할까요?'
          onConfirm={() => remove(row.id)}
          okText='삭제'
          cancelText='취소'
        >
          <Button
            danger
            type='text'
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
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
      <Table
        rowKey='id'
        size='middle'
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 20 }}
        expandable={{
          expandedRowRender: (row) => (
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {row.message}
            </Typography.Paragraph>
          ),
        }}
      />
    </>
  );
};

export default InquiryAdmin;
