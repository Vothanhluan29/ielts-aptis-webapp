import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Switch,
  message,
  Spin,
  Tooltip,
  Modal,
  Segmented,
  Skeleton,
  Typography
} from 'antd';
import {
  ArrowLeftOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  LinkOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  SendOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { tipsApi } from '../../../../../services/tipsApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 10;

const TipEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);

  // Determine base path (/admin or /teacher)
  const isTeacher = location.pathname.startsWith('/teacher');
  const backPath = isTeacher ? '/teacher/tips' : '/admin/aptis/tips';

  const titleValue = Form.useWatch('title', form);
  const contentValue = Form.useWatch('content', form);
  const canSubmit = !!titleValue && !!contentValue;

  // Auto-save draft to local storage
  const draftKey = `tip_draft_${id || 'new'}`;
  
  useEffect(() => {
    if (contentValue && !loading) {
      const timer = setTimeout(() => {
        localStorage.setItem(draftKey, contentValue);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [contentValue, draftKey, loading]);

  // Load draft on mount (only for new tips or if content is empty)
  useEffect(() => {
    if (!isEditing) {
      const draft = localStorage.getItem(draftKey);
      if (draft && !form.getFieldValue('content')) {
        form.setFieldsValue({ content: draft });
        message.info('Recovered draft content from your previous session.');
      }
    }
  }, [isEditing, draftKey, form]);

  // Load Tip Details if Editing
  useEffect(() => {
    if (isEditing) {
      const fetchTip = async () => {
        setLoading(true);
        try {
          const data = await tipsApi.getTipDetail(id);
          form.setFieldsValue({
            title: data.title,
            category: data.category || 'GENERAL',
            target_exam: data.target_exam || 'APTIS',
            summary: data.summary || '',
            content: data.content || '',
            thumbnail_url: data.thumbnail_url || '',
            is_published: data.is_published ?? true
          });
          setThumbnailPreview(data.thumbnail_url || '');
          if (data.thumbnail_url && data.thumbnail_url.startsWith('http') && !data.thumbnail_url.includes('static/tips')) {
            setImageInputMode('url');
          }
        } catch (err) {
          console.error('Failed to fetch tip detail:', err);
          message.error('Failed to load tip article details. Please try again.');
          navigate(backPath);
        } finally {
          setLoading(false);
        }
      };
      fetchTip();
    } else {
      form.setFieldsValue({
        category: 'GENERAL',
        target_exam: 'APTIS',
        is_published: true
      });
    }
  }, [id, isEditing, form, navigate, backPath]);

  // Keyboard Shortcut: Ctrl + S / Cmd + S to quick save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canSubmit) form.submit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSafeNavigateBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, canSubmit]);

  // Navigation with Unsaved Changes Protection
  const handleSafeNavigateBack = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Discard unsaved changes?',
        content: 'You have unsaved edits in this article. Are you sure you want to leave without saving?',
        okText: 'Yes, Discard Changes',
        okButtonProps: { danger: true },
        cancelText: 'Continue Editing',
        onOk: () => navigate(backPath)
      });
    } else {
      navigate(backPath);
    }
  };

  // Form Submission Handler
  const handleSubmit = async (values) => {
    setSubmitting(true);
    message.loading({ content: 'Saving tip article...', key: 'saveTip' });
    try {
      const payload = {
        ...values,
        thumbnail_url: form.getFieldValue('thumbnail_url') || thumbnailPreview || ''
      };

      if (isEditing) {
        await tipsApi.adminUpdateTip(id, payload);
        message.success({ content: 'Tip article updated successfully!', key: 'saveTip' });
      } else {
        await tipsApi.adminCreateTip(payload);
        message.success({ content: 'New tip article published successfully!', key: 'saveTip' });
      }
      // Clear draft on successful save
      localStorage.removeItem(draftKey);
      navigate(backPath);
    } catch (err) {
      console.error('Failed to save tip:', err);
      message.error({
        content: err.response?.data?.detail || 'Failed to save tip article. Please verify required fields.',
        key: 'saveTip'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Image Upload Processing Handler
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      message.error('Unsupported image format. Please select JPG, PNG, WEBP, or GIF.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      message.error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please select a smaller image.`);
      return;
    }

    setUploadingImage(true);
    message.loading({ content: 'Uploading cover image to server...', key: 'imgUpload' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await tipsApi.adminUploadImage(formData);
      const imageUrl = res.url || res.data?.url;

      if (imageUrl) {
        form.setFieldsValue({ thumbnail_url: imageUrl });
        setThumbnailPreview(imageUrl);
        message.success({ content: 'Cover image uploaded successfully!', key: 'imgUpload' });
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      let errorMsg = 'Failed to upload cover image. Please try again.';
      if (err.response?.status === 401) {
        errorMsg = 'Session expired. Please log in to upload images.';
      } else if (err.response?.status === 403) {
        errorMsg = 'Insufficient permissions to upload images.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      message.error({
        content: errorMsg,
        key: 'imgUpload'
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    form.setFieldsValue({ thumbnail_url: '' });
    setThumbnailPreview('');
    message.info('Cover image removed');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto font-sans min-h-screen">
        <Skeleton active title paragraph={{ rows: 2 }} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border-0 p-4">
              <Skeleton active title={false} paragraph={{ rows: 14 }} />
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-0">
              <Skeleton active title paragraph={{ rows: 4 }} />
            </Card>
            <Card className="rounded-2xl shadow-sm border-0">
              <Skeleton active title paragraph={{ rows: 6 }} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Tooltip title="Back to Tips List">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleSafeNavigateBack}
              className="rounded-xl font-bold bg-white text-gray-600 hover:text-[#445A95] hover:border-[#445A95] border-gray-200 shadow-sm"
            >
              Back
            </Button>
          </Tooltip>
          <div>
            <Title level={3} className="m-0 font-bold">
              <span style={{
                background: isTeacher
                  ? 'linear-gradient(135deg, #445A95, #5C76B5)'
                  : 'linear-gradient(135deg, #f97316, #ea580c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {isEditing ? 'Edit Exam Tip Article' : 'Create New Exam Tip'}
              </span>
            </Title>
            <Text className="text-gray-500 text-xs font-semibold block mt-0.5">
              {isEditing ? `Modifying Tip Article #${id}` : 'Publish high-impact strategies and skill guides for students'}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={handleSafeNavigateBack}
            className="rounded-xl font-bold h-11 px-5"
          >
            Cancel
          </Button>

          <Tooltip title="Shortcut: Press Ctrl + S to save">
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={submitting}
              disabled={!canSubmit}
              onClick={() => form.submit()}
              className="rounded-xl font-bold h-11 px-7 border-none shadow-md transition-all text-white"
              style={{
                background: isTeacher
                  ? 'linear-gradient(135deg, #445A95, #5C76B5)'
                  : 'linear-gradient(135deg, #f97316, #ea580c)'
              }}
            >
              {isEditing ? 'Publish Changes' : 'Publish Article'}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* FORM CONTENT */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Form.Item name="thumbnail_url" noStyle>
          <Input type="hidden" />
        </Form.Item>

        {/* MAIN LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm rounded-2xl border-0 overflow-hidden" styles={{ body: { padding: '24px' } }}>
            
            <Form.Item
              name="title"
              label={<span className="font-extrabold text-gray-700 text-base">Article Title <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Please enter article title' }]}
            >
              <Input
                placeholder="e.g. 5 Proven Strategies to Master APTIS Listening Part 3"
                className="rounded-xl h-12 text-base font-bold text-gray-800"
              />
            </Form.Item>

            <Form.Item
              name="summary"
              label={
                <span className="font-extrabold text-gray-700 text-sm flex items-center gap-1.5">
                  Key Takeaway / Short Summary
                  <Tooltip title="This summary appears in student tip card previews and highlighted callout boxes">
                    <InfoCircleOutlined className="text-gray-400 font-normal" />
                  </Tooltip>
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Provide a concise summary highlighting key advice for students..."
                className="rounded-xl text-sm font-medium"
              />
            </Form.Item>

            <Form.Item
              name="content"
              label={<span className="font-extrabold text-gray-700 text-sm">Full Article Content <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Please write full article content' }]}
            >
              <TextArea
                rows={16}
                placeholder="Write detailed strategy guides, skill rules, exam examples, and actionable advice for students..."
                className="rounded-xl text-sm font-normal leading-relaxed font-sans"
              />
            </Form.Item>

          </Card>
        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">
          
          {/* PUBLICATION SETTINGS CARD */}
          <Card
            className="shadow-sm rounded-2xl border-0 overflow-hidden"
            styles={{ body: { padding: '20px' } }}
            title={
              <div className="flex items-center gap-2">
                <SettingOutlined className="text-[#445A95]" />
                <span className="font-bold text-gray-800 text-sm">Publication Settings</span>
              </div>
            }
          >
            <Form.Item
              name="category"
              label={<span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Skill Category</span>}
              rules={[{ required: true, message: 'Please select a skill category' }]}
            >
              <Select className="rounded-xl h-11 font-semibold">
                <Option value="GRAMMAR_VOCAB">Grammar & Vocabulary</Option>
                <Option value="LISTENING">Listening</Option>
                <Option value="READING">Reading</Option>
                <Option value="WRITING">Writing</Option>
                <Option value="SPEAKING">Speaking</Option>
                <Option value="GENERAL">General Advice</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="is_published"
              valuePropName="checked"
              label={<span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Visibility Status</span>}
            >
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-semibold text-gray-700">Published to Students</span>
                <Switch defaultChecked />
              </div>
            </Form.Item>

            <Form.Item
              name="target_exam"
              label={<span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Target Exam</span>}
            >
              <Input disabled value="APTIS" className="rounded-xl h-10 font-bold bg-gray-50 text-gray-600" />
            </Form.Item>
          </Card>

          {/* COVER THUMBNAIL UPLOAD CARD */}
          <Card
            className="shadow-sm rounded-2xl border-0 overflow-hidden"
            styles={{ body: { padding: '20px' } }}
            title={
              <div className="flex items-center gap-2">
                <PictureOutlined className="text-[#445A95]" />
                <span className="font-bold text-gray-800 text-sm">Cover Thumbnail Image</span>
              </div>
            }
          >
            {/* Input Method Toggle */}
            <div className="mb-4">
              <Segmented
                block
                value={imageInputMode}
                onChange={setImageInputMode}
                options={[
                  { label: 'Upload File', value: 'upload', icon: <CloudUploadOutlined /> },
                  { label: 'Image Link URL', value: 'url', icon: <LinkOutlined /> }
                ]}
                className="p-1 rounded-xl font-bold bg-gray-100"
              />
            </div>

            {/* Hidden HTML File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            {/* MODE 1: Direct File Upload Dropzone */}
            {imageInputMode === 'upload' && (
              <div className="space-y-3">
                {!thumbnailPreview ? (
                  <div
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    className={`rounded-2xl border-2 border-dashed border-[#C7D0F0] bg-[#F0F3FF]/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#F0F3FF] hover:border-[#445A95] group ${
                      uploadingImage ? 'opacity-50 pointer-events cursor-wait' : ''
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="py-4">
                        <Spin size="medium" />
                        <p className="mt-3 text-xs font-bold text-[#445A95] m-0">Uploading image file...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#F0F3FF] text-[#445A95] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm border border-[#C7D0F0]/50">
                          <CloudUploadOutlined className="text-2xl" />
                        </div>
                        <p className="m-0 font-bold text-sm text-gray-700 group-hover:text-[#445A95]">
                          Click to upload cover image
                        </p>
                        <p className="m-0 mt-1 text-[11px] font-medium text-gray-400">
                          Supports PNG, JPG, WEBP, GIF (Max {MAX_FILE_SIZE_MB}MB)
                        </p>
                        <Button
                          size="small"
                          type="primary"
                          icon={<UploadOutlined />}
                          className="mt-4 rounded-xl font-bold text-white border-none shadow-sm"
                          style={{
                            background: isTeacher ? '#445A95' : '#f97316'
                          }}
                        >
                          Select Image File
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden h-44 border border-gray-200 shadow-sm relative group">
                      <img
                        src={thumbnailPreview}
                        alt="Tip Cover Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          console.warn('Cover preview failed to load:', thumbnailPreview);
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="small"
                          icon={<UploadOutlined />}
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl font-bold bg-white/90 text-gray-800 border-none hover:bg-white"
                        >
                          Replace
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleRemoveImage}
                          className="rounded-xl font-bold"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-green-600 bg-green-50 px-3.5 py-2 rounded-xl border border-green-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircleOutlined /> Image attached successfully
                      </span>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={handleRemoveImage}
                        className="p-0 h-auto text-xs font-bold"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: Image URL Input Fallback */}
            {imageInputMode === 'url' && (
              <div className="space-y-3">
                <div className="mb-2">
                  <label className="font-bold text-gray-700 text-xs block mb-1">
                    Image Web Address (URL)
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailPreview}
                    className="rounded-xl h-10 text-xs font-semibold"
                    onChange={(e) => {
                      const val = e.target.value;
                      form.setFieldsValue({ thumbnail_url: val });
                      setThumbnailPreview(val);
                    }}
                  />
                </div>

                {thumbnailPreview ? (
                  <div className="rounded-2xl overflow-hidden h-40 border border-gray-200 shadow-sm relative group">
                    <img
                      src={thumbnailPreview}
                      alt="URL Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        console.warn('URL preview failed to load:', thumbnailPreview);
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveImage}
                        className="rounded-xl shadow-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl h-32 bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs font-medium p-4 text-center">
                    <PictureOutlined className="text-2xl mb-1 text-gray-300" />
                    <span>Paste image URL above to display preview</span>
                  </div>
                )}
              </div>
            )}

          </Card>

        </div>
      </Form>
    </div>
  );
};

export default TipEditPage;

