// 全局布局组件

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import styles from './AppLayout.module.css';

const { Header, Sider, Content } = Layout;

export function AppLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, user } = useUserStore();
  const { token: antToken } = theme.useToken();

  // 未登录跳转登录页
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '首页' },
    { key: '/users', icon: <UserOutlined />, label: '用户管理' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ];

  const userMenuItems = [
    { key: 'profile', label: '个人中心' },
    { key: 'settings', label: '设置' },
    { type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    handleMenuClick({ key });
  };

  return (
    <Layout className={styles.layout}>
      <Sider width={220} className={styles.sider}>
        <div className={styles.logo}>我的后台</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: antToken.colorBgContainer }}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} onClick={handleUserMenuClick}>
              <div className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span className={styles.username}>{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
