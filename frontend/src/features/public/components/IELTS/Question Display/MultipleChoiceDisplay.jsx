import React from 'react';

const MultipleChoiceDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  const optionsObj = question.options || {};
  const optionsEntries = Object.entries(optionsObj).sort((a, b) => a[0].localeCompare(b[0]));
  
  const isMultipleAnswer = question.question_type === 'MULTIPLE_ANSWER';

  const handleSelect = (key) => {
    if (isMultipleAnswer) {
      let newAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      if (newAnswers.includes(key)) {
        newAnswers = newAnswers.filter(k => k !== key);
      } else {
        newAnswers.push(key);
      }
      onAnswerChange(question.question_number, newAnswers);
    } else {
      onAnswerChange(question.question_number, key);
    }
  };

  const answerArray = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer].filter(Boolean);

  return (
    <div className="mb-6 p-5 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 transition-all hover:shadow-md hover:border-indigo-200">
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm rounded-lg shadow-sm">
          {question.question_number}
        </div>
        <p className="text-[15px] font-semibold text-slate-800 pt-1.5 m-0 leading-relaxed">
          {question.question_text || "Choose the correct option:"}
        </p>
      </div>

      <div className="space-y-3 pl-11">
        {optionsEntries.map(([key, value]) => {
          const isSelected = answerArray.includes(key);

          return (
            <div 
              key={key}
              onClick={() => handleSelect(key)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-300 hover:bg-white'}`}
            >
              <div className={`w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center transition-all ${isMultipleAnswer ? 'rounded-md border-2' : 'rounded-full border-2'} ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                <span className="text-[10px] font-bold">{key}</span>
              </div>
              <span className={`text-[15px] leading-relaxed ${isSelected ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>
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