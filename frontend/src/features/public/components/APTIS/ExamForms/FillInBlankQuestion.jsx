import React from 'react';
import { Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const NAVY = '#1E3A8A';

const FillInBlankQuestion = ({
  questionId,
  questionNumber,
  questionText,
  selectedValue,
  onChange
}) => {
  const handleInputChange = (e) => {
    if (onChange) onChange(questionId, e.target.value);
  };

  const renderFormattedText = (text) => {
    if (!text) return "Fill in the appropriate word in the blank:";
    const parts = text.split(/(_+)/g);
    return parts.map((part, index) => {
      if (part.includes('_')) {
        return (
          <span key={index} style={{
            color: NAVY, fontWeight: 700,
            letterSpacing: '0.1em', textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div style={{ padding: '28px 0', borderTop: '1px solid #E5E7EB' }}>

      {/* Question text */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{
          minWidth: 24, height: 24,
          background: NAVY, color: '#fff',
          borderRadius: 5, fontWeight: 700, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
        }}>
          {questionNumber}
        </span>
        <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {renderFormattedText(questionText)}
        </span>
      </div>

      {/* Input */}
      <div style={{ paddingLeft: 34 }}>
        <Input
          size="large"
          prefix={<EditOutlined style={{ color: '#9CA3AF', marginRight: 4 }} />}
          placeholder="Type your answer here..."
          value={selectedValue || ''}
          onChange={handleInputChange}
          autoComplete="off"
          spellCheck="false"
          style={{
            width: '100%', maxWidth: 340,
            borderRadius: 7, fontSize: 14,
            fontWeight: 500, color: '#1F2937',
          }}
        />
      </div>
    </div>
  );
};

export default FillInBlankQuestion;