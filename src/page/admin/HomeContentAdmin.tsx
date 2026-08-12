import { useEffect, useState } from 'react';
import { App, Button, Card, Form, Input, Spin, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import {
  fetchHomeContent,
  upsertHomeContent,
  HOME_CONTENT_DEFAULTS,
} from '@/api/homeContent';
import type { HomeContent, HomeContentKey } from '@/api/homeContent';
import { uploadImage } from '@/api/admin';
import ImageUploadItem from '@/page/admin/ImageUploadItem';

const { Text } = Typography;

interface HomeContentAdminProps {
  onChanged: () => void;
}

/** 폼 값 — 텍스트는 string, 이미지는 string(URL) 또는 File(새 업로드) */
type FormValues = Record<HomeContentKey, string | File | undefined>;

const TEXT_FIELDS: { key: HomeContentKey; label: string; rows: number }[] = [
  { key: 'hero_tagline', label: '히어로 태그라인 (영문)', rows: 3 },
  { key: 'intro_heading', label: '소개 제목', rows: 2 },
  { key: 'intro_body', label: '소개 본문', rows: 4 },
  { key: 'feature_title', label: '피처 섹션 제목 (영문 대문자 표시)', rows: 3 },
  { key: 'feature_body', label: '피처 섹션 본문', rows: 3 },
];

const IMAGE_GROUPS: { title: string; keys: HomeContentKey[] }[] = [
  { title: '히어로 배경', keys: ['hero_bg'] },
  { title: '피처 섹션 사진', keys: ['feature_photo'] },
  {
    title: '포토 스트립 (소개 아래 6장)',
    keys: ['strip_1', 'strip_2', 'strip_3', 'strip_4', 'strip_5', 'strip_6'],
  },
  {
    title: '갤러리 (하단 다크 스트립 5장, 3번째는 CONTACT 링크)',
    keys: ['gallery_1', 'gallery_2', 'gallery_3', 'gallery_4', 'gallery_5'],
  },
];

/** 홈 화면 문구·이미지 편집 탭.
 *  저장 시 변경된 키만 home_content 테이블에 upsert 하고, 새로 선택한
 *  이미지는 Storage(wine-assets/home/)에 업로드한 뒤 URL을 저장한다. */
const HomeContentAdmin = ({ onChanged }: HomeContentAdminProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [initial, setInitial] = useState<HomeContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHomeContent()
      .then((content) => {
        setInitial(content);
        form.setFieldsValue(content);
      })
      .catch((e) => message.error(`불러오기 실패: ${(e as Error).message}`));
  }, [form, message]);

  const handleSave = async (values: FormValues) => {
    if (!initial) return;
    setSaving(true);
    try {
      const entries: Partial<Record<HomeContentKey, string>> = {};
      for (const key of Object.keys(HOME_CONTENT_DEFAULTS) as HomeContentKey[]) {
        const value = values[key];
        if (value instanceof File) {
          entries[key] = await uploadImage(value, 'home');
        } else if (
          typeof value === 'string' &&
          value.trim() &&
          value !== initial[key]
        ) {
          entries[key] = value;
        }
      }
      if (Object.keys(entries).length === 0) {
        message.info('변경된 내용이 없습니다.');
        return;
      }
      await upsertHomeContent(entries);
      const next = { ...initial, ...entries };
      setInitial(next);
      form.setFieldsValue(next);
      onChanged();
      message.success(
        '저장했습니다. "사이트 반영"을 눌러야 공개 사이트에 반영됩니다.',
      );
    } catch (e) {
      message.error(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!initial) {
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
    >
      <Card
        title='문구'
        style={{ marginBottom: 16 }}
      >
        <Text
          type='secondary'
          style={{ display: 'block', marginBottom: 16 }}
        >
          입력창의 줄바꿈이 화면의 줄바꿈으로 그대로 표시됩니다. (모바일에서는
          화면 폭에 맞춰 자동 조정)
        </Text>
        {TEXT_FIELDS.map(({ key, label, rows }) => (
          <Form.Item
            key={key}
            name={key}
            label={label}
            rules={[{ required: true, message: '문구를 입력하세요' }]}
          >
            <Input.TextArea rows={rows} />
          </Form.Item>
        ))}
      </Card>

      {IMAGE_GROUPS.map(({ title, keys }) => (
        <Card
          key={title}
          title={title}
          style={{ marginBottom: 16 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {keys.map((key, i) => (
              <Form.Item
                key={key}
                name={key}
                label={keys.length > 1 ? `${i + 1}번` : undefined}
                style={{ marginBottom: 0 }}
              >
                <ImageUploadItem />
              </Form.Item>
            ))}
          </div>
        </Card>
      ))}

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

export default HomeContentAdmin;
