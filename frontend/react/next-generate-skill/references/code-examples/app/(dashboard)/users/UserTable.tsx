'use client';

// 用户表格（Client Component —— 交互逻辑）

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { post, put, del } from '@/lib/api/client';
import type { User, ApiListResponse } from '@/types';

interface Props {
  initialData: User[];
  initialTotal: number;
}

export function UserTable({ initialData, initialTotal }: Props) {
  const router = useRouter();
  const [data, setData] = useState<User[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const loadData = async (p: number, ps: number) => {
    setLoading(true);
    try {
      const res = await post<ApiListResponse<User>>('/users', {
        page: p,
        pageSize: ps,
      });
      setData(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        message.error((err as { message: string }).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
    loadData(p, ps);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        try {
          await del(`/users/${id}`);
          message.success('删除成功');
          loadData(page, pageSize);
        } catch (err: unknown) {
          if (err && typeof err === 'object' && 'message' in err) {
            message.error((err as { message: string }).message);
          }
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await put(`/users/${editingUser.id}`, values);
        message.success('更新成功');
      } else {
        await post('/users', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(page, pageSize);
    } catch {
      // 表单验证失败
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => loadData(page, pageSize)}>
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: handlePageChange,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="guest">访客</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
