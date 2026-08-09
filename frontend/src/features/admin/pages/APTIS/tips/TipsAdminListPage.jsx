import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Card,
  Tooltip,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { tipsApi } from '../../../../../services/tipsApi';

const { Option } = Select;

const CATEGORY_MAP = {
  GRAMMAR_VOCAB: { label: 'Grammar & Vocab', color: 'emerald' },
  LISTENING: { label: 'Listening', color: 'blue' },
  READING: { label: 'Reading', color: 'orange' },
  WRITING: { label: 'Writing', color: 'purple' },
  SPEAKING: { label: 'Speaking', color: 'rose' },
  GENERAL: { label: 'General Advice', color: 'gold' }
};

const TipsAdminListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacher = location.pathname.startsWith('/teacher');
  const basePath = isTeacher ? '/teacher/tips' : '/admin/aptis/tips';

  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchAdminTips = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const params = {
        skip,
        limit: pageSize,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: search.trim() || undefined
      };
      const res = await tipsApi.adminGetTipsList(params);
      setTips(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch admin tips:', err);
      message.error('Failed to load exam tips list. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, categoryFilter, search]);

  useEffect(() => {
    fetchAdminTips();
  }, [fetchAdminTips]);

  // Keyboard shortcut to focus search input (Nielsen #7: Flexibility and Efficiency of Use)
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDelete = async (id) => {
    message.loading({ content: 'Deleting tip article...', key: 'delTip' });
    try {
      await tipsApi.adminDeleteTip(id);
      message.success({ content: 'Tip article deleted successfully!', key: 'delTip' });
      fetchAdminTips();
    } catch (err) {
      console.error('Delete failed:', err);
      message.error({ content: 'Could not delete tip article. Please try again.', key: 'delTip' });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setPage(1);
  };

  const columns = [
    {
      title: 'Article Title',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div className="py-1">
          <div className="font-extrabold text-slate-800 line-clamp-1">{title}</div>
          {record.summary && (
            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-medium">{record.summary}</div>
          )}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 170,
      render: (cat) => {
        const config = CATEGORY_MAP[cat] || { label: cat, color: 'default' };
        return <Tag color={config.color} className="font-bold border-0 px-2.5 py-0.5 rounded-full">{config.label}</Tag>;
      }
    },
    {
      title: 'Author',
      dataIndex: ['author', 'full_name'],
      key: 'author',
      width: 150,
      render: (author) => <span className="font-bold text-slate-600 text-xs">{author || 'Academic Team'}</span>
    },
    {
      title: 'Views',
      dataIndex: 'views_count',
      key: 'views_count',
      width: 90,
      render: (cnt) => <span className="font-bold text-slate-700">{cnt || 0}</span>
    },
    {
      title: 'Visibility',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 120,
      render: (pub) => (
        <Tag color={pub ? 'green' : 'gold'} className="font-extrabold rounded-full px-2.5">
          {pub ? 'Published' : 'Draft'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Tip Article">
            <Button
              type="text"
              icon={<EditOutlined className="text-[#445A95]" />}
              onClick={() => navigate(`${basePath}/edit/${record.id}`)}
            />
          </Tooltip>

          <Popconfirm
            title="Delete this tip article?"
            description="Are you sure you want to delete this tip? This action cannot be undone."
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Delete Article">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const hasActiveFilters = Boolean(search || categoryFilter !== 'ALL');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      <Card
        className="rounded-3xl shadow-sm border border-slate-200"
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] text-[#445A95] shadow-sm">
              <BookOutlined className="text-xl" />
            </div>
            <div>
              <h2 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                APTIS Exam Tips & Strategy Management
              </h2>
              <p className="m-0 text-xs text-slate-400 font-semibold mt-0.5">
                Create, edit, and publish skill advice articles for students
              </p>
            </div>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${basePath}/create`)}
            className="bg-[#445A95] hover:bg-[#445A95] font-bold rounded-xl h-11 px-6 border-none shadow-md shadow-[#445A95]/20"
          >
            Create New Tip
          </Button>
        }
      >
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Input
              ref={searchInputRef}
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              placeholder="Search by title (Ctrl + /)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              allowClear
              className="w-full sm:w-72 rounded-xl h-10 font-semibold text-xs"
            />

            <Select
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
              className="w-full sm:w-52 rounded-xl h-10 font-semibold text-xs"
            >
              <Option value="ALL">All Skill Categories</Option>
              <Option value="GRAMMAR_VOCAB">Grammar & Vocab</Option>
              <Option value="LISTENING">Listening</Option>
              <Option value="READING">Reading</Option>
              <Option value="WRITING">Writing</Option>
              <Option value="SPEAKING">Speaking</Option>
              <Option value="GENERAL">General Advice</Option>
            </Select>

            {hasActiveFilters && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                className="rounded-xl font-bold h-10 px-3 text-xs text-slate-500 hover:text-slate-700"
              >
                Reset Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hidden sm:inline-block">
              Total: {total}
            </span>
            <Tooltip title="Refresh tip article list">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAdminTips}
                className="rounded-xl font-bold h-10 px-4 text-xs bg-white"
              >
                Refresh
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={tips}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                styles={{ image: { height: 120 } }}
                description={
                  <div className="space-y-1 mt-2">
                    <div className="text-slate-700 font-bold text-base">
                      {hasActiveFilters ? 'No tip articles match your filters' : 'No tip articles published yet'}
                    </div>
                    <div className="text-slate-400 font-medium text-xs max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'Try adjusting your search terms or category filter to find what you are looking for.'
                        : 'Start creating helpful exam strategies and skill guides to support your students.'}
                    </div>
                  </div>
                }
                className="py-6"
              >
                {hasActiveFilters ? (
                  <Button size="middle" icon={<ClearOutlined />} onClick={handleResetFilters} className="rounded-xl font-bold bg-[#F8FAFC] text-[#445A95] border-none hover:bg-[#445A95]/10 mt-2">
                    Clear Filters
                  </Button>
                ) : (
                  <Button type="primary" size="middle" icon={<PlusOutlined />} onClick={() => navigate(`${basePath}/create`)} className="rounded-xl font-bold bg-[#445A95] border-none shadow-md shadow-[#445A95]/20 mt-2">
                    Create First Article
                  </Button>
                )}
              </Empty>
            )
          }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
            },
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} tips`
          }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default TipsAdminListPage;
