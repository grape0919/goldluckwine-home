import { useEffect, useState } from 'react';
import {
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrderSettings()
      .then((s) => {
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
        setLoaded(true);
      })
      .catch((e) => {
        message.error(
          `설정을 불러오지 못했습니다 (마이그레이션 전이면 정상): ${(e as Error).message}`,
        );
        // 실패해도 폼은 열어준다 — 스피너로 굳지 않게
        setLoaded(true);
      });
  }, [form, message]);

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    try {
      const entries: Partial<OrderSettings> = {};
      for (const key of Object.keys(
        ORDER_SETTING_DEFAULTS,
      ) as OrderSettingKey[]) {
        const raw = values[key as keyof FormValues];
        entries[key] = raw == null ? '' : String(raw);
      }
      await upsertOrderSettings(entries);
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

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={handleSave}
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
          label='관리자 알림 수신 이메일 (신규 가입·발주 — Phase 3에서 사용)'
        >
          <Input type='email' />
        </Form.Item>
      </Card>

      <Button
        type='primary'
        htmlType='submit'
        icon={<SaveOutlined />}
        loading={saving}
      >
        저장
      </Button>
    </Form>
  );
};

export default SettingsAdmin;
