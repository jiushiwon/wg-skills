'use client';

// 全局布局组件（Client Component）

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import { useAppStore } from '@/stores/appStore';

const { Header, Sider, Content } = Layout;

interface Props {
  children: React.ReactNode;
}

export function AppLayout({ children }: Props): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { token, logout, user } = useUserStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { token: antToken } = theme.useToken();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

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
      router.push('/login');
    } else {
      router.push(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={toggleSidebar}
        style={{ background: antToken.colorBgContainer }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {sidebarCollapsed ? 'My' : '我的后台'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: antToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span>{user?.nickname || user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: antToken.colorBgContainer }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
