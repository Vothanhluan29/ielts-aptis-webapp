import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  message, Spin, Row, Col, Typography, Upload, Tag, Divider, Image, Tabs 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, UploadOutlined, 
  AudioOutlined, PictureOutlined, SoundOutlined, EditOutlined 
} from '@ant-design/icons';

// Import API của Speaking
import speakingAptisApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Định nghĩa cấu trúc chuẩn Aptis Speaking
const PART_CONFIGS = [
  { type: "PART_1", title: "Part 1: Personal Info", qCount: 3, images: 0 },
  { type: "PART_2", title: "Part 2: Describe Picture", qCount: 3, images: 1 },
  { type: "PART_3", title: "Part 3: Compare 2 Pictures", qCount: 3, images: 2 },
  { type: "PART_4", title: "Part 4: Abstract Topic", qCount: 3, images: 1 },
];

const SpeakingAptisEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. KHỞI TẠO CẤU TRÚC MẶC ĐỊNH
  const initDefaultData = useCallback(() => {
    const defaultParts = PART_CONFIGS.map((config, pIndex) => {
      const isPart4 = config.type === "PART_4";
      const defaultPrepTime = isPart4 ? 60 : 0; 
      const defaultResponseTime = isPart4 ? 120 : (config.type === "PART_1" ? 30 : 45);

      const questions = Array.from({ length: config.qCount }).map((_, qIndex) => ({
        order_number: qIndex + 1,
        question_text: "",
        audio_url: "", 
        prep_time: qIndex === 0 ? defaultPrepTime : 0, 
        response_time: isPart4 && qIndex > 0 ? 0 : defaultResponseTime 
      }));

      return {
        part_number: pIndex + 1,
        part_type: config.type,
        instruction: "",
        image_url: "", 
        image_url_2: "", 
        questions: questions
      };
    });

    form.setFieldsValue({ 
      title: "", 
      time_limit: 12, 
      description: "", 
      is_published: false, 
      is_full_test_only: false, 
      parts: defaultParts 
    });
  }, [form]);

  // 2. FETCH DỮ LIỆU & MERGE VỚI KHUNG MẶC ĐỊNH
  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await speakingAptisApi.getTestDetail(id);
          const data = res.data || res;
          
          // 🔥 THUẬT TOÁN MERGE DỮ LIỆU ĐẢM BẢO LUÔN CÓ 4 PARTS
          const fetchedParts = data.parts || [];
          
          const mergedParts = PART_CONFIGS.map((config, pIndex) => {
            // Tìm part tương ứng từ API trả về (nếu có)
            const fetchedPart = fetchedParts.find(p => p.part_type === config.type) || {};
            
            // Xử lý đắp dữ liệu cho từng câu hỏi bên trong Part
            const isPart4 = config.type === "PART_4";
            const defaultPrepTime = isPart4 ? 60 : 0; 
            const defaultResponseTime = isPart4 ? 120 : (config.type === "PART_1" ? 30 : 45);

            const mergedQuestions = Array.from({ length: config.qCount }).map((_, qIndex) => {
              // Tìm câu hỏi tương ứng từ API trả về (nếu có)
              const fetchedQ = (fetchedPart.questions || []).find(q => q.order_number === qIndex + 1) || {};
              
              return {
                order_number: qIndex + 1,
                question_text: fetchedQ.question_text || "",
                audio_url: fetchedQ.audio_url || "",
                prep_time: fetchedQ.prep_time !== undefined ? fetchedQ.prep_time : (qIndex === 0 ? defaultPrepTime : 0),
                response_time: fetchedQ.response_time !== undefined ? fetchedQ.response_time : (isPart4 && qIndex > 0 ? 0 : defaultResponseTime)
              };
            });

            // Trả về Part hoàn chỉnh
            return {
              part_number: pIndex + 1,
              part_type: config.type,
              instruction: fetchedPart.instruction || "",
              image_url: fetchedPart.image_url || "",
              image_url_2: fetchedPart.image_url_2 || "",
              questions: mergedQuestions
            };
          });

          // Set dữ liệu đã merge vào Form
          form.setFieldsValue({
            ...data,
            parts: mergedParts
          });

        } catch (error) {
          message.error('Không thể tải dữ liệu đề thi!',error.message);
          navigate('/admin/aptis/speaking');
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      initDefaultData();
    }
  }, [id, isEditMode, initDefaultData, navigate, form]);

  // 3. HANDLER UPLOAD
  const handleUploadFile = async (options, fieldPath, apiCall) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await apiCall(file);
      const url = res.data?.url || res.url;
      form.setFieldValue(fieldPath, url);
      onSuccess("Ok");
      message.success('Tải file thành công!');
    } catch (err) {
      onError({ err });
      message.error('Tải file thất bại!');
    }
  };

  // 4. LƯU FORM
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await speakingAptisApi.updateTest(id, values);
        message.success('Cập nhật đề thi thành công!');
      } else {
        await speakingAptisApi.createTest(values);
        message.success('Tạo đề mới thành công!');
      }
      navigate('/admin/aptis/speaking');
    } catch (error) {
      message.error('Lưu thất bại! Vui lòng kiểm tra lại các trường bắt buộc.', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/speaking')}>Quay lại</Button>
          <Title level={3} style={{ margin: 0, color: '#2563eb' }}><EditOutlined /> Thiết lập Đề Speaking</Title>
        </Space>
        <Button 
          type="primary" size="large" onClick={() => form.submit()} 
          icon={<SaveOutlined />} loading={submitting} 
          style={{ backgroundColor: '#2563eb', borderRadius: 8, height: 45 }}
        >
          LƯU BÀI THI
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* 1. THÔNG TIN CHUNG */}
        <Card variant="borderless" title="1. Thông tin chung" style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item name="title" label={<Text strong>Tiêu đề đề thi</Text>} rules={[{ required: true }]}>
                <Input size="large" placeholder="Ví dụ: Aptis Speaking Practice 01" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="time_limit" label={<Text strong>Thời gian (phút)</Text>} rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_full_test_only" valuePropName="checked" label={<Text strong>Chế độ Đề</Text>}>
                <Switch checkedChildren="Mock Test" unCheckedChildren="Luyện tập" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_published" valuePropName="checked" label={<Text strong>Trạng thái</Text>}>
                <Switch checkedChildren="Public" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Col span={24}>
              <Form.Item name="description" label={<Text strong>Mô tả đề thi</Text>}>
                <TextArea rows={2} placeholder="Mô tả tóm tắt về đề thi Speaking này..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider titlePlacement="left"><Title level={4} style={{ margin: 0 }}>2. Nội dung 4 phần thi (Speaking Parts)</Title></Divider>

        {/* 2. DANH SÁCH PARTS CHUYỂN THÀNH TABS */}
        <Form.List name="parts">
          {(fields) => {
            const tabItems = fields.map(({ name }, index) => {
              const config = PART_CONFIGS[index];
              const hasImage = config.images > 0;
              const hasTwoImages = config.images === 2; // Dành cho Part 3

              return {
                key: String(index),
                label: (
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>
                    <AudioOutlined /> {config.title}
                  </span>
                ),
                children: (
                  <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
                    <Row gutter={24}>
                      {/* Cột Trái: CÂU HỎI & AUDIO */}
                      <Col span={hasImage ? 15 : 24}>
                        <Form.Item name={[name, 'instruction']} label={<Text strong>Hướng dẫn trước khi bắt đầu (Instruction)</Text>}>
                          <TextArea rows={2} placeholder="Ví dụ: You have 30 seconds to answer each question..." />
                        </Form.Item>
                        
                        <div style={{ marginTop: 16 }}>
                          <Text strong style={{ display: 'block', marginBottom: 12 }}>Danh sách Audio & Cài đặt thời gian:</Text>
                          {Array.from({ length: config.qCount }).map((_, qIdx) => (
                            <Card size="small" key={`q-${qIdx}`} style={{ marginBottom: 12, background: '#fafafa' }}>
                              <Row gutter={16} align="middle">
                                <Col span={12}>
                                  <Form.Item 
                                    name={[name, 'questions', qIdx, 'question_text']} 
                                    label={<Space><Tag color="blue">Q{qIdx + 1}</Tag> Text câu hỏi (Tùy chọn hiển thị)</Space>}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <TextArea rows={2} placeholder="Transcript của file Audio..." />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Row gutter={8}>
                                    <Col span={12}>
                                      <Form.Item name={[name, 'questions', qIdx, 'prep_time']} label="Chuẩn bị (giây)" style={{ marginBottom: 8 }}>
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                      </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                      <Form.Item name={[name, 'questions', qIdx, 'response_time']} label="Trả lời (giây)" style={{ marginBottom: 8 }}>
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  <Form.Item shouldUpdate noStyle>
                                    {({ getFieldValue }) => {
                                      const audioUrl = getFieldValue(['parts', name, 'questions', qIdx, 'audio_url']);
                                      return (
                                        <Space style={{ width: '100%', justifyContent: 'space-between', background: '#fff', padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                                          {audioUrl ? (
                                            <audio controls src={audioUrl} style={{ height: 30, width: 180 }} />
                                          ) : (
                                            <Text type="secondary"><SoundOutlined /> Chưa có Audio</Text>
                                          )}
                                          <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'questions', qIdx, 'audio_url'], speakingAptisApi.uploadAudio)} showUploadList={false}>
                                            <Button size="small" icon={<UploadOutlined />}>Upload</Button>
                                          </Upload>
                                        </Space>
                                      );
                                    }}
                                  </Form.Item>
                                  <Form.Item name={[name, 'questions', qIdx, 'audio_url']} hidden><Input /></Form.Item>
                                  <Form.Item name={[name, 'questions', qIdx, 'order_number']} hidden><Input /></Form.Item>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </div>
                      </Col>

                      {/* Cột Phải: XỬ LÝ HÌNH ẢNH (Chỉ hiện ở Part 2, 3, 4) */}
                      {hasImage && (
                        <Col span={9}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}><PictureOutlined /> Ảnh minh họa</Text>
                          
                          {/* Ảnh 1 */}
                          <Card size="small" style={{ marginBottom: 16 }}>
                            <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'image_url'], speakingAptisApi.uploadImage)} showUploadList={false}>
                              <Button block icon={<UploadOutlined />}>Tải ảnh {hasTwoImages ? '1' : ''}</Button>
                            </Upload>
                            <Form.Item shouldUpdate noStyle>
                              {({ getFieldValue }) => {
                                const img1 = getFieldValue(['parts', name, 'image_url']);
                                return img1 ? (
                                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                                    <Image src={img1} style={{ maxHeight: 150, borderRadius: 6 }} />
                                  </div>
                                ) : null;
                              }}
                            </Form.Item>
                            <Form.Item name={[name, 'image_url']} hidden><Input /></Form.Item>
                          </Card>

                          {/* Ảnh 2 (Dành cho Part 3) */}
                          {hasTwoImages && (
                            <Card size="small">
                              <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'image_url_2'], speakingAptisApi.uploadImage)} showUploadList={false}>
                                <Button block icon={<UploadOutlined />}>Tải ảnh 2</Button>
                              </Upload>
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue }) => {
                                  const img2 = getFieldValue(['parts', name, 'image_url_2']);
                                  return img2 ? (
                                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                                      <Image src={img2} style={{ maxHeight: 150, borderRadius: 6 }} />
                                    </div>
                                  ) : null;
                                }}
                              </Form.Item>
                              <Form.Item name={[name, 'image_url_2']} hidden><Input /></Form.Item>
                            </Card>
                          )}
                        </Col>
                      )}
                    </Row>
                    <Form.Item name={[name, 'part_type']} hidden><Input /></Form.Item>
                    <Form.Item name={[name, 'part_number']} hidden><InputNumber /></Form.Item>
                  </div>
                )
              };
            });

            return (
              <Tabs 
                type="card" 
                size="large"
                items={tabItems} 
                style={{ backgroundColor: '#fafafa', paddingTop: 12, borderRadius: 12 }}
              />
            );
          }}
        </Form.List>
      </Form>
    </div>
  );
};

export default SpeakingAptisEditPage;