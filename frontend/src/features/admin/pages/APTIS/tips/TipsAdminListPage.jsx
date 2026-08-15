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
  Empty,
  Row,
  Col,
  Typography,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClearOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { tipsApi } from '../../../../../services/tipsApi';

const { Title, Text } = Typography;
const { Option } = Select;

const CATEGORY_MAP = {
  GRAMMAR_VOCAB: { label: 'Grammar & Vocab', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LISTENING: { label: 'Listening', color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  READING: { label: 'Reading', color: 'orange', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  WRITING: { label: 'Writing', color: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  SPEAKING: { label: 'Speaking', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  GENERAL: { label: 'General Advice', color: 'gold', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
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

  // Keyboard shortcut to focus search input (Ctrl + /)
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

  // Helper stats
  const publishedCount = tips.filter(t => t.is_published).length;
  const draftCount = tips.filter(t => !t.is_published).length;
  const totalViews = tips.reduce((acc, t) => acc + (t.views_count || 0), 0);

  const columns = [
    {
      title: 'Article Title',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div className="flex items-center gap-3 py-1">
          {record.thumbnail_url ? (
            <img
              src={record.thumbnail_url}
              alt="thumbnail"
              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0 shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#445A95] flex items-center justify-center shrink-0 border border-[#C7D0F0]/50 shadow-sm">
              <BookOutlined className="text-base" />
            </div>
          )}
          <div className="min-w-0">
            <Text strong className="text-gray-800 line-clamp-1 block leading-tight text-sm">
              {title}
            </Text>
            {record.summary && (
              <Text type="secondary" className="text-xs line-clamp-1 mt-0.5 block">
                {record.summary}
              </Text>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 170,
      render: (cat) => {
        const config = CATEGORY_MAP[cat] || { label: cat, color: 'default', bg: 'bg-gray-50 text-gray-700 border-gray-200' };
        return (
          <Tag color={config.color} className="font-bold border-0 px-3 py-0.5 rounded-full">
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Author',
      dataIndex: ['author', 'full_name'],
      key: 'author',
      width: 160,
      render: (author) => (
        <Space size="small">
          <Avatar size="small" icon={<UserOutlined />} className="bg-[#445A95] text-white" />
          <Text strong className="text-gray-700 text-xs">{author || 'Academic Team'}</Text>
        </Space>
      )
    },
    {
      title: 'Views',
      dataIndex: 'views_count',
      key: 'views_count',
      width: 100,
      align: 'center',
      render: (cnt) => (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 font-bold text-xs border border-gray-200">
          <EyeOutlined className="text-gray-400" />
          <span>{cnt || 0}</span>
        </div>
      )
    },
    {
      title: 'Visibility',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 130,
      align: 'center',
      render: (pub) => (
        <Tag
          color={pub ? 'success' : 'warning'}
          icon={pub ? <SafetyCertificateOutlined /> : <ClockCircleOutlined />}
          className={`rounded-full px-3 py-0.5 border-0 font-bold ${
            pub ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {pub ? 'Published' : 'Draft'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Tip Article">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`${basePath}/edit/${record.id}`)}
              className="rounded-xl font-bold bg-[#F0F3FF] text-[#445A95] hover:bg-[#445A95] hover:text-white border-0 shadow-sm transition-all"
            >
              Edit
            </Button>
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
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="rounded-xl hover:bg-rose-50 transition-colors"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const hasActiveFilters = Boolean(search || categoryFilter !== 'ALL');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <Title level={3} className="mb-1 font-bold">
            <span style={{
              background: isTeacher
                ? 'linear-gradient(135deg, #445A95, #5C76B5)'
                : 'linear-gradient(135deg, #f97316, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Exam Tips & Study Guide Management
            </span>
          </Title>
          <Text className="text-gray-500">
            {isTeacher 
              ? 'Create, edit, and publish skill advice articles and exam strategies for students'
              : 'Admin management for student exam tips and guides'}
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`${basePath}/create`)}
          className="rounded-xl font-bold h-11 px-6 border-0 shadow-md hover:opacity-95 transition-all text-white"
          style={{
            background: isTeacher
              ? 'linear-gradient(135deg, #445A95, #5C76B5)'
              : 'linear-gradient(135deg, #f97316, #ea580c)'
          }}
        >
          Create New Tip
        </Button>
      </div>

      {/* STATS CARDS */}
      <Row gutter={24} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-200 relative overflow-hidden bg-white">
            <FolderOpenOutlined className="absolute -right-4 -bottom-4 text-7xl text-gray-100" />
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Articles</Text>
            <div className="mt-1"><span className="text-3xl font-black text-gray-800">{total}</span></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-green-200 bg-green-50 relative overflow-hidden">
            <SafetyCertificateOutlined className="absolute -right-4 -bottom-4 text-7xl text-green-200 opacity-40" />
            <Text className="text-green-600 font-bold text-xs uppercase tracking-wider">Published</Text>
            <div className="mt-1"><span className="text-3xl font-black text-green-600">{publishedCount}</span> <span className="text-xs text-green-500 font-medium">active articles</span></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-amber-200 bg-amber-50 relative overflow-hidden">
            <ClockCircleOutlined className="absolute -right-4 -bottom-4 text-7xl text-amber-200 opacity-40" />
            <Text className="text-amber-600 font-bold text-xs uppercase tracking-wider">Drafts</Text>
            <div className="mt-1"><span className="text-3xl font-black text-amber-600">{draftCount}</span> <span className="text-xs text-amber-500 font-medium">in progress</span></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-[#C7D0F0] bg-[#F0F3FF] relative overflow-hidden">
            <EyeOutlined className="absolute -right-4 -bottom-4 text-7xl text-[#445A95] opacity-10" />
            <Text className="text-[#445A95] font-bold text-xs uppercase tracking-wider">Total Views</Text>
            <div className="mt-1"><span className="text-3xl font-black text-[#445A95]">{totalViews}</span> <span className="text-xs text-[#5C76B5] font-medium">reads</span></div>
          </Card>
        </Col>
      </Row>

      {/* FILTER & SEARCH */}
      <Card className="shadow-sm rounded-2xl border-0 mb-6" styles={{ body: { padding: '16px 20px' } }}>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center flex-wrap">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Input
              ref={searchInputRef}
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              placeholder="Search by title (Ctrl + /)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              allowClear
              className="w-full sm:w-72 rounded-xl h-10 font-medium"
            />

            <Select
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
              className="w-full sm:w-52 rounded-xl h-10 font-semibold"
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
                className="rounded-xl font-bold h-10 px-3.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              Total: {total} items
            </span>
            <Tooltip title="Refresh tip article list">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAdminTips}
                className="rounded-xl font-bold h-10 px-4 text-xs"
              >
                Refresh
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm rounded-2xl border-0 overflow-hidden" styles={{ body: { padding: '16px 24px' } }}>
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
                    <div className="text-gray-700 font-bold text-base">
                      {hasActiveFilters ? 'No tip articles match your filters' : 'No tip articles published yet'}
                    </div>
                    <div className="text-gray-400 font-medium text-xs max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'Try adjusting your search terms or category filter to find what you are looking for.'
                        : 'Start creating helpful exam strategies and skill guides to support your students.'}
                    </div>
                  </div>
                }
                className="py-6"
              >
                {hasActiveFilters ? (
                  <Button size="middle" icon={<ClearOutlined />} onClick={handleResetFilters} className="rounded-xl font-bold bg-[#F0F3FF] text-[#445A95] border-none hover:bg-[#445A95]/10 mt-2">
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="middle"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`${basePath}/create`)}
                    className="rounded-xl font-bold text-white border-none shadow-md shadow-[#445A95]/20 mt-2"
                    style={{
                      background: isTeacher
                        ? 'linear-gradient(135deg, #445A95, #5C76B5)'
                        : 'linear-gradient(135deg, #f97316, #ea580c)'
                    }}
                  >
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
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} tips`
          }}
          size="middle"
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </Card>
    </div>
  );
};

export default TipsAdminListPage;

