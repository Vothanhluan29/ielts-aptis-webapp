import React from 'react';
import {
  Input,
  Select,
  Button,
  Card,
  Space
} from 'antd';

import {
  SearchOutlined,
  CloseOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Option } = Select;

const UserFilterBar = ({ filterLogic }) => {
  const {
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    resetFilters,
    hasFilter
  } = filterLogic;

  return (
    <Card
      size="small"
      style={{
        borderRadius: 16
      }}
    >
      <Space
        style={{ width: '100%' }}
        direction="horizontal"
        wrap
        align="center"
        justify="space-between"
      >
        {/* SEARCH */}
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />

        {/* FILTERS */}
        <Space wrap>
          <Select
            value={filterRole}
            onChange={setFilterRole}
            style={{ width: 140 }}
            prefix={<FilterOutlined />}
          >
            <Option value="all">All Roles</Option>
            <Option value="admin">Admin</Option>
            <Option value="student">Student</Option>
          </Select>

          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 140 }}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="banned">Banned</Option>
          </Select>

          {/* RESET */}
          {hasFilter && (
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={resetFilters}
            >
              Reset
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default UserFilterBar;