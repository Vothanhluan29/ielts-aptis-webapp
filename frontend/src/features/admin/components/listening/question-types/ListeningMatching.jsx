import React, { useState } from 'react';
import { Plus, Trash, Wand2, Check, Circle } from 'lucide-react';

// Helper: convert number to Roman / Alpha (unchanged)
const toRoman = (num) => {
  const lookup = { m:1000, cm:900, d:500, cd:400, c:100, xc:90, l:50, xl:40, x:10, ix:9, v:5, iv:4, i:1 };
  let roman = '';
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman.toLowerCase();
};
const toAlpha = (num) => String.fromCharCode(64 + num);

const ListeningMatching = ({ question, onChange }) => {
  const optionsArray = question.options ? Object.entries(question.options) : [];
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkType, setBulkType] = useState('roman');

  // --- HANDLERS ---
  const handleAddOption = () => {
    const newOptions = { ...question.options, "": "" };
    onChange('options', newOptions);
  };

  const handleUpdateOption = (oldKey, newKey, newValue) => {
    const newOptions = { ...question.options };

    // If key is renamed (e.g. i -> v)
    if (oldKey !== newKey) {
      delete newOptions[oldKey];

      // If the old key was the correct answer, update it
      if (question.correct_answer === oldKey) {
        onChange('correct_answer', newKey);
      }
    }

    newOptions[newKey] = newValue;
    onChange('options', newOptions);
  };

  const handleDeleteOption = (key) => {
    const newOptions = { ...question.options };
    delete newOptions[key];
    onChange('options', newOptions);

    // Reset if the correct answer was deleted
    if (question.correct_answer === key) onChange('correct_answer', '');
  };

  // Select correct answer directly
  const handleSelectCorrect = (key) => {
    if (question.correct_answer === key) {
      onChange('correct_answer', '');
    } else {
      onChange('correct_answer', key);
    }
  };

  // --- BULK HANDLER ---
  const handleBulkProcess = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    const newOptions = {};

    lines.forEach((line, index) => {
      let key = '';
      if (bulkType === 'roman') key = toRoman(index + 1);
      else if (bulkType === 'alpha') key = toAlpha(index + 1);
      else key = `${index + 1}`;

      let cleanContent = line.trim();
      const prefixRegex = /^([a-zA-Z0-9]+)[.)]\s+/;
      cleanContent = cleanContent.replace(prefixRegex, '');
      newOptions[key] = cleanContent;
    });

    onChange('options', newOptions);
    setIsBulkMode(false);
    setBulkText('');
  };

  return (
    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-purple-700 uppercase">
          Option List
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsBulkMode(!isBulkMode)}
            className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded transition font-medium ${
              isBulkMode
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Wand2 size={12} /> {isBulkMode ? 'Close bulk input' : 'Bulk input'}
          </button>

          {!isBulkMode && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs flex items-center gap-1 bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-50"
            >
              <Plus size={12} /> Add row
            </button>
          )}
        </div>
      </div>

      {/* --- BODY --- */}
      {isBulkMode ? (
        /* BULK MODE UI */
        <div className="bg-white p-4 rounded border border-purple-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex gap-4 mb-3 text-sm">
            <span className="font-bold text-gray-600">Numbering style:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={bulkType === 'roman'}
                onChange={() => setBulkType('roman')}
                name="bulkType"
              />
              <span>Roman (i, ii)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={bulkType === 'alpha'}
                onChange={() => setBulkType('alpha')}
                name="bulkType"
              />
              <span>Alphabet (A, B)</span>
            </label>
          </div>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm h-40 focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Paste the list here..."
          />

          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={() => setIsBulkMode(false)}
              className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkProcess}
              className="px-4 py-1.5 bg-purple-600 text-white rounded text-sm font-bold hover:bg-purple-700"
            >
              Generate list
            </button>
          </div>
        </div>
      ) : (
        /* LIST MODE UI */
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {optionsArray.map(([key, val], idx) => {
            const isCorrect = question.correct_answer === key;

            return (
              <div key={idx} className="flex gap-2 items-center group">

                {/* Select correct answer */}
                <button
                  type="button"
                  onClick={() => handleSelectCorrect(key)}
                  title="Click to select as the correct answer"
                  className={`
                    w-8 h-8 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      isCorrect
                        ? 'bg-green-500 border-green-600 text-white shadow-md scale-110'
                        : 'border-gray-300 text-gray-300 hover:border-purple-400 hover:text-purple-400 bg-white'
                    }
                  `}
                >
                  {isCorrect ? <Check size={16} strokeWidth={3} /> : <Circle size={16} />}
                </button>

                {/* Key input */}
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleUpdateOption(key, e.target.value, val)}
                  className={`
                    w-16 p-2 border rounded text-xs font-bold text-center outline-none transition
                    ${
                      isCorrect
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-purple-400'
                    }
                  `}
                  placeholder="Key"
                />

                {/* Value input */}
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleUpdateOption(key, key, e.target.value)}
                  className={`
                    flex-1 p-2 border rounded text-sm outline-none transition
                    ${
                      isCorrect
                        ? 'border-green-400 bg-green-50/30'
                        : 'border-gray-300 focus:border-purple-400'
                    }
                  `}
                  placeholder="Option content..."
                />

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteOption(key)}
                  className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash size={16} />
                </button>
              </div>
            );
          })}

          {optionsArray.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded text-gray-400 text-sm">
              No options yet.<br />
              Click “Bulk input” or “Add row”.
            </div>
          )}
        </div>
      )}

      {/* FOOTER: RESULT DISPLAY (read-only) */}
      <div className="mt-4 pt-4 border-t border-purple-100">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-gray-600">Correct answer:</span>
          {question.correct_answer ? (
            <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full font-bold border border-green-200 flex items-center gap-1">
              <Check size={12} /> {question.correct_answer}
            </span>
          ) : (
            <span className="text-red-400 italic text-xs flex items-center gap-1">
              (Not selected – click the circle on the left)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeningMatching;
