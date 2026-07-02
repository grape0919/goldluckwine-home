import { useEffect, useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Tabs, Typography } from 'antd';
import type { Session } from '@supabase/supabase-js';
import styled from 'styled-components';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import WineAdmin from '@/page/admin/WineAdmin';
import WineryAdmin from '@/page/admin/WineryAdmin';

const { Title } = Typography;

const AdminPage = () => {
  const { message } = App.useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [wineRefreshKey, setWineRefreshKey] = useState(0);

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
      <div className='admin-header'>
        <Title
          level={3}
          style={{ margin: 0 }}
        >
          골드럭와인 관리자
        </Title>
        <Button onClick={() => supabase.auth.signOut()}>로그아웃</Button>
      </div>

      <Tabs
        defaultActiveKey='wines'
        items={[
          {
            key: 'wines',
            label: '와인 관리',
            children: <WineAdmin refreshKey={wineRefreshKey} />,
          },
          {
            key: 'wineries',
            label: '도멘(와이너리) 관리',
            children: (
              <WineryAdmin
                onChanged={() => setWineRefreshKey((k) => k + 1)}
              />
            ),
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
