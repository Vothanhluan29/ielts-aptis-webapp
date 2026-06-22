import React from 'react';

const TrueFalseDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  const isYesNo = question.question_type === 'YES_NO_NOT_GIVEN';
  const options = isYesNo 
    ? ['YES', 'NO', 'NOT GIVEN'] 
    : ['TRUE', 'FALSE', 'NOT GIVEN'];

  const handleSelect = (val) => {
    if (currentAnswer === val) {
      onAnswerChange(question.question_number, ""); 
    } else {
      onAnswerChange(question.question_number, val);
    }
  };

  return (
    <div className="mb-6 p-5 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 transition-all hover:shadow-md hover:border-indigo-200">
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm rounded-lg shadow-sm">
          {question.question_number}
        </div>
        <p className="text-[15px] font-semibold text-slate-800 pt-1.5 m-0 leading-relaxed">
          {question.question_text || "Do the following statements agree with the information given in the reading passage?"}
        </p>
      </div>

      <div className="pl-11 flex flex-col sm:flex-row gap-3">
        {options.map((opt) => {
          const isSelected = currentAnswer === opt;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 uppercase tracking-wider border-2 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white'}`}
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