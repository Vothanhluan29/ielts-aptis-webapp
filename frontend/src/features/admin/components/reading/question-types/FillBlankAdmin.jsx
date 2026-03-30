import React from 'react';

const FillBlankAdmin = ({ question, onChange }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
      <div>
        <label className="text-xs font-bold text-green-700 block mb-1">
          Correct Answer
        </label>
        <input 
          type="text" 
          value={question.correct_answer}
          onChange={(e) => onChange('correct_answer', e.target.value)}
          className="w-full p-2 border border-green-300 bg-green-50 rounded text-sm font-bold text-green-800 placeholder-green-800/40"
          placeholder="Enter the exact word..."
        />
        <p className="text-[10px] text-gray-500 mt-1">
          * If multiple answers are acceptable, separate them using a slash <b>/</b> or a vertical bar <b>|</b>.
          <br /> Example: <b>car/automobile</b>
        </p>
      </div>
    </div>
  );
};

export default FillBlankAdmin;
