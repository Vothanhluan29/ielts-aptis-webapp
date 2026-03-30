import React from 'react';

const ListeningFillBlank = ({ question, onChange }) => {
  return (
    <div className="mt-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <label className="text-xs font-bold text-yellow-700 uppercase mb-1 block">
        Correct Answer(s)
      </label>
      <input
        type="text"
        placeholder="e.g. 15 minutes | fifteen minutes"
        className="w-full p-2 border border-yellow-300 rounded text-sm focus:border-yellow-500 outline-none font-medium text-gray-700"
        value={question.correct_answer || ''}
        onChange={(e) => onChange('correct_answer', e.target.value)}
      />
      <div className="mt-2 text-[10px] text-yellow-800 bg-yellow-100 p-2 rounded">
        <strong>Tip:</strong> Use the vertical bar "<strong>|</strong>" to separate acceptable answers.
        <br />
        Example: <em>bus|coach</em> means both "bus" and "coach" are correct.
      </div>
    </div>
  );
};

export default ListeningFillBlank;
