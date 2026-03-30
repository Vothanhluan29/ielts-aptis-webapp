import React from 'react';
import { Typography, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const FillInBlankQuestion = ({ 
  questionId, 
  questionNumber, 
  questionText, 
  selectedValue, 
  onChange 
}) => {
  
  const handleInputChange = (e) => {
    if (onChange) {
      onChange(questionId, e.target.value);
    }
  };

  // Render text và làm nổi bật các dấu gạch dưới (VD: ______) nếu có
  const renderFormattedText = (text) => {
    if (!text) return "Điền từ thích hợp vào chỗ trống:";
    // Tìm các chuỗi dấu gạch dưới liên tiếp (ví dụ: ___) và bôi màu cam nhạt để làm nổi bật
    const parts = text.split(/(_+)/g);
    return parts.map((part, index) => {
      if (part.includes('_')) {
        return <span key={index} className="text-orange-400 font-black tracking-widest">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
      
      {/* Tiêu đề câu hỏi */}
      <div className="flex gap-4 items-start mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-lg shrink-0">
          {questionNumber}
        </div>
        <div className="flex-1 mt-1">
          <Paragraph className="text-slate-800 text-base md:text-lg font-semibold m-0 leading-relaxed whitespace-pre-wrap">
            {renderFormattedText(questionText)}
          </Paragraph>
        </div>
      </div>

      {/* Ô nhập text */}
      <div className="pl-0 md:pl-14">
        <Input 
          size="large"
          prefix={<EditOutlined className="text-slate-400 mr-2" />}
          placeholder="Gõ câu trả lời của bạn vào đây..."
          value={selectedValue || ''}
          onChange={handleInputChange}
          autoComplete="off"
          spellCheck="false"
          className="w-full max-w-md rounded-xl border-slate-300 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 h-12 text-base font-medium text-slate-700 shadow-inner"
        />
      </div>
      
    </div>
  );
};

export default FillInBlankQuestion;