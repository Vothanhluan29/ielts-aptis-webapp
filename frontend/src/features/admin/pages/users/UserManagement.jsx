import React from 'react';
import {
  Table,
  Avatar,
  Tag,
  Button,
  Select,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Empty
} from 'antd';

import {
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';

import { useAdminUsers } from '../../hooks/users/useAdminUsers';
import { useUserFilter } from '../../hooks/users/useUserFilters';

import UserFilterBar from '../../components/users/UserFilterBar';

const { Title, Text } = Typography;
const { Option } = Select;

/* ================= COLOR MAP ================= */

const ROLE_COLOR = {
  admin: 'gold',
  student: 'blue'
};

const STATUS_COLOR = {
  active: '#52c41a',
  inactive: '#ff4d4f'
};

/* ================= COMPONENT ================= */

const UserManagement = () => {
  const {
    users: rawUsers,
    loading,
    handleUpdateUser,
    handleDeleteUser
  } = useAdminUsers();

  const filterLogic = useUserFilter(rawUsers);
  const { filteredUsers } = filterLogic;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div style={{ height: 300 }} className="flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  /* ================= TABLE ================= */
  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, user) => (
        <Space size="middle">
          <Avatar
            size={48}
            src={user.avatar_url}
            icon={!user.avatar_url && <UserOutlined />}
            style={{
              background: !user.avatar_url
                ? 'linear-gradient(135deg, #1677ff, #722ed1)'
                : undefined
            }}
          >
            {!user.avatar_url && user.full_name?.[0]}
          </Avatar>

          <div>
            <Text strong style={{ fontSize: 14 }}>
              {user.full_name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined /> {user.email}
            </Text>
          </div>
        </Space>
      )
    },

    {
      title: 'Role',
      key: 'role',
      render: (_, user) => (
        <Space>
          <Tag color={ROLE_COLOR[user.role]}>
            {user.role.toUpperCase()}
          </Tag>

          <Select
            value={user.role}
            size="small"
            onChange={(value) =>
              handleUpdateUser(user.id, { role: value })
            }
            style={{ width: 110 }}
          >
            <Option value="student">Student</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Space>
      )
    },

    {
      title: 'Status',
      key: 'status',
      render: (_, user) => (
        <Button
          type="text"
          style={{
            color: user.is_active
              ? STATUS_COLOR.active
              : STATUS_COLOR.inactive,
            fontWeight: 600
          }}
          icon={
            user.is_active ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          onClick={() =>
            handleUpdateUser(user.id, {
              is_active: !user.is_active
            })
          }
        >
          {user.is_active ? 'Active' : 'Suspended'}
        </Button>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, user) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteUser(user.id)}
          style={{
            borderRadius: 8
          }}
        />
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ================= HEADER ================= */}
      <div
        style={{
          padding: 20,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1677ff, #722ed1)',
          color: '#fff',
          marginBottom: 20
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          User Management
        </Title>

        <Text style={{ color: '#e6f4ff' }}>
          Manage student accounts, roles and status
        </Text>

        <div style={{ marginTop: 10 }}>
          <Tag color="cyan">
            {filteredUsers.length} / {rawUsers.length} Students


          </Tag>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 16
        }}
        bordered={false}
      >
        <UserFilterBar filterLogic={filterLogic} />
      </Card>

      {/* ================= TABLE ================= */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true
          }}
          rowClassName={() => 'hover-row'}
          locale={{
            emptyText: <Empty description="No users found" />
          }}
        />
      </Card>

    </div>
  );
};

export default UserManagement;