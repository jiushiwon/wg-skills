'use client';

// 登录页（Client Component）

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import { showSuccess, showError } from '@/lib/utils/toast';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const login = useUserStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await login(values);
      showSuccess('登录成功');
      router.push('/');
    } catch {
      showError('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 32 }}>系统登录</h1>
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
