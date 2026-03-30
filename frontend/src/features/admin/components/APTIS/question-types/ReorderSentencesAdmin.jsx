import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Typography, message, Space, Card, Tooltip } from 'antd';
import { 
  ThunderboltOutlined, PlusOutlined, DeleteOutlined, 
  ArrowUpOutlined, ArrowDownOutlined, OrderedListOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Reorder Sentences component for Admin
 * Suitable for Reading Part 2 (Reorder Sentences)
 */
const ReorderSentencesAdmin = ({ relativePath, absolutePath, form }) => {
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // 🔥 FIX HOOK: use Form.useWatch at top level
  const currentOptions = Form.useWatch([...absolutePath, 'options'], form);
  const optionsLength = currentOptions?.length || 0;

  // 🔥 ĐÃ SỬA LỖI: Chỉ auto-update correct_answer khi số lượng câu thay đổi
  useEffect(() => {
    if (optionsLength > 0) {
      const currentCorrect = form.getFieldValue([...absolutePath, 'correct_answer']);
      
      // Chuyển currentCorrect thành mảng để check độ dài
      let currentCorrectArray = [];
      if (Array.isArray(currentCorrect)) {
        currentCorrectArray = currentCorrect;
      } else if (typeof currentCorrect === 'string' && currentCorrect.length > 0) {
        currentCorrectArray = currentCorrect.split(',');
      }

      // CHỈ TẠO LẠI MẢNG DEFAULT ["0", "1", "2", "3"] NẾU:
      // 1. correct_answer đang rỗng (Câu hỏi mới tạo)
      // 2. Hoặc độ dài của correct_answer khác với số lượng options (Vừa thêm/xóa câu)
      if (currentCorrectArray.length !== optionsLength) {
        const newCorrectArray = Array.from({ length: optionsLength }, (_, i) => i.toString());
        form.setFieldValue([...absolutePath, 'correct_answer'], newCorrectArray);
      }
    } else {
      // Đặt về mảng rỗng thay vì chuỗi rỗng để đồng bộ với Component
      form.setFieldValue([...absolutePath, 'correct_answer'], []);
    }
  }, [optionsLength, absolutePath, form]);

  const handleQuickPaste = () => {
    if (!pasteText.trim()) return;
    
    const lines = pasteText.split('\n').filter(line => line.trim() !== '');
    const cleanSentences = lines.map(line =>
      line.trim().replace(/^([a-zA-Z0-9]+)[.)-]\s+/, '')
    );
    
    form.setFieldValue([...absolutePath, 'options'], cleanSentences);

    setIsPasteModalOpen(false);
    setPasteText('');
    message.success(`Added ${cleanSentences.length} sentences automatically!`);
  };

  return (
    <Card size="small" type="inner" style={{ marginBottom: 12, backgroundColor: '#fdf8f6', borderColor: '#fef08a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ color: '#ca8a04', fontSize: 15 }}>
          <OrderedListOutlined style={{ marginRight: 8 }} />
          Sentence List (Enter in CORRECT order)
        </Text>
        <Button 
          size="small" type="primary" ghost icon={<ThunderboltOutlined />}
          onClick={() => setIsPasteModalOpen(true)}
          style={{ borderColor: '#ca8a04', color: '#ca8a04' }}
        >
          Quick paste paragraph
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          The system will save the order you enter as the correct answer. When users take the test, the sentences will be randomly shuffled.
        </Text>
      </div>

      {/* DRAGGABLE / REORDERABLE SENTENCE LIST */}
      <Form.List name={[...relativePath, 'options']}>
        {(fields, { add, remove, move }) => (
          <>
            {fields.map(({ key, name, ...restOptionField }, index) => (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                
                {/* MOVE BUTTONS */}
                <Space direction="vertical" size={2}>
                  <Tooltip title="Move up">
                    <Button 
                      size="small" icon={<ArrowUpOutlined />} 
                      disabled={index === 0} 
                      onClick={() => move(index, index - 1)} 
                    />
                  </Tooltip>
                  <Tooltip title="Move down">
                    <Button 
                      size="small" icon={<ArrowDownOutlined />} 
                      disabled={index === fields.length - 1} 
                      onClick={() => move(index, index + 1)} 
                    />
                  </Tooltip>
                </Space>

                <div style={{ flex: 1 }}>
                  <Form.Item
                    {...restOptionField}
                    name={[name]}
                    rules={[{ required: true, message: 'Please enter the sentence!' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <TextArea 
                      autoSize={{ minRows: 2, maxRows: 4 }} 
                      placeholder={`Sentence ${index + 1}...`} 
                      style={{ borderColor: '#fde047' }}
                    />
                  </Form.Item>
                </div>

                {/* DELETE BUTTON */}
                <Tooltip title="Delete this sentence">
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                </Tooltip>
              </div>
            ))}

            <Button 
              type="dashed" 
              onClick={() => add('')} 
              icon={<PlusOutlined />} 
              style={{ width: '100%', marginTop: 8, borderColor: '#facc15', color: '#a16207' }}
            >
              Add a new sentence
            </Button>
          </>
        )}
      </Form.List>

      {/* HIDDEN CORRECT ANSWER (AUTO GENERATED OR UPDATED FROM DB) */}
      <Form.Item name={[...relativePath, 'correct_answer']} hidden>
        <Input />
      </Form.Item>

      {/* QUICK PASTE MODAL */}
      <Modal
        title="Quick paste paragraph"
        open={isPasteModalOpen}
        onOk={handleQuickPaste}
        onCancel={() => { setIsPasteModalOpen(false); setPasteText(''); }}
        width={600}
        okText="Auto split sentences"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">
            Copy a properly formatted paragraph, place each sentence on a new line, then paste it here. The system will automatically generate the list in the correct order.
          </Text>
        </div>
        <TextArea 
          rows={8} 
          value={pasteText} 
          onChange={(e) => setPasteText(e.target.value)} 
          placeholder={`Example:\nFirst, he wakes up.\nThen, he brushes his teeth.\nNext, he goes to work.\nFinally, he returns home.`}
        />
      </Modal>
    </Card>
  );
};

export default ReorderSentencesAdmin;