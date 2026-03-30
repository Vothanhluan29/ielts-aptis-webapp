import React, { useState } from 'react';
import { Form, Input, Radio, Row, Col, Button, Modal, Typography, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const MultipleChoiceAdmin = ({ relativePath, absolutePath, restField, form }) => {
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleQuickPaste = () => {
    if (!pasteText.trim()) return;
    
    const lines = pasteText.split('\n').filter(line => line.trim() !== '');
    lines.forEach((line, i) => {
      if (i < 3) { 
        let cleanText = line.trim().replace(/^([a-zA-Z0-9]+)[.)-]\s+/, '');
        // 🔥 setFieldValue requires ABSOLUTE path
        form.setFieldValue([...absolutePath, 'options', i], cleanText);
      }
    });

    setIsPasteModalOpen(false);
    setPasteText('');
    message.success('Options have been auto-filled!');
  };

  return (
    <>
      <Form.Item 
        label={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span>Options (Select the correct answer using the radio button)</span>
            <Button 
              size="small" 
              type="link" 
              icon={<ThunderboltOutlined />}
              onClick={() => setIsPasteModalOpen(true)}
              style={{ fontWeight: 'bold' }}
            >
              Quick paste options
            </Button>
          </div>
        }
        required 
        style={{ marginBottom: 12 }}
      >
        {/* 🔥 UI uses RELATIVE path because it's inside Form.List */}
        <Form.Item 
          name={[...relativePath, 'correct_answer']} 
          noStyle 
          rules={[{ required: true, message: 'Please select the correct answer!' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Row gutter={12}>
              {[
                { label: 'A', idx: 0 },
                { label: 'B', idx: 1 },
                { label: 'C', idx: 2 },
              ].map(({ label, idx }) => (
                <Col span={8} key={idx}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Radio value={idx.toString()} style={{ marginTop: 8 }} />
                    <Form.Item
                      {...restField}
                      name={[...relativePath, 'options', idx]}
                      rules={[{ required: true, message: `Enter Option ${label}` }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder={`Option ${label}`} />
                    </Form.Item>
                  </div>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
      </Form.Item>

      <Modal
        title="Quick paste options"
        open={isPasteModalOpen}
        onOk={handleQuickPaste}
        onCancel={() => { setIsPasteModalOpen(false); setPasteText(''); }}
        width={500}
        okText="Auto fill"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">
            Copy 3 options from Word/PDF and paste them here (each option on a new line).
          </Text>
        </div>
        <TextArea 
          rows={5} 
          value={pasteText} 
          onChange={(e) => setPasteText(e.target.value)} 
          placeholder={`Example:\nA. 1990\nB. 1995\nC. 2000`}
        />
      </Modal>
    </>
  );
};

export default MultipleChoiceAdmin;