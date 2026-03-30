import React from 'react';
import { Form, Input, Typography, Card, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Fill in the blank / Short answer component for Admin
 * @param {Array} relativePath - Relative path for UI
 * @param {Object} restField - Rest field props from Form.List
 */
const FillInBlankAdmin = ({ relativePath, restField }) => {
  return (
    <Card size="small" type="inner" style={{ marginBottom: 12, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ color: '#166534' }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Short Answer / Fill in the Blank Configuration
        </Text>
        <div style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Enter the correct answer in the field below. If multiple answers are accepted (e.g., both numbers and words), separate them using a vertical bar <Tag color="green">|</Tag>. 
            <br/>
            Example: <Text code>15 | fifteen | fifteen dollars</Text>
          </Text>
        </div>
      </div>

      {/* For this type, we store the answer directly in correct_answer, no options table needed */}
      <Form.Item
        {...restField}
        name={[...relativePath, 'correct_answer']}
        label={<Text strong>Correct Answer</Text>}
        rules={[{ required: true, message: 'Please enter the correct answer!' }]}
        style={{ marginBottom: 0 }}
      >
        <Input 
          size="large" 
          placeholder="Enter answer... (e.g., apple | apples)" 
          style={{ borderColor: '#86efac' }}
        />
      </Form.Item>
    </Card>
  );
};

export default FillInBlankAdmin;