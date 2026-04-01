import React from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;

const DropdownQuestion = ({ questionId, questionNumber, questionText, options, selectedValue, onChange }) => {
  // 1. Normalize options data from Backend
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (error) {
      parsedOptions = {error: "Invalid options format", errorDetails: error.message};
    }
  }

  // 2. Convert to array object format { value, label } for Ant Design Select component
  let selectOptions = [];
  if (parsedOptions) {
    if (typeof parsedOptions === 'object' && !Array.isArray(parsedOptions)) {
      // Case: options is an Object {"A": "Big", "B": "Small", "C": "Large"}
      selectOptions = Object.entries(parsedOptions).map(([key, val]) => ({
        value: key, // Save key (e.g., "A") to DB when submitting
        label: `${key}. ${val}` // Display "A. Big" on UI
      }));
    } else if (Array.isArray(parsedOptions)) {
      // Fallback case: options is an Array ["Big", "Small", "Large"]
      selectOptions = parsedOptions.map(opt => ({
        value: opt,
        label: opt
      }));
    }
  }

  return (
    <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* LEFT COLUMN: Question */}
      <div className="flex-1">
        <Text strong className="text-slate-800 text-base">
          {questionNumber}. {questionText}
        </Text>
      </div>

      {/* RIGHT COLUMN: Answer dropdown */}
      <div className="w-full md:w-72 shrink-0">
        <Select
          showSearch
          allowClear
          placeholder="Select an answer..."
          className="w-full"
          size="large"
          value={selectedValue || null}
          onChange={(value) => onChange(questionId, value || "")}
          options={selectOptions}
          // Support quick answer search when typing
          filterOption={(input, option) => 
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    </div>
  );
};

export default DropdownQuestion;