// 登录页

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import styles from './Login.module.css';

export function Login(): React.JSX.Element {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values);
      message.success('登录成功');
      navigate('/');
    } catch (err) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>系统登录</h1>
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}>
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
              block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
