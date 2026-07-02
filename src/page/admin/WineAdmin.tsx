import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { WineTypes } from '@/enum/wine';
import type { WineRow, WineryRow } from '@/lib/supabase';
import {
  createWine,
  deleteWine,
  listWineries,
  listWines,
  updateWine,
  uploadImage,
} from '@/api/admin';
import ImageUploadItem from '@/page/admin/ImageUploadItem';

interface WineFormValues {
  winery_id: number;
  name_en: string;
  name_kr: string;
  wine_type: WineTypes;
  variety: string[];
  description: string;
  is_featured: boolean;
  sort_order: number;
  image: string | File | undefined;
}

const WINE_TYPE_OPTIONS = Object.values(WineTypes).map((t) => ({
  value: t,
  label: t,
}));

const WineAdmin = ({ refreshKey }: { refreshKey?: number }) => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<WineRow[]>([]);
  const [wineries, setWineries] = useState<WineryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<WineRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<WineFormValues>();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [wineRows, wineryRows] = await Promise.all([
        listWines(),
        listWineries(),
      ]);
      setRows(wineRows);
      setWineries(wineryRows);
    } catch (e) {
      message.error(`와인 목록을 불러오지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const wineryName = (id: number) =>
    wineries.find((w) => w.id === id)?.domaine ?? `#${id}`;

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      is_featured: false,
      sort_order: rows.length + 1,
      variety: [],
    });
    setModalOpen(true);
  };

  const openEdit = (row: WineRow) => {
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
          ? await uploadImage(values.image, 'wines')
          : (values.image ?? '');
      const input = {
        winery_id: values.winery_id,
        name_en: values.name_en,
        name_kr: values.name_kr,
        wine_type: values.wine_type,
        variety: values.variety ?? [],
        description: values.description ?? '',
        is_featured: values.is_featured ?? false,
        sort_order: values.sort_order ?? 0,
        image_path,
      };
      if (editing) {
        await updateWine(editing.id, input);
      } else {
        await createWine(input);
      }
      message.success('저장되었습니다.');
      setModalOpen(false);
      await reload();
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: WineRow) => {
    try {
      await deleteWine(row.id);
      message.success('삭제되었습니다.');
      await reload();
    } catch (e) {
      message.error(`삭제 실패: ${(e as Error).message}`);
    }
  };

  const toggleFeatured = async (row: WineRow, next: boolean) => {
    try {
      await updateWine(row.id, { is_featured: next });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, is_featured: next } : r)),
      );
    } catch (e) {
      message.error(`변경 실패: ${(e as Error).message}`);
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
          와인 추가
        </Button>
      </Space>

      <Table<WineRow>
        rowKey='id'
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 20 }}
        columns={[
          {
            title: '이미지',
            dataIndex: 'image_path',
            width: 80,
            render: (v: string) =>
              v ? (
                <img
                  src={v}
                  alt=''
                  style={{ width: 40, height: 64, objectFit: 'contain' }}
                />
              ) : null,
          },
          { title: '이름 (영문)', dataIndex: 'name_en' },
          { title: '이름 (한글)', dataIndex: 'name_kr' },
          {
            title: '도멘',
            dataIndex: 'winery_id',
            render: (id: number) => wineryName(id),
          },
          {
            title: '타입',
            dataIndex: 'wine_type',
            width: 100,
            render: (t: string) => <Tag>{t}</Tag>,
          },
          {
            title: '홈 노출',
            dataIndex: 'is_featured',
            width: 90,
            render: (v: boolean, row) => (
              <Switch
                size='small'
                checked={v}
                onChange={(next) => toggleFeatured(row, next)}
              />
            ),
          },
          { title: '정렬', dataIndex: 'sort_order', width: 70 },
          {
            title: '',
            width: 140,
            render: (_, row) => (
              <Space>
                <Button
                  size='small'
                  onClick={() => openEdit(row)}
                >
                  수정
                </Button>
                <Popconfirm
                  title='이 와인을 삭제할까요?'
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
        title={editing ? '와인 수정' : '와인 추가'}
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
            name='winery_id'
            label='도멘'
            rules={[{ required: true, message: '도멘을 선택하세요' }]}
          >
            <Select
              options={wineries.map((w) => ({
                value: w.id,
                label: `${w.domaine} (${w.domaine_kr})`,
              }))}
              placeholder='도멘 선택'
              showSearch
              optionFilterProp='label'
            />
          </Form.Item>
          <Form.Item
            name='name_en'
            label='와인 이름 (영문)'
            rules={[{ required: true, message: '영문 이름을 입력하세요' }]}
          >
            <Input placeholder='Mille Sabords' />
          </Form.Item>
          <Form.Item
            name='name_kr'
            label='와인 이름 (한글)'
            rules={[{ required: true, message: '한글 이름을 입력하세요' }]}
          >
            <Input placeholder='밀사보흐' />
          </Form.Item>
          <Form.Item
            name='wine_type'
            label='타입'
            rules={[{ required: true, message: '타입을 선택하세요' }]}
          >
            <Select options={WINE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name='variety'
            label='품종 (입력 후 Enter)'
          >
            <Select
              mode='tags'
              placeholder='Chenin Blanc'
              open={false}
            />
          </Form.Item>
          <Form.Item
            name='description'
            label='설명'
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name='is_featured'
            label='홈 OUR COLLECTION 노출'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name='sort_order'
            label='정렬 순서'
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name='image'
            label='병 사진'
          >
            <ImageUploadItem />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WineAdmin;
