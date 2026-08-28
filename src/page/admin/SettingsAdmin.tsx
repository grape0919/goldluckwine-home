import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Spin,
  Typography,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import {
  fetchOrderSettings,
  upsertOrderSettings,
  ORDER_SETTING_DEFAULTS,
} from '@/api/pricing';
import type { OrderSettingKey, OrderSettings } from '@/api/pricing';

interface FormValues {
  min_bottles: number;
  deposit_days: number;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  notice: string;
  admin_email: string;
  supplier_name: string;
  supplier_business_no: string;
  supplier_ceo: string;
  supplier_address: string;
  supplier_phone: string;
}

/** 발주 운영 설정 — DB 조회형이라 저장 즉시 반영('사이트 반영' 불필요) */
const SettingsAdmin = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  // 저장 시 변경분만 upsert 하기 위한 로드 시점 스냅샷 (저장 형태인 문자열 기준)
  const initialRef = useRef<OrderSettings | null>(null);

  const load = useCallback(async () => {
    setLoaded(false);
    setLoadError(null);
    try {
      const s = await fetchOrderSettings();
      initialRef.current = s;
      form.setFieldsValue({
        min_bottles: Number(s.min_bottles) || 6,
        deposit_days: Number(s.deposit_days) || 3,
        bank_name: s.bank_name,
        bank_account: s.bank_account,
        bank_holder: s.bank_holder,
        notice: s.notice,
        admin_email: s.admin_email,
        supplier_name: s.supplier_name,
        supplier_business_no: s.supplier_business_no,
        supplier_ceo: s.supplier_ceo,
        supplier_address: s.supplier_address,
        supplier_phone: s.supplier_phone,
      });
    } catch (e) {
      // 현재 값을 모르는 채 저장하면 설정 전체가 덮어써진다 — 폼을 열지 않는다
      setLoadError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }, [form]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (values: FormValues) => {
    const initial = initialRef.current;
    if (!initial) return; // 로드 실패 상태 — 폼이 없어 도달하지 않지만 방어
    setSaving(true);
    try {
      // 로드 시점과 달라진 키만 저장 — 안 건드린 설정을 덮어쓰지 않는다
      const entries: Partial<OrderSettings> = {};
      for (const key of Object.keys(
        ORDER_SETTING_DEFAULTS,
      ) as OrderSettingKey[]) {
        const raw = values[key as keyof FormValues];
        const next = raw == null ? '' : String(raw);
        if (next !== initial[key]) entries[key] = next;
      }
      if (Object.keys(entries).length === 0) {
        message.info('변경된 내용이 없습니다.');
        return;
      }
      await upsertOrderSettings(entries);
      initialRef.current = { ...initial, ...entries };
      setDirty(false);
      message.success('저장했습니다. 발주 화면에 즉시 반영됩니다.');
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin />
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert
        type='error'
        showIcon
        message='설정을 불러오지 못했습니다'
        description={`현재 값을 확인할 수 없어 편집을 열지 않습니다. 저장하면 기존 설정을 덮어쓸 수 있기 때문입니다. (${loadError})`}
        action={<Button onClick={load}>다시 시도</Button>}
        style={{ maxWidth: 640 }}
      />
    );
  }

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={handleSave}
      onValuesChange={() => setDirty(true)}
      style={{ maxWidth: 640 }}
    >
      <Card
        title='발주 조건'
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name='min_bottles'
          label='최소 발주 병수 (주문 합계 기준)'
          rules={[{ required: true, message: '병수를 입력하세요' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name='deposit_days'
          label='입금 기한 (발주일로부터 N일)'
          rules={[{ required: true, message: '일수를 입력하세요' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name='notice'
          label='발주 화면 공지 (비우면 숨김 — 배송 일정·휴무 안내 등)'
        >
          <Input.TextArea rows={2} />
        </Form.Item>
      </Card>

      <Card
        title='입금 계좌'
        style={{ marginBottom: 16 }}
      >
        <Typography.Text
          type='secondary'
          style={{ display: 'block', marginBottom: 16 }}
        >
          발주 완료 화면과 입금 안내에 표시됩니다.
        </Typography.Text>
        <Form.Item
          name='bank_name'
          label='은행'
        >
          <Input placeholder='OO은행' />
        </Form.Item>
        <Form.Item
          name='bank_account'
          label='계좌번호'
        >
          <Input placeholder='000-000000-000' />
        </Form.Item>
        <Form.Item
          name='bank_holder'
          label='예금주'
        >
          <Input placeholder='골드럭와인' />
        </Form.Item>
      </Card>

      <Card
        title='공급자 정보 (거래명세표 표기)'
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name='supplier_name'
          label='상호'
        >
          <Input placeholder='골드럭와인' />
        </Form.Item>
        <Form.Item
          name='supplier_business_no'
          label='사업자등록번호'
        >
          <Input placeholder='000-00-00000' />
        </Form.Item>
        <Form.Item
          name='supplier_ceo'
          label='대표자'
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='supplier_address'
          label='주소'
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='supplier_phone'
          label='연락처'
        >
          <Input placeholder='010-0000-0000' />
        </Form.Item>
      </Card>

      <Card
        title='알림'
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name='admin_email'
          label='관리자 알림 수신 이메일 (신규 가입·발주 알림)'
        >
          <Input type='email' />
        </Form.Item>
      </Card>

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '12px 0',
          background: '#f5f5f5',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Button
          type='primary'
          htmlType='submit'
          icon={<SaveOutlined />}
          loading={saving}
        >
          저장
        </Button>
        {dirty && (
          <Typography.Text type='warning'>
            저장되지 않은 변경사항이 있습니다
          </Typography.Text>
        )}
      </div>
    </Form>
  );
};

export default SettingsAdmin;
