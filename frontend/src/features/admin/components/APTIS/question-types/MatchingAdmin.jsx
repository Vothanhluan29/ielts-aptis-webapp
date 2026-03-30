import React, { useState } from 'react';
import { Form, Input, Button, Modal, Typography, message, Space, Select, Card } from 'antd';
import { ThunderboltOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

/**
 * Matching component for Admin
 * Suitable for Reading Part 3 (People matching), Part 4 (Heading matching)
 * @param {Array} relativePath - Relative path for UI
 * @param {Array} absolutePath - Absolute path for paste handling
 * @param {Object} form - Form instance
 */
const MatchingAdmin = ({ relativePath, absolutePath, form }) => {
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Smart paste handler: automatically generates options based on pasted lines
  const handleQuickPaste = () => {
    if (!pasteText.trim()) return;
    
    const lines = pasteText.split('\n').filter(line => line.trim() !== '');
    const cleanOptions = lines.map(line =>
      line.trim().replace(/^([a-zA-Z0-9]+)[.)-]\s+/, '')
    );
    
    // Overwrite all options
    form.setFieldValue([...absolutePath, 'options'], cleanOptions);
    
    // Reset correct answer since options changed
    form.setFieldValue([...absolutePath, 'correct_answer'], undefined);

    setIsPasteModalOpen(false);
    setPasteText('');
    message.success(`Added ${cleanOptions.length} options automatically!`);
  };

  return (
    <Card size="small" type="inner" style={{ marginBottom: 12, backgroundColor: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 12 }}>
        <Text strong>Options List (Headings / Opinions)</Text>
        <Button 
          size="small" type="primary" ghost icon={<ThunderboltOutlined />}
          onClick={() => setIsPasteModalOpen(true)}
        >
          Quick Paste List
        </Button>
      </div>

      {/* 1. DYNAMIC OPTIONS LIST */}
      <Form.List name={[...relativePath, 'options']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restOptionField }, index) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restOptionField}
                  name={[name]}
                  rules={[{ required: true, message: 'Option cannot be empty!' }]}
                  style={{ marginBottom: 0, width: '400px' }}
                >
                  <Input placeholder={`Option ${index + 1} (e.g., Heading ${index + 1})`} />
                </Form.Item>
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
              </Space>
            ))}
            <Button 
              type="dashed" 
              onClick={() => add('')} 
              icon={<PlusOutlined />} 
              style={{ width: '400px', marginTop: 8 }}
            >
              Add an option
            </Button>
          </>
        )}
      </Form.List>

      {/* 2. SELECT CORRECT ANSWER */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const currentOptions = form.getFieldValue([...absolutePath, 'options']) || [];
            
            return (
              <Form.Item 
                name={[...relativePath, 'correct_answer']} 
                label={<Text strong style={{ color: '#16a34a' }}>Select the correct answer:</Text>}
                rules={[{ required: true, message: 'Please select the correct answer!' }]}
                style={{ marginBottom: 0 }}
              >
                <Select placeholder="-- Select an answer --" style={{ width: '400px' }}>
                  {currentOptions.map((optText, idx) => (
                    <Option key={idx} value={idx.toString()}>
                      {optText
                        ? `Option ${idx + 1}: ${optText.substring(0, 40)}${optText.length > 40 ? '...' : ''}`
                        : `Option ${idx + 1} (Empty)`
                      }
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }}
        </Form.Item>
      </div>

      {/* QUICK PASTE MODAL */}
      <Modal
        title="Quick paste options list (Matching)"
        open={isPasteModalOpen}
        onOk={handleQuickPaste}
        onCancel={() => { setIsPasteModalOpen(false); setPasteText(''); }}
        width={600}
        okText="Auto Fill"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">
            Copy the full list of headings or opinions from Word/PDF and paste it here. Each option should be on a new line. <br/>
            <Text type="danger">Note: This will overwrite the current options.</Text>
          </Text>
        </div>
        <TextArea 
          rows={7} 
          value={pasteText} 
          onChange={(e) => setPasteText(e.target.value)} 
          placeholder={`Example:\nA. The importance of local food\nB. Historical architecture\nC. Future city planning\nD. Transportation issues`}
        />
      </Modal>
    </Card>
  );
};

export default MatchingAdmin;