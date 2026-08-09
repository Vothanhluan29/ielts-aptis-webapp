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
  Divider,
  Tooltip,
  Modal,
  Segmented
} from 'antd';
import {
  ArrowLeftOutlined,
  SendOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  LinkOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { tipsApi } from '../../../../../services/tipsApi';

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

  // Keyboard Shortcut: Ctrl + S / Cmd + S to quick save (Nielsen #7: Efficiency of Use)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        form.submit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form]);

  // Navigation with Unsaved Changes Protection (Nielsen #3: User Control & Freedom)
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

  // Image Upload Processing Handler (Nielsen #1 Status, #5 Prevention, #9 Error Recovery)
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-semibold">Loading tip article editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans">
      
      {/* HEADER BAR (Nielsen #3 Control & Freedom, #4 Standards) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Tooltip title="Back to Tips List">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleSafeNavigateBack}
              className="rounded-full font-bold border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
            >
              Back
            </Button>
          </Tooltip>
          <div>
            <h1 className="m-0 text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {isEditing ? 'Edit Exam Tip Article' : 'Create New Exam Tip'}
            </h1>
            <p className="m-0 text-xs text-slate-400 font-semibold mt-0.5">
              {isEditing ? `Modifying Tip Article #${id}` : 'Publish high-impact strategies and skill guides for students'}
            </p>
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
              onClick={() => form.submit()}
              className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold h-11 px-7 border-none shadow-md shadow-indigo-200"
            >
              {isEditing ? 'Save Changes' : 'Publish Article'}
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
          <Card className="rounded-3xl shadow-sm border border-slate-200 p-2 md:p-4">
            
            <Form.Item
              name="title"
              label={<span className="font-extrabold text-slate-700 text-base">Article Title <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Please enter article title' }]}
            >
              <Input
                placeholder="e.g. 5 Proven Strategies to Master APTIS Listening Part 3"
                className="rounded-2xl h-12 text-lg font-bold text-slate-800"
              />
            </Form.Item>

            <Form.Item
              name="summary"
              label={
                <span className="font-extrabold text-slate-700 text-sm flex items-center gap-1.5">
                  Key Takeaway / Short Summary
                  <Tooltip title="This summary appears in student tip card previews and highlighted callout boxes">
                    <InfoCircleOutlined className="text-slate-400 font-normal" />
                  </Tooltip>
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Provide a concise summary highlighting key advice for students..."
                className="rounded-2xl text-sm font-medium"
              />
            </Form.Item>

            <Form.Item
              name="content"
              label={<span className="font-extrabold text-slate-700 text-sm">Full Article Content <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Please write full article content' }]}
            >
              <TextArea
                rows={16}
                placeholder="Write detailed strategy guides, skill rules, exam examples, and actionable advice for students..."
                className="rounded-2xl text-base font-normal leading-relaxed font-sans"
              />
            </Form.Item>

          </Card>
        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">
          
          {/* PUBLICATION SETTINGS CARD */}
          <Card
            className="rounded-3xl shadow-sm border border-slate-200"
            title={<span className="font-extrabold text-slate-800 text-base">Publication Settings</span>}
          >
            <Form.Item
              name="category"
              label={<span className="font-bold text-slate-700">Skill Category</span>}
              rules={[{ required: true, message: 'Please select a skill category' }]}
            >
              <Select className="rounded-xl h-11 font-bold">
                <Option value="GRAMMAR_VOCAB">Grammar & Vocabulary</Option>
                <Option value="LISTENING">Listening</Option>
                <Option value="READING">Reading</Option>
                <Option value="WRITING">Writing</Option>
                <Option value="SPEAKING">Speaking</Option>
                <Option value="GENERAL">General Advice</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="target_exam"
              label={<span className="font-bold text-slate-700">Target Exam</span>}
            >
              <Input disabled value="APTIS" className="rounded-xl h-11 font-bold bg-slate-50 text-slate-600" />
            </Form.Item>

            <Divider className="my-4 border-slate-100" />

            <Form.Item
              name="is_published"
              label={<span className="font-bold text-slate-700">Publish Visibility</span>}
              valuePropName="checked"
            >
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-700">
                    Visible to students
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Published articles are immediately viewable
                  </span>
                </div>
                <Switch checkedChildren="Public" unCheckedChildren="Draft" />
              </div>
            </Form.Item>
          </Card>

          {/* COVER THUMBNAIL UPLOAD CARD (Nielsen #1 Status, #3 Freedom, #5 Prevention, #7 Flexibility) */}
          <Card
            className="rounded-3xl shadow-sm border border-slate-200"
            title={<span className="font-extrabold text-slate-800 text-base">Cover Thumbnail Image</span>}
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
                className="p-1 rounded-2xl font-bold bg-slate-100"
              />
            </div>

            {/* Hidden HTML File Input for Direct Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            {/* MODE 1: Direct File Upload Dropzone / Button */}
            {imageInputMode === 'upload' && (
              <div className="space-y-3">
                {!thumbnailPreview ? (
                  <div
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    className={`rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-50/30 hover:border-indigo-300 group ${
                      uploadingImage ? 'opacity-50 pointer-events cursor-wait' : ''
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="py-4">
                        <Spin size="medium" />
                        <p className="mt-3 text-xs font-bold text-indigo-600 m-0">Uploading image file...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                          <CloudUploadOutlined className="text-2xl" />
                        </div>
                        <p className="m-0 font-bold text-sm text-slate-700 group-hover:text-indigo-600">
                          Click to upload cover image
                        </p>
                        <p className="m-0 mt-1 text-[11px] font-medium text-slate-400">
                          Supports PNG, JPG, WEBP, GIF (Max {MAX_FILE_SIZE_MB}MB)
                        </p>
                        <Button
                          size="small"
                          type="primary"
                          icon={<UploadOutlined />}
                          className="mt-4 rounded-xl font-bold bg-indigo-600 border-none shadow-sm"
                        >
                          Select Image File
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden h-44 border border-slate-200 shadow-sm relative group">
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
                          className="rounded-xl font-bold bg-white/90 text-slate-800 border-none hover:bg-white"
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

                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100">
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
                  <label className="font-bold text-slate-700 text-xs block mb-1">
                    Image Web Address (URL)
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailPreview}
                    className="rounded-xl h-11 text-xs font-semibold"
                    onChange={(e) => {
                      const val = e.target.value;
                      form.setFieldsValue({ thumbnail_url: val });
                      setThumbnailPreview(val);
                    }}
                  />
                </div>

                {thumbnailPreview ? (
                  <div className="rounded-2xl overflow-hidden h-40 border border-slate-200 shadow-sm relative group">
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
                  <div className="rounded-2xl h-32 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-medium p-4 text-center">
                    <PictureOutlined className="text-2xl mb-1 text-slate-300" />
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
