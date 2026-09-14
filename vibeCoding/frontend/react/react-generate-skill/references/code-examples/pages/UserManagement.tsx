// 用户管理页面 - 列表/分页/CRUD 参考

import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { User, UserListParams, UserRole, UserStatus } from '@/types/user';
import { userApi } from '@/api/modules/user';
import styles from './UserManagement.module.css';

export function UserManagement(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    pageSize: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await userApi.list(params);
      setData(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        message.error((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params]);

  // 分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setParams({ ...params, page, pageSize });
  };

  // 新增
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        try {
          await userApi.delete(id);
          message.success('删除成功');
          loadData();
        } catch (err: unknown) {
          if (err && typeof err === 'object' && 'message' in err) {
            message.error((err as Error).message);
          }
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userApi.update(editingUser.id, values);
        message.success('更新成功');
      } else {
        await userApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (err) {
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
            onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
        <Button icon={<ReloadOutlined />} onClick={loadData}>
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total,
          onChange: handlePageChange,
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
