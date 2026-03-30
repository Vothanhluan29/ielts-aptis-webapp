import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  message, Spin, Row, Col, Typography, Collapse, Popconfirm, Select
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, BookOutlined
} from '@ant-design/icons';

import readingAptisAdminApi from '../../../api/APTIS/reading/readingAptisAdminApi';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';
import ReorderSentencesAdmin from '../../../components/APTIS/question-types/ReorderSentencesAdmin';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ReadingAptisEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePartKeys, setActivePartKeys] = useState(['0']);

  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 35,
        is_published: false,
        is_full_test_only: false,
        description: '', // 🔥 ĐÃ THÊM: Khởi tạo giá trị rỗng cho description
        parts: [
          {
            part_number: 1,
            title: 'Part 1: Sentence Comprehension',
            content: '',
            questions: [{ question_type: 'FILL_IN_BLANKS', options: [], correct_answer: '' }]
          }
        ]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTestDetail = async () => {
    setLoading(true);
    try {
      const response = await readingAptisAdminApi.getTestDetail(id);
      const data = response.data || response;
      
      const formattedParts = data.parts?.map(part => {
        // 🔥 GỘP CÂU HỎI TỪ CÁC GROUPS ĐỂ KHÔNG MẤT DATA
        const allQuestions = part.groups?.reduce((acc, group) => {
          const mappedQs = (group.questions || []).map(q => {
            let optionsArray = [];
            let correctIndex = q.correct_answer; 

            if (q.question_type === 'MULTIPLE_CHOICE') {
              if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                const labels = ["A", "B", "C", "D"];
                optionsArray = labels.map(l => q.options[l] || '');
                const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
                if (foundIdx !== -1) correctIndex = foundIdx.toString();
              }
            }  else if (q.question_type === 'REORDER_SENTENCES') {
              optionsArray = Array.isArray(q.options) ? [...q.options] : [];
              
              // 🔥 SỬA Ở ĐÂY: Trả về MẢNG (Array) thay vì Chuỗi (String)
              if (typeof q.correct_answer === 'string' && /[A-Za-z]/.test(q.correct_answer)) {
                const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
                const parts = q.correct_answer.split(/[-,\s]+/).filter(Boolean);
                
                // Đã xóa hàm .join(',') ở cuối để giữ nguyên dạng Mảng
                correctIndex = parts.map(l => letters.indexOf(l.toUpperCase()).toString());
              } 
              // Đề phòng trường hợp DB đang lưu "1,3,0,2" do lỗi cũ
              else if (typeof q.correct_answer === 'string' && q.correct_answer.includes(',')) {
                correctIndex = q.correct_answer.split(',');
              } 
              else {
                correctIndex = q.correct_answer;
              }
            }
            else if (q.question_type === 'MATCHING_OPINIONS' || q.question_type === 'MATCHING_HEADINGS') {
              optionsArray = Array.isArray(q.options) ? [...q.options] : [];
              const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
              if (foundIdx !== -1) correctIndex = foundIdx.toString();
            }

            return { 
              ...q,
              options: optionsArray, 
              correct_answer: correctIndex
            };
          });
          return [...acc, ...mappedQs];
        }, []) || [];

        return {
          ...part,
          questions: allQuestions
        };
      }) || [];

      form.setFieldsValue({
        title: data.title,
        description: data.description || '', // 🔥 ĐÃ THÊM: Đổ dữ liệu description từ API vào Form
        time_limit: data.time_limit,
        is_published: data.is_published,
        is_full_test_only: data.is_full_test_only,
        parts: formattedParts,
      });
      // Mở hết Collapse
      setActivePartKeys(formattedParts.map((_, idx) => idx.toString()));
    } catch (error) {
      message.error('Failed to load test data!', error);
      navigate('/admin/aptis/reading');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('❌ Please fill in all required fields (check closed Parts).');
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // 🔥 BIẾN ĐẾM TOÀN CỤC ĐỂ ĐÁNH SỐ TỪ 1 ĐẾN HẾT BÀI THI
      let globalQuestionNumber = 1;

      const payload = {
        title: values.title,
        description: values.description, // 🔥 ĐÃ THÊM: Gửi description lên Backend
        time_limit: Number(values.time_limit),
        is_published: Boolean(values.is_published),
        is_full_test_only: Boolean(values.is_full_test_only),
        
        parts: values.parts?.map((part, pIndex) => {
          const mappedQuestions = part.questions?.map((q) => {
            let finalOptions;
            let exactCorrectText = "";

            if (q.question_type === 'REORDER_SENTENCES') {
              finalOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
              let ans = q.correct_answer || "";
              if (Array.isArray(ans)) ans = ans.join(',');
              
              // 🔥 Dịch từ "3,1,0,2" (của UI Component) sang "D-B-A-C" (lưu xuống DB)
              if (/^[0-9,\s]+$/.test(ans)) {
                const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
                exactCorrectText = ans.split(',').map(idx => letters[Number(idx.trim())]).join('-');
              } else {
                exactCorrectText = ans.toUpperCase().replace(/,/g, '-');
              }
            }
            else if (q.question_type === 'MATCHING_OPINIONS' || q.question_type === 'MATCHING_HEADINGS') {
              finalOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            } 
            else if (q.question_type === 'FILL_IN_BLANKS') {
              finalOptions = {}; 
              exactCorrectText = q.correct_answer?.trim() || "";
            } 
            else {
              const optionsDict = {};
              const labels = ["A", "B", "C", "D"];
              if (Array.isArray(q.options)) {
                q.options.forEach((opt, i) => {
                  if (opt && opt.trim() !== '') optionsDict[labels[i]] = opt.trim();
                });
              }
              finalOptions = optionsDict;
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            }

            const currentQuestionNumber = globalQuestionNumber++;

            return {
              question_number: currentQuestionNumber, // Sắp xếp nối tiếp
              question_text: q.question_text || "",
              question_type: q.question_type,
              options: finalOptions,
              correct_answer: exactCorrectText,
              explanation: q.explanation || ""
            };
          }) || [];

          return {
            part_number: pIndex + 1,
            title: part.title || `Part ${pIndex + 1}`,
            content: part.content || "",
            groups: [{
              instruction: part.title,
              order: 1,
              questions: mappedQuestions
            }]
          };
        }) || []
      };

      if (isEditMode) {
        await readingAptisAdminApi.updateTest(id, payload);
        message.success('Test updated successfully!');
      } else {
        await readingAptisAdminApi.createTest(payload);
        message.success('Test created successfully!');
      }
      navigate('/admin/aptis/reading');
    } catch (error) {
      console.error("Payload error:", error.response?.data);
      message.error('Save failed! Please check your input data.');
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 TÁCH RIÊNG LOGIC HIỂN THỊ ĐỂ CÓ THỂ ĐẾM SỐ CÂU HỎI LIÊN TỤC
  const renderPartItems = (partFields, removePart) => {
    return partFields.map(({ key, name: partName }, pIndex) => ({
      key: key.toString(),
      label: (
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => (
            <strong style={{ color: '#4338ca', fontSize: 16 }}>
              Part {pIndex + 1}: {getFieldValue(['parts', partName, 'title']) || 'Untitled'}
            </strong>
          )}
        </Form.Item>
      ),
      extra: (
        <Popconfirm
          title="Delete this part?"
          description="This action cannot be undone."
          onConfirm={() => removePart(partName)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />
        </Popconfirm>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Form.Item name={[partName, 'title']} label="Part Title">
            <Input placeholder="e.g. Part 1 - Sentence Comprehension" />
          </Form.Item>

          <Form.Item name={[partName, 'content']} label={<Text strong>Reading Passage</Text>}>
            <TextArea rows={6} placeholder="Paste the reading passage here..." />
          </Form.Item>

          <div style={{ padding: 16, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <Form.List name={[partName, 'questions']}>
              {(qFields, { add: addQ, remove: removeQ }) => (
                <>
                  {qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => (
                    <Card
                      size="small"
                      type="inner"
                      key={qKey}
                      style={{ marginBottom: 16 }}
                      // 🔥 HIỂN THỊ CHỮ QUESTION 1, 2, 3 NỐI TIẾP NHAU
                      title={
                        <Form.Item shouldUpdate noStyle>
                          {() => {
                            const currentParts = form.getFieldValue('parts') || [];
                            let prevQuestionsCount = 0;
                            for (let i = 0; i < pIndex; i++) {
                              prevQuestionsCount += (currentParts[i]?.questions?.length || 0);
                            }
                            return `Question ${prevQuestionsCount + qIndex + 1}`;
                          }}
                        </Form.Item>
                      }
                      extra={
                        <Button danger type="text" size="small" onClick={() => removeQ(qName)}>
                          Remove
                        </Button>
                      }
                    >
                      <Row gutter={16} style={{ marginBottom: 12 }}>
                        <Col span={8}>
                          <Form.Item {...restQField} name={[qName, 'question_type']} label="Question Type" rules={[{ required: true }]}>
                            <Select>
                              <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
                              <Option value="FILL_IN_BLANKS">Fill in the Blanks</Option>
                              <Option value="MATCHING_OPINIONS">Matching Opinions (P3)</Option>
                              <Option value="MATCHING_HEADINGS">Matching Headings (P4)</Option>
                              <Option value="REORDER_SENTENCES">Reorder Sentences (P2)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item {...restQField} name={[qName, 'question_text']} label="Question / Prompt">
                            <Input placeholder="Enter question text or prompt..." />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const qType = getFieldValue(['parts', partName, 'questions', qName, 'question_type']);
                          const pathProps = {
                            relativePath: [qName],
                            absolutePath: ['parts', partName, 'questions', qName],
                            restField: restQField,
                            form: form
                          };

                          if (qType === 'REORDER_SENTENCES') return <ReorderSentencesAdmin {...pathProps} />;
                          if (qType === 'MATCHING_OPINIONS' || qType === 'MATCHING_HEADINGS') return <MatchingAdmin {...pathProps} />;
                          if (qType === 'FILL_IN_BLANKS') return <FillInBlankAdmin {...pathProps} />;
                          return <MultipleChoiceAdmin {...pathProps} />;
                        }}
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0' })}
                    block
                    icon={<PlusOutlined />}
                  >
                    ADD QUESTION
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        </div>
      )
    }));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/reading')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            <BookOutlined /> {isEditMode ? 'Edit' : 'Create'} Reading Test
          </Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large">
          Save Test
        </Button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        onFinishFailed={onFinishFailed} // 🔥 THÊM CẢNH BÁO LỖI
        preserve={true}                 // 🔥 GIỮ LẠI DỮ LIỆU BỊ ĐÓNG COLLAPSE
      >
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Aptis Reading Practice Test 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          {/* 🔥 ĐÃ THÊM: Ô NHẬP LƯU DESCRIPTION */}
          <Form.Item name="description" label="Test Description (Optional)">
            <TextArea 
              rows={3} 
              placeholder="Enter instructions, notes or a short description for this reading test..." 
              maxLength={500} 
              showCount 
            />
          </Form.Item>

          <Space size="large">
            <Form.Item name="is_published" valuePropName="checked" label="Status">
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item name="is_full_test_only" valuePropName="checked" label="Test Mode">
              <Switch checkedChildren="Mock Test" unCheckedChildren="Practice" />
            </Form.Item>
          </Space>
        </Card>

        <Card size="small" title="2. Part Content">
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => (
              <>
                <Collapse
                  activeKey={activePartKeys}
                  onChange={setActivePartKeys}
                  items={renderPartItems(partFields, removePart)}
                  style={{ marginBottom: 16 }}
                />
                <Button
                  type="primary"
                  ghost
                  onClick={() => {
                    addPart({ title: `Part ${partFields.length + 1}`, content: '', questions: [] });
                    // Tự động mở Part mới tạo
                    setActivePartKeys([...activePartKeys, partFields.length.toString()]);
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  ADD NEW PART
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default ReadingAptisEditPage;