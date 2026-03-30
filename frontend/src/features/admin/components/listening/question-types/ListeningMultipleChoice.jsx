import React from 'react';

const ListeningMultipleChoice = ({ question, onChange }) => {
  const options = ['A', 'B', 'C', 'D']; // Có thể mở rộng thêm E, F nếu cần

  const handleOptionTextChange = (key, val) => {
    const currentOptions = question.options || {};
    onChange('options', { ...currentOptions, [key]: val });
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            {/* Nút chọn đáp án đúng */}
            <button
              type="button"
              onClick={() => onChange('correct_answer', opt)}
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs transition border ${
                question.correct_answer === opt
                  ? 'bg-green-500 text-white border-green-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-purple-400'
              }`}
              title="Click to mark as correct answer"
            >
              {opt}
            </button>

            {/* Input nội dung đáp án */}
            <input
              type="text"
              placeholder={`Option ${opt} text...`}
              className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none"
              value={question.options?.[opt] || ''}
              onChange={(e) => handleOptionTextChange(opt, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListeningMultipleChoice;