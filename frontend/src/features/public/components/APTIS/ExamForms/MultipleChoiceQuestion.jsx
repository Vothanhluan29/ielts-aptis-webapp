import React from 'react';
import { Radio, Space, Typography } from 'antd';

const { Text } = Typography;

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
    <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
      <div className="mb-4">
        <Text strong className="text-slate-800 text-base">
          {questionNumber}. {questionText}
        </Text>
      </div>
      <Radio.Group 
        onChange={(e) => onChange(questionId, e.target.value)} 
        value={selectedValue} 
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          {optionsList.map((opt) => (
            <Radio 
              key={opt.value} 
              value={opt.value}
              className={`text-slate-600 text-base p-3 rounded-xl w-full border transition-all ${
                selectedValue === opt.value ? 'bg-emerald-50 border-emerald-400' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default MultipleChoiceQuestion;