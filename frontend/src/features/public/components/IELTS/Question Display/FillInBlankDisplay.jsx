import React from 'react';

const FillInBlankDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  
  const handleChange = (e) => {
    // Lấy giá trị học viên gõ và cập nhật ngay lập tức
    const value = e.target.value;
    onAnswerChange(question.question_number, value);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {/* 1. Hiển thị số câu & Nội dung câu hỏi (Câu chứa chỗ trống) */}
      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
          {question.question_number}
        </div>
        <p className="text-[16px] font-medium text-slate-800 pt-1 m-0 leading-relaxed">
          {question.question_text || "Fill in the blank with NO MORE THAN THREE WORDS:"}
        </p>
      </div>

      {/* 2. Ô nhập liệu (Input) */}
      <div className="pl-11">
        <input
          type="text"
          value={currentAnswer || ''} // Hiển thị rỗng nếu chưa nhập
          onChange={handleChange}
          placeholder="Type your answer here..."
          className="w-full sm:w-2/3 p-3 text-[16px] border-2 border-slate-300 rounded-lg outline-none transition-all duration-200 text-slate-800 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          autoComplete="off"
          spellCheck="false" // Tắt bắt lỗi chính tả của trình duyệt để học viên tự lực cánh sinh
        />
      </div>
    </div>
  );
};

export default FillInBlankDisplay;