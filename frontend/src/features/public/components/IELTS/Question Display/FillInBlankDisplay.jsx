import React from 'react';

const FillInBlankDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    onAnswerChange(question.question_number, value);
  };

  return (
    <div className="mb-6 p-5 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 transition-all hover:shadow-md hover:border-indigo-200">
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm rounded-lg shadow-sm">
          {question.question_number}
        </div>
        <p className="text-[15px] font-semibold text-slate-800 pt-1.5 m-0 leading-relaxed">
          {question.question_text || "Fill in the blank with NO MORE THAN THREE WORDS:"}
        </p>
      </div>

      <div className="pl-11">
        <input
          type="text"
          value={currentAnswer || ''}
          onChange={handleChange}
          placeholder="Type your answer here..."
          className="w-full sm:w-2/3 p-3 text-[15px] rounded-lg border-2 border-slate-200 outline-none transition-all duration-200 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50 focus:bg-white"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default FillInBlankDisplay;