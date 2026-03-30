import React, { useState } from 'react';
import { Check, Trash2, Plus, Wand2 } from 'lucide-react';

const MultipleChoiceAdmin = ({ question, onChange }) => {
  // --- STATE ---
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // 1. Sort options
  const optionsEntries = question.options 
    ? Object.entries(question.options).sort((a, b) => a[0].localeCompare(b[0])) 
    : [['A', ''], ['B', ''], ['C', ''], ['D', '']];

  // --- NORMAL LOGIC ---
  const handleOptionTextChange = (key, value) => {
    const newOptions = { ...question.options, [key]: value };
    onChange('options', newOptions);
  };

  const handleAddOption = () => {
    const currentKeys = Object.keys(question.options || {});
    let nextChar = 'A';
    if (currentKeys.length > 0) {
      const lastChar = currentKeys.sort()[currentKeys.length - 1];
      nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
    const newOptions = { ...question.options, [nextChar]: '' };
    onChange('options', newOptions);
  };

  const handleDeleteOption = (keyToDelete) => {
    const newOptions = { ...question.options };
    delete newOptions[keyToDelete];
    onChange('options', newOptions);
    if (question.correct_answer === keyToDelete) onChange('correct_answer', '');
  };

  const handleSelectCorrect = (key) => {
    if (question.correct_answer === key) onChange('correct_answer', '');
    else onChange('correct_answer', key);
  };

  // --- BULK INPUT LOGIC ---
  const handleBulkProcess = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    const newOptions = {};

    lines.forEach((line, index) => {
      // Auto-generate key: 0->A, 1->B, 2->C...
      const key = String.fromCharCode(65 + index); // 65 = ASCII of 'A'

      // Clean content (remove prefixes like "A.", "1.", "- ")
      let cleanContent = line.trim();
      const prefixRegex = /^([a-zA-Z0-9]+)[.)-]\s+/;
      cleanContent = cleanContent.replace(prefixRegex, '');

      newOptions[key] = cleanContent;
    });

    onChange('options', newOptions);
    setIsBulkMode(false);
    setBulkText('');
  };

  return (
    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
      
      {/* HEADER: Toolbar */}
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-blue-700 uppercase">
          Answer Options
        </label>
        
        <div className="flex gap-2">
          {/* Toggle bulk input mode */}
          <button 
            type="button"
            onClick={() => setIsBulkMode(!isBulkMode)}
            className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded transition font-bold shadow-sm ${
              isBulkMode
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Wand2 size={12}/> {isBulkMode ? 'Close Bulk Input' : 'Bulk Input'}
          </button>

          {!isBulkMode && (
            <button 
              type="button"
              onClick={handleAddOption}
              className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 font-bold shadow-sm"
            >
              <Plus size={12}/> Add option
            </button>
          )}
        </div>
      </div>
      
      {/* --- BODY --- */}
      {isBulkMode ? (
        /* BULK INPUT MODE */
        <div className="bg-white p-4 rounded border border-blue-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <label className="block text-xs font-bold text-gray-500 mb-2">
            Paste the list of options here (one option per line):
          </label>
          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            placeholder={`Example:\nApple is a fruit\nBanana is yellow\nCarrot is orange`}
          />
          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={() => setIsBulkMode(false)}
              className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkProcess}
              className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 shadow-sm"
            >
              Auto-generate
              
            </button>
          </div>
        </div>
      ) : (
        /* NORMAL LIST MODE */
        <div className="space-y-2">
          {optionsEntries.map(([key, value]) => {
            const isCorrect = question.correct_answer === key;

            return (
              <div key={key} className="flex items-center gap-2 group">
                {/* Select correct answer */}
                <div 
                  onClick={() => handleSelectCorrect(key)}
                  className={`
                    w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg border-2 font-bold cursor-pointer transition-all select-none
                    ${isCorrect 
                      ? 'bg-green-500 text-white border-green-600 shadow-md scale-105' 
                      : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-500'}
                  `}
                  title={`Click to mark ${key} as the correct answer`}
                >
                  {isCorrect ? <Check size={18} strokeWidth={3}/> : key}
                </div>

                {/* Option content */}
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => handleOptionTextChange(key, e.target.value)}
                  className={`
                    w-full p-2 border rounded text-sm outline-none transition
                    ${isCorrect
                      ? 'border-green-300 bg-green-50/30 text-green-800 font-medium'
                      : 'border-gray-300 focus:border-blue-400'}
                  `}
                  placeholder={`Option ${key} content...`}
                />

                {/* Delete option */}
                <button 
                  type="button"
                  onClick={() => handleDeleteOption(key)}
                  className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                  disabled={optionsEntries.length <= 2}
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER: Result display */}
      <div className="pt-3 border-t border-blue-100 mt-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-gray-600">Correct answer:</span>
          {question.correct_answer ? (
            <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full font-bold border border-green-200">
              {question.correct_answer}
            </span>
          ) : (
            <span className="text-red-400 italic text-xs">
              (Not selected — click on a letter)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceAdmin;
