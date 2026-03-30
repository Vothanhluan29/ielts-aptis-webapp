import React from 'react';
import { Check, X, Minus } from 'lucide-react';

const TrueFalseAdmin = ({ question, onChange }) => {
  const isYesNo = question.question_type === 'YES_NO_NOT_GIVEN';
  
  // Display label configuration
  const options = isYesNo 
    ? [
        { value: 'YES', label: 'YES', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
        { value: 'NO', label: 'NO', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
        { value: 'NOT GIVEN', label: 'NOT GIVEN', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Minus },
      ]
    : [
        { value: 'TRUE', label: 'TRUE', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
        { value: 'FALSE', label: 'FALSE', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
        { value: 'NOT GIVEN', label: 'NOT GIVEN', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Minus },
      ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
        Select the correct answer:
      </p>
      
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = question.correct_answer === opt.value;
          
          return (
            <button
              key={opt.value}
              onClick={() => onChange('correct_answer', opt.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-bold text-sm
                ${isSelected 
                  ? `${opt.color} border-current shadow-sm scale-105` 
                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'}
              `}
            >
              {isSelected && <Icon size={14} strokeWidth={3} />}
              {opt.label}
            </button>
          );
        })}
      </div>
      
      {!question.correct_answer && (
        <p className="text-xs text-red-500 italic mt-1">
          * Please select one answer.
        </p>
      )}
    </div>
  );
};

export default TrueFalseAdmin;
