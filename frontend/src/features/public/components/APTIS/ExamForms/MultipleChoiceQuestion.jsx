import React from 'react';
import { Radio, Space } from 'antd';

const NAVY = '#1E3A8A';
const NAVY_LIGHT = '#EFF4FF';
const NAVY_BORDER = '#BFDBFE';

const MultipleChoiceQuestion = ({ questionId, questionNumber, questionText, options, selectedValue, onChange }) => {
  let optionsList = [];
  if (options) {
    if (typeof options === 'object' && !Array.isArray(options)) {
      optionsList = Object.entries(options).map(([key, val]) => ({ value: key, label: `${key}. ${val}` }));
    } else if (Array.isArray(options)) {
      optionsList = options.map(opt => ({ value: opt, label: opt }));
    }
  }

  return (
    <div style={{
      padding: '28px 0',
      borderTop: '1px solid #E5E7EB',
    }}>
      {/* Question text */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
        <span style={{
          minWidth: 24, height: 24,
          background: NAVY, color: '#fff',
          borderRadius: 5, fontWeight: 700, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
        }}>
          {questionNumber}
        </span>
        <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500, lineHeight: 1.65 }}>
          {questionText}
        </span>
      </div>

      {/* Options */}
      <Radio.Group
        onChange={(e) => onChange(questionId, e.target.value)}
        value={selectedValue}
        style={{ width: '100%', paddingLeft: 34 }}
      >
        <Space direction="vertical" style={{ width: '100%', gap: 6 }}>
          {optionsList.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => onChange(questionId, opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 7,
                  border: `1px solid ${isSelected ? NAVY_BORDER : '#E5E7EB'}`,
                  background: isSelected ? NAVY_LIGHT : '#FAFAFA',
                  borderLeft: isSelected ? `3px solid ${NAVY}` : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Radio value={opt.value} style={{ margin: 0 }} />
                <span style={{
                  fontSize: 14, color: isSelected ? NAVY : '#374151',
                  fontWeight: isSelected ? 600 : 400, lineHeight: 1.5,
                }}>
                  {opt.label}
                </span>
              </div>
            );
          })}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default MultipleChoiceQuestion;