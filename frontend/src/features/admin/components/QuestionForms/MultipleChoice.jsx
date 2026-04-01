import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input } from 'antd';
import { Check, Trash2, Plus, Wand2 } from 'lucide-react';

const MultipleChoice = ({ field, namePath }) => {
  const form = Form.useFormInstance();
  
  // UI state management
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  // Force re-render state when options are added/removed
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  // Lock path arrays with useMemo to prevent unnecessary re-renders
  const optionsPath = useMemo(() => [...namePath, field.name, 'options'], [namePath, field.name]);
  const correctPath = useMemo(() => [...namePath, field.name, 'correct_answers'], [namePath, field.name]);

  // Keep useWatch to track validation errors
  Form.useWatch(optionsPath, form);
  const currentCorrect = Form.useWatch(correctPath, form) || [];
  const errors = form.getFieldError(correctPath) || [];

  // ==============================================
  // 1. INITIALIZE WITH 4 DEFAULT OPTIONS (A, B, C, D)
  // ==============================================
  useEffect(() => {
    const initOpts = form.getFieldValue(optionsPath);
    // If no options exist yet, seed 4 empty slots — use setTimeout to avoid setState inside effect
    if (!initOpts || Object.keys(initOpts).length === 0) {
      setTimeout(() => {
        form.setFieldValue(optionsPath, { A: '', B: '', C: '', D: '' });
        forceUpdate();
      }, 0);
    }

  }, [form, optionsPath]);

  // Always read the freshest data from the Form store
  let optionsObj = form.getFieldValue(optionsPath) || { A: '', B: '', C: '', D: '' };
  
  // (Safeguard: if the database returns an array, convert it to an Object)
  if (Array.isArray(optionsObj)) {
    const temp = {};
    optionsObj.forEach((opt, idx) => { temp[String.fromCharCode(65 + idx)] = opt; });
    optionsObj = temp;
  }

  const optionsEntries = Object.entries(optionsObj).sort((a, b) => a[0].localeCompare(b[0]));

  // ==============================================
  // 2. ADD / DELETE / EDIT LOGIC (NO LIMIT ON COUNT)
  // ==============================================
  
  const handleAddOption = () => {
    const currentOpts = form.getFieldValue(optionsPath) || {};
    const currentKeys = Object.keys(currentOpts).sort();
    let nextChar = 'A';
    
    // Find the last letter and generate the next one (e.g. D -> E)
    if (currentKeys.length > 0) {
      const lastChar = currentKeys[currentKeys.length - 1];
      nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
    
    form.setFieldValue(optionsPath, { ...currentOpts, [nextChar]: '' });
    forceUpdate(); // Force UI to render the new option slot
  };

  const handleDeleteOption = (keyToDelete) => {
    const currentOpts = form.getFieldValue(optionsPath) || {};
    const newOptions = { ...currentOpts };
    delete newOptions[keyToDelete]; // Remove the option
    form.setFieldValue(optionsPath, newOptions);

    // If the deleted option was the selected answer, clear the selection
    const currCorrect = form.getFieldValue(correctPath) || [];
    if (currCorrect.includes(keyToDelete)) {
      form.setFieldValue(correctPath, currCorrect.filter(k => k !== keyToDelete));
    }
    forceUpdate(); // Force UI to remove the deleted slot
  };

const handleSelectCorrect = (key) => {
    const currCorrect = form.getFieldValue(correctPath) || [];
    
    // Lấy loại câu hỏi từ form (Tên field 'question_type' tùy thuộc vào DB của bạn)
    const qType = form.getFieldValue([...namePath, field.name, 'question_type']);
    const isMultipleAnswer = qType === 'MULTIPLE_ANSWER'; 

    if (currCorrect.includes(key)) {
      form.setFieldValue(correctPath, currCorrect.filter(k => k !== key));
    } else {
      if (isMultipleAnswer) {
        // Cho phép chọn nhiều
        form.setFieldValue(correctPath, [...currCorrect, key].sort()); 
      } else {
        // Bắt buộc chọn 1 (Ghi đè cái cũ)
        form.setFieldValue(correctPath, [key]); 
      }
    }
    
    form.validateFields([correctPath]).catch(() => {});
    forceUpdate();
  };

  // ==============================================
  // 3. BULK INPUT LOGIC
  // ==============================================
  const handleBulkProcess = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    const newOptions = {};

    lines.forEach((line, index) => {
      // Generates A, B, C, D, E, F... based on the number of pasted lines
      const key = String.fromCharCode(65 + index);
      let cleanContent = line.trim();
      const prefixRegex = /^([a-zA-Z0-9]+)[.)-]\s+/; // Strip leading letter/number prefixes
      cleanContent = cleanContent.replace(prefixRegex, '');
      newOptions[key] = cleanContent;
    });

    form.setFieldValue(optionsPath, newOptions); // Overwrite all existing options
    setIsBulkMode(false);
    setBulkText('');
    forceUpdate(); // Immediately update the UI
  };

  return (
    <div className="md:col-span-12 mt-2">
      
      {/* HIDDEN FIELD FOR ANT DESIGN EMPTY-ANSWER VALIDATION */}
      <Form.Item name={[field.name, 'correct_answers']} rules={[{ required: true, message: 'Please select a correct answer!' }]} hidden>
        <Input />
      </Form.Item>

      <div className={`bg-blue-50/30 p-4 rounded-xl border space-y-4 transition-all ${errors.length > 0 ? 'border-red-400 bg-red-50/20' : 'border-blue-100'}`}>
        
        {/* HEADER: TOOLBAR */}
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Options
          </label>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-bold shadow-sm ${
                isBulkMode ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Wand2 size={14}/> {isBulkMode ? 'Close Bulk Input' : 'Bulk Input'}
            </button>
            {!isBulkMode && (
              <button 
                type="button"
                onClick={handleAddOption}
                className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1.5 font-bold shadow-sm"
              >
                <Plus size={14}/> Add Option
              </button>
            )}
          </div>
        </div>
        
        {/* BODY: INPUT AREA */}
        {isBulkMode ? (
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <label className="block text-xs font-bold text-slate-500 mb-2">
              Paste your options here (one answer per line):
            </label>
            <textarea 
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-[15px] h-36 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              placeholder={`Example:\nApple is a fruit\nBanana is yellow\nCarrot is orange\nDragon fruit is pink`}
            />
            <div className="flex justify-end mt-3 gap-2">
              <button type="button" onClick={() => setIsBulkMode(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={handleBulkProcess} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
                Generate Options
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {optionsEntries.map(([key]) => {
              const isCorrect = currentCorrect.includes(key);

              return (
                <div key={key} className="flex items-center gap-3 group">
                  {/* Answer selector button (A, B, C...) */}
                  <div 
                    onClick={() => handleSelectCorrect(key)}
                    className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border-2 font-bold cursor-pointer transition-all select-none
                      ${isCorrect ? 'bg-green-500 text-white border-green-500 shadow-md scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-500'}`}
                  >
                    {isCorrect ? <Check size={20} strokeWidth={3}/> : key}
                  </div>

                  {/* Option content input */}
                  <Form.Item name={[field.name, 'options', key]} noStyle>
                    <Input 
                      className={`w-full p-2.5 border-2 rounded-xl text-[15px] outline-none transition shadow-sm
                        ${isCorrect ? 'border-green-300 bg-green-50 text-green-800 font-medium' : 'border-slate-200 focus:border-blue-400 text-slate-700 bg-white'}`}
                      placeholder={`Option ${key} content...`}
                    />
                  </Form.Item>

                  {/* Delete option button */}
                  <button 
                    type="button"
                    onClick={() => handleDeleteOption(key)}
                    className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    disabled={optionsEntries.length <= 2} // Prevent deletion if only 2 options remain
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER: CORRECT ANSWER DISPLAY */}
        <div className={`pt-3 border-t mt-4 flex items-center gap-2 ${errors.length > 0 ? 'border-red-200' : 'border-blue-100'}`}>
          <span className="font-bold text-slate-600 text-sm">Correct Answer:</span>
          {currentCorrect.length > 0 ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold border border-green-200 shadow-sm">
              {currentCorrect.join(', ')}
            </span>
          ) : (
            <span className="text-red-500 font-semibold text-sm">(No answer selected — click the letter on the left)</span>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default MultipleChoice;