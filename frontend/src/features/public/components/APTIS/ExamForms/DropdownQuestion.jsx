import React from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;

const DropdownQuestion = ({ questionId, questionNumber, questionText, options, selectedValue, onChange }) => {
  // 1. Chuẩn hóa dữ liệu options từ Backend
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (error) {
      parsedOptions = {error: "Invalid options format", errorDetails: error.message};
    }
  }

  // 2. Chuyển đổi thành định dạng mảng object { value, label } cho thẻ Select của Ant Design
  let selectOptions = [];
  if (parsedOptions) {
    if (typeof parsedOptions === 'object' && !Array.isArray(parsedOptions)) {
      // Trường hợp: options là Object {"A": "Big", "B": "Small", "C": "Large"}
      selectOptions = Object.entries(parsedOptions).map(([key, val]) => ({
        value: key, // Lưu key (VD: "A") vào DB khi submit
        label: `${key}. ${val}` // Hiển thị "A. Big" trên UI
      }));
    } else if (Array.isArray(parsedOptions)) {
      // Trường hợp dự phòng: options là Mảng ["Big", "Small", "Large"]
      selectOptions = parsedOptions.map(opt => ({
        value: opt,
        label: opt
      }));
    }
  }

  return (
    <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* CỘT TRÁI: Câu hỏi */}
      <div className="flex-1">
        <Text strong className="text-slate-800 text-base">
          {questionNumber}. {questionText}
        </Text>
      </div>

      {/* CỘT PHẢI: Dropdown chọn đáp án */}
      <div className="w-full md:w-72 shrink-0">
        <Select
          showSearch
          allowClear
          placeholder="Chọn đáp án..."
          className="w-full"
          size="large"
          value={selectedValue || null}
          onChange={(value) => onChange(questionId, value || "")}
          options={selectOptions}
          // Hỗ trợ tìm kiếm nhanh đáp án khi gõ chữ
          filterOption={(input, option) => 
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    </div>
  );
};

export default DropdownQuestion;