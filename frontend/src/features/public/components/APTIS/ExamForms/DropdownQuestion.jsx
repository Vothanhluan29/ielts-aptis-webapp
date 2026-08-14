import React from 'react';
import { Select } from 'antd';

const NAVY = '#1E3A8A';

const DropdownQuestion = ({ questionId, questionNumber, questionText, options, selectedValue, onChange }) => {
  // Normalize options
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (error) {
      parsedOptions = { error: "Invalid options format", errorDetails: error.message };
    }
  }

  let selectOptions = [];
  if (parsedOptions) {
    if (typeof parsedOptions === 'object' && !Array.isArray(parsedOptions)) {
      selectOptions = Object.entries(parsedOptions).map(([key, val]) => ({
        value: key,
        label: `${key}. ${val}`
      }));
    } else if (Array.isArray(parsedOptions)) {
      selectOptions = parsedOptions.map(opt => ({ value: opt, label: opt }));
    }
  }

  return (
    <div style={{
      padding: '28px 0',
      borderTop: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Question text */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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

      {/* Dropdown */}
      <div style={{ paddingLeft: 34 }}>
        <Select
          showSearch
          allowClear
          placeholder="Select an answer..."
          size="large"
          style={{ width: '100%', maxWidth: 340 }}
          value={selectedValue || null}
          onChange={(value) => onChange(questionId, value || '')}
          options={selectOptions}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    </div>
  );
};

export default DropdownQuestion;