import { useEffect, useState } from 'react';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import type { Session } from '@supabase/supabase-js';
import styled from 'styled-components';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  deployHookUrl,
  triggerDeploy,
  recordContentChanged,
  recordDeployTriggered,
  fetchPendingChanges,
  fetchLastDeployTriggeredAt,
} from '@/api/admin';
import WineAdmin from '@/page/admin/WineAdmin';
import WineryAdmin from '@/page/admin/WineryAdmin';
import HomeContentAdmin from '@/page/admin/HomeContentAdmin';
import BackLabelAdmin from '@/page/admin/backlabel/BackLabelAdmin';
import InquiryAdmin from '@/page/admin/InquiryAdmin';
import Seo from '@/components/Seo';

const { Title } = Typography;

const AdminPage = () => {
  const { message } = App.useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [wineRefreshKey, setWineRefreshKey] = useState(0);
  // 사이트는 SSG(빌드 시점 프리렌더)라 저장 내용이 재배포 전까지 공개
  // 페이지에 반영되지 않는다 — 상태는 site_meta(DB)에 기록해 새로고침·편집자 간에도 유지
  const [pendingChanges, setPendingChanges] = useState(false);
  const [lastDeployAt, setLastDeployAt] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);

  // 저장·삭제 시 호출 — 화면 즉시 반영 + DB 기록 (기록 실패는 치명적이지 않음)
  const markChanged = () => {
    setPendingChanges(true);
    recordContentChanged().catch(() => undefined);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await triggerDeploy();
      await recordDeployTriggered().catch(() => undefined);
      setPendingChanges(false);
      setLastDeployAt(new Date().toISOString());
      message.success(
        '재배포 요청을 보냈습니다. 2~3분 뒤 공개 사이트를 확인하세요. 반영되지 않으면 Vercel 대시보드에서 배포 상태를 확인해 주세요.',
        6,
      );
    } catch (e) {
      message.error(`재배포 요청 실패: ${(e as Error).message}`);
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 로그인 후 DB 기준으로 미반영 상태·마지막 배포 시각 복원
  useEffect(() => {
    if (!session) return;
    fetchPendingChanges()
      .then(setPendingChanges)
      .catch(() => undefined);
    fetchLastDeployTriggeredAt()
      .then(setLastDeployAt)
      .catch(() => undefined);
  }, [session]);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setLoggingIn(false);
    if (error) {
      message.error(`로그인 실패: ${error.message}`);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <Wrapper>
        <Seo
          title='관리자'
          noindex
        />
        <Alert
          type='warning'
          showIcon
          message='Supabase가 설정되지 않았습니다'
          description={
            <>
              프로젝트 루트에 <code>.env</code> 파일을 만들고{' '}
              <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>
              를 설정하세요. (<code>.env.example</code> 참고) 이후{' '}
              <code>supabase/schema.sql</code> → <code>supabase/seed.sql</code>{' '}
              순서로 SQL Editor에서 실행하고, Authentication에서 관리자 계정을
              생성하면 이 페이지를 사용할 수 있습니다.
            </>
          }
        />
      </Wrapper>
    );
  }

  if (checking) return null;

  if (!session) {
    return (
      <Wrapper>
        <Seo
          title='관리자'
          noindex
        />
        <Card className='login-card'>
          <Title
            level={4}
            style={{ marginTop: 0 }}
          >
            골드럭와인 관리자
          </Title>
          <Form
            layout='vertical'
            onFinish={handleLogin}
          >
            <Form.Item
              name='email'
              label='이메일'
              rules={[{ required: true, type: 'email' }]}
            >
              <Input autoComplete='username' />
            </Form.Item>
            <Form.Item
              name='password'
              label='비밀번호'
              rules={[{ required: true }]}
            >
              <Input.Password autoComplete='current-password' />
            </Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={loggingIn}
              block
            >
              로그인
            </Button>
          </Form>
        </Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Seo
        title='관리자'
        noindex
      />
      <div className='admin-header'>
        <Title
          level={3}
          style={{ margin: 0 }}
        >
          골드럭와인 관리자
        </Title>
        <Space>
          {lastDeployAt && (
            <Typography.Text
              type='secondary'
              style={{ fontSize: 12 }}
            >
              마지막 반영 요청 {new Date(lastDeployAt).toLocaleString('ko-KR')}
            </Typography.Text>
          )}
          {deployHookUrl ? (
            <Popconfirm
              title='공개 사이트에 반영할까요?'
              description='재배포가 시작되며 2~3분 뒤 반영됩니다.'
              onConfirm={handleDeploy}
              okText='반영'
              cancelText='취소'
            >
              <Badge dot={pendingChanges}>
                <Button
                  type='primary'
                  icon={<CloudUploadOutlined />}
                  loading={deploying}
                >
                  사이트 반영
                </Button>
              </Badge>
            </Popconfirm>
          ) : (
            <Tooltip title='Vercel Deploy Hook URL을 VITE_DEPLOY_HOOK_URL 환경변수로 설정하면 여기서 바로 재배포할 수 있습니다. (Vercel → Settings → Git → Deploy Hooks)'>
              <Button
                icon={<CloudUploadOutlined />}
                disabled
              >
                사이트 반영
              </Button>
            </Tooltip>
          )}
          <Button onClick={() => supabase.auth.signOut()}>로그아웃</Button>
        </Space>
      </div>

      {pendingChanges && (
        <Alert
          type='info'
          showIcon
          style={{ marginBottom: 16 }}
          message='저장된 변경사항이 아직 공개 사이트에 반영되지 않았습니다.'
          description='이 사이트는 빌드 시점에 페이지를 미리 생성(SSG)합니다. 편집을 마친 뒤 우측 상단 "사이트 반영" 버튼을 눌러주세요.'
        />
      )}

      <Tabs
        defaultActiveKey='wines'
        items={[
          {
            key: 'wines',
            label: '와인 관리',
            children: (
              <WineAdmin
                refreshKey={wineRefreshKey}
                onChanged={markChanged}
              />
            ),
          },
          {
            key: 'wineries',
            label: '도멘(와이너리) 관리',
            children: (
              <WineryAdmin
                onChanged={() => {
                  setWineRefreshKey((k) => k + 1);
                  markChanged();
                }}
              />
            ),
          },
          {
            key: 'home',
            label: '홈 콘텐츠',
            children: (
              <HomeContentAdmin onChanged={markChanged} />
            ),
          },
          {
            key: 'inquiries',
            // 문의는 공개 사이트가 DB 를 직접 조회하지 않으므로 '사이트 반영'과 무관
            label: '문의',
            children: <InquiryAdmin />,
          },
          {
            key: 'backlabels',
            // 백라벨은 공개 사이트에 노출되지 않으므로 '사이트 반영'과 무관
            label: '백라벨',
            children: <BackLabelAdmin />,
          },
        ]}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: 48px 24px 96px;
  min-height: 100vh;

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .login-card {
    max-width: 380px;
    margin: 15vh auto 0;
  }
`;

export default AdminPage;
