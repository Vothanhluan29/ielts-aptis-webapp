import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Button, Input, Switch, InputNumber, 
  Typography, Space, Row, Col, Spin, Tooltip 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, FormOutlined, 
  InfoCircleOutlined, PictureOutlined, CloudUploadOutlined, 
  DeleteOutlined, SafetyCertificateOutlined 
} from '@ant-design/icons';
import { useWritingEdit } from '../../hooks/writing/useWritingEdit';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WritingEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Gọi Hook để lấy Logic
  const {
    isEditMode, loading, uploadingImg, isDragging,
    formData, tasks,
    handleFormChange, handleTaskChange, 
    handleImageUpload, removeImage, onDragOver, onDragLeave, onDrop,
    handleSubmit
  } = useWritingEdit(id);

  // Màn hình Loading khi đang fetch data
  if (loading && isEditMode && !formData.title) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" tip="Loading test data..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* ================= BACK BUTTON ================= */}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/skills/writing')}
          className="mb-4 px-0 text-slate-500 hover:text-pink-600 font-semibold"
        >
          Back to List
        </Button>

        <form onSubmit={handleSubmit}>
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Title level={2} className="!m-0 flex items-center gap-3 !text-slate-800">
              <div className="p-2 bg-pink-600 text-white rounded-lg shadow-sm">
                <FormOutlined />
              </div>
              {isEditMode ? 'Edit Writing Test' : 'Create New Writing Test'}
            </Title>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-pink-600 hover:bg-pink-500 shadow-md font-bold px-8 rounded-xl border-none"
            >
              Save Changes
            </Button>
          </div>

          <Space direction="vertical" size="large" className="w-full">
            
            {/* ================= GENERAL INFO ================= */}
            <Card 
              title={
                <Space className="text-slate-700">
                  <InfoCircleOutlined className="text-pink-600" />
                  <span className="font-bold">General Information</span>
                </Space>
              }
              className="rounded-2xl shadow-sm border-slate-200"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={24}>
                  <Text strong className="block mb-2">Test Title <Text type="danger">*</Text></Text>
                  <Input
                    size="large"
                    required
                    placeholder="e.g. IELTS Writing Task 1 & 2 - Test 01"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="rounded-lg hover:border-pink-300 focus:border-pink-500"
                  />
                </Col>

                <Col xs={24} md={8}>
                  <Text strong className="block mb-2">Time Limit (minutes)</Text>
                  <InputNumber
                    size="large"
                    min={1}
                    max={180}
                    value={formData.time_limit}
                    onChange={(val) => handleFormChange('time_limit', val || 0)}
                    className="w-full rounded-lg hover:border-pink-300 focus:border-pink-500"
                  />
                </Col>

                <Col xs={24} md={16}>
                  <Text strong className="block mb-2">Test Status</Text>
                  <Space size="large" className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    <Space>
                      <Switch 
                        checked={formData.is_published} 
                        onChange={(checked) => handleFormChange('is_published', checked)}
                        className={formData.is_published ? "bg-green-500" : "bg-slate-300"}
                      />
                      <Text strong className={formData.is_published ? "text-green-600" : "text-slate-500"}>
                        Published
                      </Text>
                    </Space>
                    
                    <div className="w-px h-6 bg-slate-200 mx-2" />

                    <Space>
                      <Switch 
                        checked={formData.is_full_test_only} 
                        onChange={(checked) => handleFormChange('is_full_test_only', checked)}
                        className={formData.is_full_test_only ? "bg-blue-600" : "bg-slate-300"}
                      />
                      <Text strong className={formData.is_full_test_only ? "text-blue-600" : "text-slate-500"}>
                        <SafetyCertificateOutlined className="mr-1" /> Mock Only
                      </Text>
                    </Space>
                  </Space>
                </Col>

                <Col xs={24}>
                  <Text strong className="block mb-2">Description</Text>
                  <TextArea
                    rows={3}
                    placeholder="Notes about the writing topic..."
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="rounded-lg hover:border-pink-300 focus:border-pink-500"
                  />
                </Col>
              </Row>
            </Card>

            {/* ================= TASK 1 ================= */}
            <Card 
              className="rounded-2xl shadow-sm border-slate-200 overflow-hidden"
              styles={{ header: { backgroundColor: '#fdf2f8', borderBottom: '1px solid #fbcfe8' } }}
              title={
                <div className="flex items-center gap-2">
                  <div className="bg-pink-600 text-white text-xs font-black px-2 py-1 rounded">TASK 1</div>
                  <span className="font-bold text-pink-900">Report / Letter (Academic / General)</span>
                </div>
              }
            >
              <Row gutter={[24, 24]}>
                {/* Textarea Question */}
                <Col xs={24} md={12}>
                  <Text strong className="block mb-2">Question <Text type="danger">*</Text></Text>
                  <TextArea
                    rows={12}
                    required
                    placeholder="The chart below shows..."
                    value={tasks[0].question_text}
                    onChange={(e) => handleTaskChange(0, 'question_text', e.target.value)}
                    className="rounded-xl hover:border-pink-300 focus:border-pink-500 text-base"
                  />
                </Col>

                {/* Khu vực Upload Ảnh */}
                <Col xs={24} md={12}>
                  <Text strong className="block mb-2">
                    <PictureOutlined className="mr-2" /> Chart Image (Optional)
                  </Text>
                  
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-xl p-4 h-[285px] flex flex-col items-center justify-center relative transition-colors cursor-pointer
                      ${isDragging ? 'border-pink-500 bg-pink-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
                    `}
                  >
                    {tasks[0].image_url ? (
                      <div className="relative w-full h-full flex items-center justify-center group">
                        <img
                          src={tasks[0].image_url}
                          alt="Task 1 Chart"
                          className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button 
                            danger 
                            type="primary" 
                            icon={<DeleteOutlined />} 
                            onClick={removeImage}
                            className="shadow-lg font-bold"
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CloudUploadOutlined className={`text-5xl ${isDragging ? "text-pink-500" : "text-slate-400"} mb-4`} />
                        <p className="text-slate-500 mb-4 font-medium">
                          {isDragging ? 'Drop image here...' : 'Drag & drop or select a chart image'}
                        </p>
                        <Button 
                          type="default" 
                          loading={uploadingImg}
                          className="font-bold rounded-lg border-slate-300 hover:text-pink-600 hover:border-pink-600"
                        >
                          <label className="cursor-pointer">
                            {uploadingImg ? 'Uploading...' : 'Choose File'}
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploadingImg}
                            />
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* ================= TASK 2 ================= */}
            <Card 
              className="rounded-2xl shadow-sm border-slate-200 overflow-hidden"
              styles={{ header: { backgroundColor: '#fdf2f8', borderBottom: '1px solid #fbcfe8' } }}
              title={
                <div className="flex items-center gap-2">
                  <div className="bg-pink-600 text-white text-xs font-black px-2 py-1 rounded">TASK 2</div>
                  <span className="font-bold text-pink-900">Essay</span>
                </div>
              }
            >
              <Text strong className="block mb-2">Essay Topic <Text type="danger">*</Text></Text>
              <TextArea
                rows={6}
                required
                placeholder="Some people believe that..."
                value={tasks[1].question_text}
                onChange={(e) => handleTaskChange(1, 'question_text', e.target.value)}
                className="rounded-xl hover:border-pink-300 focus:border-pink-500 text-base"
              />
            </Card>

          </Space>
        </form>
      </div>
    </div>
  );
};

export default WritingEditPage;