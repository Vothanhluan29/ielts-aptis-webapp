import React from 'react';
import {
  Input,
  Select,
  Button,
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
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
      {/* SEARCH */}
      <div className="w-full md:w-auto flex-1 max-w-md">
        <Input
          placeholder="Search users by name or email..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          className="rounded-xl border-gray-200 hover:border-indigo-400 focus:border-indigo-500 shadow-sm"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select
          value={filterRole}
          onChange={setFilterRole}
          size="large"
          className="w-full sm:w-[140px] rounded-xl"
          suffixIcon={<FilterOutlined className="text-gray-400" />}
          popupClassName="rounded-xl"
        >
          <Option value="all">All Roles</Option>
          <Option value="admin">Admin</Option>
          <Option value="student">Student</Option>
        </Select>

        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          size="large"
          className="w-full sm:w-[140px] rounded-xl"
          popupClassName="rounded-xl"
        >
          <Option value="all">All Status</Option>
          <Option value="active">Active</Option>
          <Option value="banned">Suspended</Option>
        </Select>

        {/* RESET */}
        {hasFilter && (
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={resetFilters}
            size="large"
            className="rounded-xl border-red-100 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-colors shadow-sm"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserFilterBar;