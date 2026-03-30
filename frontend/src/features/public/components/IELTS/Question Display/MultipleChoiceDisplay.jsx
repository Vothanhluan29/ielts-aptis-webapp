import React from 'react';

const MultipleChoiceDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  // Lấy danh sách options từ API (A, B, C, D)
  const optionsObj = question.options || {};
  const optionsEntries = Object.entries(optionsObj).sort((a, b) => a[0].localeCompare(b[0]));
  
  // Xử lý bài toán: Chọn 1 đáp án (Multiple Choice) hay Chọn nhiều (Multiple Answer)
  const isMultipleAnswer = question.question_type === 'MULTIPLE_ANSWER';

  const handleSelect = (key) => {
    if (isMultipleAnswer) {
      // Logic tick nhiều ô (A và C)
      let newAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      if (newAnswers.includes(key)) {
        newAnswers = newAnswers.filter(k => k !== key); // Bỏ tick
      } else {
        newAnswers.append(key); // Tick thêm
      }
      onAnswerChange(question.question_number, newAnswers);
    } else {
      // Logic tick 1 ô (Radio)
      onAnswerChange(question.question_number, key);
    }
  };

  // Đảm bảo currentAnswer là mảng để tiện dùng .includes()
  const answerArray = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer].filter(Boolean);

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {/* 1. Hiển thị số câu và nội dung câu hỏi */}
      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
          {question.question_number}
        </div>
        <p className="text-[16px] font-medium text-slate-800 pt-1 m-0">
          {question.question_text || "Choose the correct option:"}
        </p>
      </div>

      {/* 2. Hiển thị danh sách các lựa chọn A, B, C, D để click */}
      <div className="space-y-3 pl-11">
        {optionsEntries.map(([key, value]) => {
          const isSelected = answerArray.includes(key);

          return (
            <div 
              key={key}
              onClick={() => handleSelect(key)}
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }
              `}
            >
              {/* Vòng tròn đánh dấu (Radio / Checkbox UI) */}
              <div className={`
                w-6 h-6 shrink-0 mt-0.5 rounded flex items-center justify-center border-2 transition-colors
                ${isMultipleAnswer ? 'rounded-md' : 'rounded-full'} 
                ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'}
              `}>
                <span className="text-xs font-bold">{key}</span>
              </div>
              
              {/* Nội dung đáp án */}
              <span className={`text-[15px] leading-relaxed ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceDisplay;