import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ExportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { WineryRow } from '@/lib/supabase';
import {
  createWinery,
  deleteWinery,
  listWineries,
  updateWinery,
  uploadImage,
} from '@/api/admin';
import ImageUploadItem from '@/page/admin/ImageUploadItem';

interface WineryFormValues {
  domaine: string;
  domaine_kr: string;
  location: string;
  description: string;
  sort_order: number;
  image: string | File | undefined;
}

const WineryAdmin = ({ onChanged }: { onChanged?: () => void }) => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<WineryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<WineryRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<WineryFormValues>();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listWineries());
    } catch (e) {
      message.error(`도멘 목록을 불러오지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sort_order: rows.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (row: WineryRow) => {
    setEditing(row);
    form.setFieldsValue({ ...row, image: row.image_path });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const image_path =
        values.image instanceof File
          ? await uploadImage(values.image, 'wineries')
          : (values.image ?? '');
      const input = {
        domaine: values.domaine,
        domaine_kr: values.domaine_kr,
        location: values.location,
        description: values.description ?? '',
        sort_order: values.sort_order ?? 0,
        image_path,
      };
      if (editing) {
        await updateWinery(editing.id, input);
      } else {
        await createWinery(input);
      }
      message.success('저장되었습니다.');
      setModalOpen(false);
      await reload();
      onChanged?.();
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: WineryRow) => {
    try {
      await deleteWinery(row.id);
      message.success('삭제되었습니다.');
      await reload();
      onChanged?.();
    } catch (e) {
      message.error(`삭제 실패: ${(e as Error).message}`);
    }
  };

  /** 표시 순서 한 칸 이동 — 전체 목록을 1부터 재번호 매겨 변경된 행만 저장 */
  const moveRow = async (row: WineryRow, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    const renumbered = next.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setRows(renumbered);
    try {
      await Promise.all(
        renumbered
          .filter((r, i) => next[i].sort_order !== r.sort_order)
          .map((r) => updateWinery(r.id, { sort_order: r.sort_order })),
      );
      onChanged?.();
    } catch (e) {
      message.error(`순서 변경 실패: ${(e as Error).message}`);
      await reload();
    }
  };

  return (
    <>
      <Space
        style={{ marginBottom: 16, justifyContent: 'flex-end', width: '100%' }}
      >
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          도멘 추가
        </Button>
      </Space>

      <Table<WineryRow>
        rowKey='id'
        loading={loading}
        dataSource={rows}
        pagination={false}
        columns={[
          {
            title: '순서',
            width: 80,
            render: (_, row) => {
              const idx = rows.findIndex((r) => r.id === row.id);
              return (
                <Space size={2}>
                  <Button
                    size='small'
                    type='text'
                    icon={<ArrowUpOutlined />}
                    disabled={idx <= 0}
                    onClick={() => moveRow(row, -1)}
                  />
                  <Button
                    size='small'
                    type='text'
                    icon={<ArrowDownOutlined />}
                    disabled={idx >= rows.length - 1}
                    onClick={() => moveRow(row, 1)}
                  />
                </Space>
              );
            },
          },
          {
            title: '이미지',
            dataIndex: 'image_path',
            width: 90,
            render: (v: string) =>
              v ? (
                <img
                  src={v}
                  alt=''
                  style={{ width: 56, height: 56, objectFit: 'cover' }}
                />
              ) : null,
          },
          { title: 'Domaine', dataIndex: 'domaine' },
          { title: '도멘(한글)', dataIndex: 'domaine_kr' },
          { title: '지역', dataIndex: 'location' },
          {
            title: '',
            width: 170,
            render: (_, row) => (
              <Space size={4}>
                <Tooltip title='공개 페이지 보기'>
                  <Button
                    size='small'
                    type='text'
                    icon={<ExportOutlined />}
                    href={`/wineries/${row.id}`}
                    target='_blank'
                  />
                </Tooltip>
                <Button
                  size='small'
                  onClick={() => openEdit(row)}
                >
                  수정
                </Button>
                <Popconfirm
                  title='이 도멘을 삭제할까요? 소속 와인도 함께 삭제됩니다.'
                  onConfirm={() => handleDelete(row)}
                >
                  <Button
                    size='small'
                    danger
                  >
                    삭제
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? '도멘 수정' : '도멘 추가'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText='저장'
        cancelText='취소'
        destroyOnClose
      >
        <Form
          form={form}
          layout='vertical'
        >
          <Form.Item
            name='domaine'
            label='Domaine (영문)'
            rules={[{ required: true, message: '영문 이름을 입력하세요' }]}
          >
            <Input placeholder='Damien Bureau' />
          </Form.Item>
          <Form.Item
            name='domaine_kr'
            label='도멘 (한글)'
            rules={[{ required: true, message: '한글 이름을 입력하세요' }]}
          >
            <Input placeholder='다미앙 뷔로' />
          </Form.Item>
          <Form.Item
            name='location'
            label='지역'
          >
            <Input placeholder='Loire, France' />
          </Form.Item>
          <Form.Item
            name='description'
            label='소개'
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name='sort_order'
            label='정렬 순서 (표에서 화살표로도 조정 가능)'
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name='image'
            label='대표 이미지 (업로드 시 자동으로 리사이즈·WebP 변환)'
          >
            <ImageUploadItem />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WineryAdmin;
