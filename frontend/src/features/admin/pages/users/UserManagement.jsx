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

import UserFilterBar from '../../components/users_management/UserFilterBar';

const { Title, Text } = Typography;
const { Option } = Select;

/* ================= COLOR MAP ================= */

const ROLE_COLOR = {
  admin: 'purple',
  student: 'blue'
};

const STATUS_COLOR = {
  active: '#10b981', // emerald-500
  inactive: '#ef4444' // red-500
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" tip="Loading users..." className="text-indigo-600" />
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
            className={!user.avatar_url ? "bg-gradient-to-br from-indigo-500 to-purple-600" : ""}
          >
            {!user.avatar_url && user.full_name?.[0]}
          </Avatar>

          <div>
            <Text className="font-bold text-gray-800 block text-sm">
              {user.full_name}
            </Text>
            <Text className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MailOutlined className="text-gray-400" /> {user.email}
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
          <Tag color={ROLE_COLOR[user.role]} className="px-2 py-0.5 rounded-md font-semibold tracking-wide">
            {user.role.toUpperCase()}
          </Tag>

          <Select
            value={user.role}
            size="small"
            onChange={(value) =>
              handleUpdateUser(user.id, { role: value })
            }
            className="w-[110px]"
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
          className="font-bold transition-transform hover:scale-105"
          style={{ color: user.is_active ? STATUS_COLOR.active : STATUS_COLOR.inactive }}
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
          className="rounded-lg hover:bg-red-50 hover:scale-110 transition-all duration-200"
        />
      )
    }
  ];

  return (
    <div className="max-w-[1440px] mx-auto animate-fade-in">

      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden rounded-[32px] mb-8 p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10">
          <Title level={2} className="!text-white !mb-2 !font-extrabold tracking-tight drop-shadow-md">
            User Management
          </Title>

          <Text className="!text-indigo-100 text-lg font-medium tracking-wide">
            Manage student accounts, roles and status
          </Text>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white opacity-5 blur-2xl mix-blend-overlay" />
      </div>

      {/* ================= FILTER ================= */}
      <Card
        bordered={false}
        className="mb-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 bg-white"
        styles={{ body: { padding: '24px' } }}
      >
        <UserFilterBar filterLogic={filterLogic} />
      </Card>

      {/* ================= TABLE ================= */}
      <Card
        bordered={false}
        className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 bg-white overflow-hidden"
        styles={{ body: { padding: '0px' } }}
      >
        <div className="p-1">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              className: "px-6 py-4 mb-0"
            }}
            rowClassName={() => 'hover:bg-indigo-50/50 cursor-pointer transition-colors'}
            locale={{
              emptyText: <Empty description="No users found" className="py-12" />
            }}
          />
        </div>
      </Card>

    </div>
  );
};

export default UserManagement;