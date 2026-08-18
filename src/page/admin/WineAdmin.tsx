import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Tooltip,
  Typography,
} from 'antd';
import { CopyOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
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
import { WineTypes } from '@/enum/wine';
import { distinctVarieties } from '@/utils/variety';
import type { WineRow, WineryRow } from '@/lib/supabase';
import {
  createWine,
  deleteWine,
  listWineries,
  listWines,
  removeImageIfOrphan,
  updateWine,
  uploadImage,
} from '@/api/admin';
import ImageUploadItem from '@/page/admin/ImageUploadItem';
import {
  fetchWinePrices,
  upsertWinePrice,
  deleteWinePrice,
} from '@/api/pricing';
import type { WinePriceRow } from '@/api/pricing';

interface WineFormValues {
  winery_id: number;
  name_en: string;
  name_kr: string;
  wine_type: WineTypes;
  variety: string[];
  description: string;
  is_featured: boolean;
  is_visible: boolean;
  sold_out: boolean;
  sort_order: number;
  image: string | File | undefined;
  // 발주 (B2B) — 공급가를 비우면 발주 목록에 노출되지 않는다
  orderable: boolean;
  price?: number | null;
  sale_price?: number | null;
  // 상품 스펙 — 모두 선택 입력
  vintage?: string;
  volume_ml?: number | null;
  abv?: number | null;
  serving_temp?: string;
  food_pairing?: string;
}

const WINE_TYPE_OPTIONS = Object.values(WineTypes).map((t) => ({
  value: t,
  label: t,
}));

interface WineAdminProps {
  refreshKey?: number;
  /** 저장·삭제·순서변경 등 데이터가 바뀔 때 호출 (미반영 변경 추적용) */
  onChanged?: () => void;
}

const WineAdmin = ({ refreshKey, onChanged }: WineAdminProps) => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<WineRow[]>([]);
  const [wineries, setWineries] = useState<WineryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<WineRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prices, setPrices] = useState<Record<number, WinePriceRow>>({});
  const [form] = Form.useForm<WineFormValues>();

  // 테이블 필터 — 이름 검색 · 도멘 · 타입
  const [search, setSearch] = useState('');
  const [wineryFilter, setWineryFilter] = useState<number | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [wineRows, wineryRows, priceMap] = await Promise.all([
        listWines(),
        listWineries(),
        // wine_prices 미생성(마이그레이션 전)이어도 목록은 떠야 한다
        fetchWinePrices().catch(() => ({}) as Record<number, WinePriceRow>),
      ]);
      setRows(wineRows);
      setWineries(wineryRows);
      setPrices(priceMap);
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

  // 기존 와인들의 품종을 제안해 표기('Chenin Blanc' vs 'chenin blanc')가 갈라지지 않게 한다
  const varietyOptions = distinctVarieties(rows.map((r) => r.variety ?? []));

  const featuredCount = rows.filter((r) => r.is_featured).length;
  const hiddenCount = rows.filter((r) => r.is_visible === false).length;
  const soldOutCount = rows.filter((r) => r.sold_out === true).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q ||
          r.name_en.toLowerCase().includes(q) ||
          r.name_kr.toLowerCase().includes(q)) &&
        (wineryFilter === undefined || r.winery_id === wineryFilter) &&
        (typeFilter === undefined || r.wine_type === typeFilter),
    );
  }, [rows, search, wineryFilter, typeFilter]);
  const hasFilter =
    Boolean(search.trim()) ||
    wineryFilter !== undefined ||
    typeFilter !== undefined;

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      is_featured: false,
      is_visible: true,
      sold_out: false,
      sort_order: rows.length + 1,
      variety: [],
    });
    setModalOpen(true);
  };

  const openEdit = (row: WineRow) => {
    setEditing(row);
    form.setFieldsValue({
      ...row,
      // 마이그레이션 전(undefined)은 노출·판매 중 상태로 취급
      is_visible: row.is_visible !== false,
      sold_out: row.sold_out === true,
      orderable: row.orderable === true,
      price: prices[row.id]?.price ?? null,
      sale_price: prices[row.id]?.sale_price ?? null,
      image: row.image_path,
    });
    setModalOpen(true);
  };

  /** 기존 와인 정보를 복사해 '추가' 모달을 연다 — 같은 도멘의 비슷한 와인 빠른 등록용 */
  const openDuplicate = (row: WineRow) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      winery_id: row.winery_id,
      name_en: `${row.name_en} (copy)`,
      name_kr: row.name_kr,
      wine_type: row.wine_type,
      variety: row.variety ?? [],
      description: row.description,
      orderable: false,
      price: prices[row.id]?.price ?? null,
      sale_price: prices[row.id]?.sale_price ?? null,
      vintage: row.vintage,
      volume_ml: row.volume_ml,
      abv: row.abv,
      serving_temp: row.serving_temp,
      food_pairing: row.food_pairing,
      is_featured: false,
      is_visible: true,
      sold_out: false,
      sort_order: rows.length + 1,
      image: row.image_path,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const image_path =
        values.image instanceof File
          ? await uploadImage(values.image, 'wines')
          : values.image ?? '';
      const input = {
        winery_id: values.winery_id,
        name_en: values.name_en,
        name_kr: values.name_kr,
        wine_type: values.wine_type,
        variety: values.variety ?? [],
        description: values.description ?? '',
        is_featured: values.is_featured ?? false,
        is_visible: values.is_visible ?? true,
        sold_out: values.sold_out ?? false,
        orderable: values.orderable ?? false,
        sort_order: values.sort_order ?? 0,
        image_path,
        vintage: values.vintage ?? '',
        volume_ml: values.volume_ml ?? null,
        abv: values.abv ?? null,
        serving_temp: values.serving_temp ?? '',
        food_pairing: values.food_pairing ?? '',
      };
      let wineId: number;
      if (editing) {
        await updateWine(editing.id, input);
        wineId = editing.id;
        // 이미지를 교체했으면 이전 업로드 파일이 고아가 됐는지 확인 후 정리
        if (editing.image_path && editing.image_path !== image_path) {
          void removeImageIfOrphan(editing.image_path).catch(() => undefined);
        }
      } else {
        wineId = await createWine(input);
      }
      // 공급가 — 입력이 있으면 upsert, 비웠으면 가격 행 제거(발주 목록에서 빠진다)
      if (values.price != null) {
        await upsertWinePrice(wineId, values.price, values.sale_price ?? null);
      } else if (prices[wineId]) {
        await deleteWinePrice(wineId);
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

  const handleDelete = async (row: WineRow) => {
    try {
      await deleteWine(row.id);
      void removeImageIfOrphan(row.image_path).catch(() => undefined);
      message.success('삭제되었습니다.');
      await reload();
      onChanged?.();
    } catch (e) {
      message.error(`삭제 실패: ${(e as Error).message}`);
    }
  };

  /** 발주 노출 토글 — 발주 데이터는 DB 조회형이라 '사이트 반영'과 무관 */
  const toggleOrderable = async (row: WineRow, next: boolean) => {
    try {
      await updateWine(row.id, { orderable: next });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, orderable: next } : r)),
      );
      if (next && !prices[row.id]) {
        message.warning(
          '공급가가 없어 발주 목록에 표시되지 않습니다. 수정에서 공급가를 입력하세요.',
        );
      }
    } catch (e) {
      message.error(`발주 설정 실패: ${(e as Error).message}`);
    }
  };

  const toggleFeatured = async (row: WineRow, next: boolean) => {
    try {
      await updateWine(row.id, { is_featured: next });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, is_featured: next } : r)),
      );
      onChanged?.();
    } catch (e) {
      message.error(`변경 실패: ${(e as Error).message}`);
    }
  };

  const toggleVisible = async (row: WineRow, next: boolean) => {
    try {
      await updateWine(row.id, { is_visible: next });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, is_visible: next } : r)),
      );
      onChanged?.();
    } catch (e) {
      message.error(`변경 실패: ${(e as Error).message}`);
    }
  };

  const toggleSoldOut = async (row: WineRow, next: boolean) => {
    try {
      await updateWine(row.id, { sold_out: next });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, sold_out: next } : r)),
      );
      onChanged?.();
    } catch (e) {
      message.error(`변경 실패: ${(e as Error).message}`);
    }
  };

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
          .map((r) => updateWine(r.id, { sort_order: r.sort_order })),
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
        style={{ marginBottom: 16, width: '100%' }}
      >
        <Input.Search
          allowClear
          placeholder='이름 검색 (영문/한글)'
          style={{ width: 220 }}
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          allowClear
          placeholder='도멘 전체'
          style={{ width: 180 }}
          value={wineryFilter}
          onChange={setWineryFilter}
          options={wineries.map((w) => ({ value: w.id, label: w.domaine }))}
        />
        <Select
          allowClear
          placeholder='타입 전체'
          style={{ width: 130 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={WINE_TYPE_OPTIONS}
        />
        <Typography.Text type='secondary'>
          {hasFilter ? `${filtered.length} / ` : ''}
          {rows.length}종 · 홈 노출 {featuredCount}개
          {featuredCount > 3 ? ' (홈에는 앞 3개만 표시)' : ''}
          {hiddenCount > 0 ? ` · 숨김 ${hiddenCount}개` : ''}
          {soldOutCount > 0 ? ` · 솔드아웃 ${soldOutCount}개` : ''}
        </Typography.Text>
        <div style={{ flex: 1 }} />
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          와인 추가
        </Button>
      </Space>

      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={hasFilter ? undefined : onDragEnd}
      >
        <SortableContext
          items={filtered.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table<WineRow>
            rowKey='id'
            loading={loading}
            dataSource={filtered}
            pagination={{ pageSize: 20 }}
            components={{ body: { row: SortableRow } }}
            columns={[
              {
                title: '순서',
                width: 48,
                render: () => (
                  <Tooltip
                    title={hasFilter ? '필터 중에는 이동할 수 없습니다' : ''}
                  >
                    <span>
                      <DragHandle disabled={hasFilter} />
                    </span>
                  </Tooltip>
                ),
              },
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
                title: '노출',
                dataIndex: 'is_visible',
                width: 80,
                render: (v: boolean | undefined, row) => (
                  <Tooltip title='끄면 공개 사이트(리스트·상세·검색)에서 숨겨집니다'>
                    <Switch
                      size='small'
                      checked={v !== false}
                      onChange={(next) => toggleVisible(row, next)}
                    />
                  </Tooltip>
                ),
              },
              {
                title: '솔드아웃',
                dataIndex: 'sold_out',
                width: 80,
                render: (v: boolean | undefined, row) => (
                  <Tooltip title='켜면 공개 사이트에 SOLD OUT으로 표시됩니다 (페이지에서 숨겨지지는 않습니다)'>
                    <Switch
                      size='small'
                      checked={v === true}
                      onChange={(next) => toggleSoldOut(row, next)}
                    />
                  </Tooltip>
                ),
              },
              {
                title: '발주',
                dataIndex: 'orderable',
                width: 96,
                render: (_: unknown, row: WineRow) => (
                  <Space
                    direction='vertical'
                    size={0}
                    align='center'
                  >
                    <Switch
                      size='small'
                      checked={row.orderable === true}
                      onChange={(next) => toggleOrderable(row, next)}
                    />
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {prices[row.id]
                        ? `${(
                            prices[row.id].sale_price ?? prices[row.id].price
                          ).toLocaleString()}원`
                        : '가격 없음'}
                    </span>
                  </Space>
                ),
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
              {
                title: '',
                width: 190,
                render: (_, row) => (
                  <Space size={4}>
                    <Tooltip title='공개 페이지 보기'>
                      <Button
                        size='small'
                        type='text'
                        icon={<ExportOutlined />}
                        href={`/wines/${row.id}`}
                        target='_blank'
                      />
                    </Tooltip>
                    <Tooltip title='복제해서 추가'>
                      <Button
                        size='small'
                        type='text'
                        icon={<CopyOutlined />}
                        onClick={() => openDuplicate(row)}
                      />
                    </Tooltip>
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
        </SortableContext>
      </DndContext>

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
            label='품종 (기존 품종 선택 또는 새로 입력 후 Enter)'
          >
            <Select
              mode='tags'
              placeholder='Chenin Blanc'
              options={varietyOptions.map((v) => ({ value: v, label: v }))}
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item
            name='description'
            label='설명'
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Space
            wrap
            size='middle'
          >
            <Form.Item
              name='vintage'
              label='빈티지'
            >
              <Input
                placeholder='2023 / NV'
                style={{ width: 110 }}
              />
            </Form.Item>
            <Form.Item
              name='volume_ml'
              label='용량(ml)'
            >
              <InputNumber
                min={0}
                placeholder='750'
                style={{ width: 110 }}
              />
            </Form.Item>
            <Form.Item
              name='abv'
              label='도수(%)'
            >
              <InputNumber
                min={0}
                max={99}
                step={0.1}
                placeholder='12.5'
                style={{ width: 110 }}
              />
            </Form.Item>
            <Form.Item
              name='serving_temp'
              label='서빙 온도'
            >
              <Input
                placeholder='10~12°C'
                style={{ width: 140 }}
              />
            </Form.Item>
          </Space>
          <Form.Item
            name='food_pairing'
            label='푸드 페어링'
          >
            <Input.TextArea
              rows={2}
              placeholder='해산물, 흰살 생선 요리, 프레시 치즈'
            />
          </Form.Item>
          <Space
            wrap
            size='middle'
          >
            <Form.Item
              name='price'
              label='공급가(원, 부가세 별도) — 비우면 발주 목록 제외'
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: 140 }}
                placeholder='28000'
              />
            </Form.Item>
            <Form.Item
              name='sale_price'
              label='할인가(원) — 선택'
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: 140 }}
                placeholder='25000'
              />
            </Form.Item>
            <Form.Item
              name='orderable'
              label='발주 가능 (거래처 발주 목록 노출)'
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Space>
          <Form.Item
            name='is_visible'
            label='공개 사이트 노출 (끄면 리스트·상세에서 숨김)'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name='sold_out'
            label='솔드아웃 표시 (공개 사이트에 SOLD OUT 배지가 붙습니다)'
            valuePropName='checked'
          >
            <Switch />
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
            label='정렬 순서 (표에서 드래그로도 조정 가능)'
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name='image'
            label='병 사진 (업로드 시 자동으로 리사이즈·WebP 변환)'
          >
            <ImageUploadItem />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WineAdmin;
