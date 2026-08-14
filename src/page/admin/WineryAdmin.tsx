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
  Switch,
  Table,
  Tooltip,
} from 'antd';
import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DragHandle, SortableRow } from '@/page/admin/SortableTableRow';
import type { WineryRow } from '@/lib/supabase';
import {
  countWinesByWinery,
  createWinery,
  deleteWinery,
  listWineries,
  removeImageIfOrphan,
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
  const [wineCounts, setWineCounts] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<WineryRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<WineryFormValues>();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [wineries, counts] = await Promise.all([
        listWineries(),
        countWinesByWinery(),
      ]);
      setRows(wineries);
      setWineCounts(counts);
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
          : values.image ?? '';
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
        // 이미지를 교체했으면 이전 업로드 파일이 고아가 됐는지 확인 후 정리
        if (editing.image_path && editing.image_path !== image_path) {
          void removeImageIfOrphan(editing.image_path).catch(() => undefined);
        }
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

  /** 노출 토글 — 실패 시 화면 상태를 되돌린다 */
  const toggleVisible = async (row: WineryRow, next: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, is_visible: next } : r)),
    );
    try {
      await updateWinery(row.id, { is_visible: next });
      onChanged?.();
    } catch (e) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, is_visible: row.is_visible } : r,
        ),
      );
      message.error(`노출 변경 실패: ${(e as Error).message}`);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          r.domaine.toLowerCase().includes(q) ||
          r.domaine_kr.includes(search.trim()) ||
          r.location.toLowerCase().includes(q),
      )
    : rows;
  // 검색 중에는 드래그 정렬 비활성 (부분 목록 기준 재번호를 막는다)
  const sortable = !q;

  const sensors = useSensors(useSensor(PointerSensor));

  /** 드래그 종료 — 전체 목록을 1부터 재번호 매겨 변경된 행만 저장 */
  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => r.id === active.id);
    const to = rows.findIndex((r) => r.id === over.id);
    if (from < 0 || to < 0) return;
    const prevById = new Map(rows.map((r) => [r.id, r.sort_order]));
    const renumbered = arrayMove(rows, from, to).map((r, i) => ({
      ...r,
      sort_order: i + 1,
    }));
    setRows(renumbered);
    try {
      await Promise.all(
        renumbered
          .filter((r) => prevById.get(r.id) !== r.sort_order)
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
        wrap
        style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}
      >
        <Input.Search
          allowClear
          placeholder='도멘 검색 (영문/한글/지역)'
          style={{ width: 240 }}
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          도멘 추가
        </Button>
      </Space>

      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={filtered.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table<WineryRow>
            rowKey='id'
            loading={loading}
            dataSource={filtered}
            pagination={false}
            components={sortable ? { body: { row: SortableRow } } : undefined}
            columns={[
              {
                title: '순서',
                width: 48,
                render: () => (sortable ? <DragHandle /> : null),
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
                title: '와인',
                width: 70,
                render: (_, row) => `${wineCounts[row.id] ?? 0}종`,
              },
              {
                title: '노출',
                width: 70,
                render: (_, row) => (
                  <Tooltip title='끄면 공개 사이트에서 이 도멘과 소속 와인이 모두 숨겨집니다'>
                    <Switch
                      size='small'
                      checked={row.is_visible !== false}
                      onChange={(next) => toggleVisible(row, next)}
                    />
                  </Tooltip>
                ),
              },
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
                      title='이 도멘을 삭제할까요?'
                      description={
                        (wineCounts[row.id] ?? 0) > 0
                          ? `소속 와인 ${wineCounts[row.id]}종이 함께 삭제됩니다. 삭제 대신 '노출'을 끄는 방법도 있습니다.`
                          : '소속 와인은 없습니다.'
                      }
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
        </SortableContext>
      </DndContext>

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
            label='정렬 순서 (표에서 드래그로도 조정 가능)'
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
