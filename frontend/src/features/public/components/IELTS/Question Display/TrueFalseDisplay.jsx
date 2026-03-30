import React from 'react';

const TrueFalseDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  // Tự động nhận diện nhãn nút dựa trên loại câu hỏi
  const isYesNo = question.question_type === 'YES_NO_NOT_GIVEN';
  const options = isYesNo 
    ? ['YES', 'NO', 'NOT GIVEN'] 
    : ['TRUE', 'FALSE', 'NOT GIVEN'];

  const handleSelect = (val) => {
    // Nếu click lại vào đáp án đang chọn thì hủy chọn (trở về rỗng)
    if (currentAnswer === val) {
      onAnswerChange(question.question_number, ""); 
    } else {
      onAnswerChange(question.question_number, val);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {/* 1. Hiển thị số câu & Nội dung */}
      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
          {question.question_number}
        </div>
        <p className="text-[16px] font-medium text-slate-800 pt-1 m-0 leading-relaxed">
          {question.question_text || "Do the following statements agree with the information given in the reading passage?"}
        </p>
      </div>

      {/* 2. Hiển thị 3 nút chọn */}
      <div className="pl-11 flex flex-col sm:flex-row gap-3">
        {options.map((opt) => {
          const isSelected = currentAnswer === opt;

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 font-bold text-[14px] transition-all duration-200 uppercase tracking-wide
                ${isSelected 
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-white'}
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrueFalseDisplay;