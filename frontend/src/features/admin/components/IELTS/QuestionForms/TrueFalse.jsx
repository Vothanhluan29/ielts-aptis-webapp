import React, { useMemo } from 'react';
import { Form, Input } from 'antd';
import { Check, X, Minus } from 'lucide-react';

const TrueFalse = ({ field, isYesNo = false, namePath }) => {
  const form = Form.useFormInstance();

  // Lock the path array to avoid continuous re-renders
  const correctPath = useMemo(() => [...namePath, field.name, 'correct_answers'], [namePath, field.name]);
  
  // Watch the current value to highlight the selected button
  const currentCorrect = Form.useWatch(correctPath, form) || [];
  const errors = form.getFieldError(correctPath) || [];

  // Dynamic label and icon config (True/False or Yes/No)
  const options = isYesNo 
    ? [
        { value: 'YES', label: 'YES', color: 'bg-green-100 text-green-700 border-green-500', icon: Check },
        { value: 'NO', label: 'NO', color: 'bg-red-100 text-red-700 border-red-500', icon: X },
        { value: 'NOT GIVEN', label: 'NOT GIVEN', color: 'bg-slate-200 text-slate-700 border-slate-500', icon: Minus },
      ]
    : [
        { value: 'TRUE', label: 'TRUE', color: 'bg-green-100 text-green-700 border-green-500', icon: Check },
        { value: 'FALSE', label: 'FALSE', color: 'bg-red-100 text-red-700 border-red-500', icon: X },
        { value: 'NOT GIVEN', label: 'NOT GIVEN', color: 'bg-slate-200 text-slate-700 border-slate-500', icon: Minus },
      ];

  const handleSelect = (val) => {
    // If clicking the already-selected button, deselect it; otherwise select the new one
    if (currentCorrect.includes(val)) {
      form.setFieldValue(correctPath, []); 
    } else {
      form.setFieldValue(correctPath, [val]); // Store as array to match Pydantic backend
    }
    // Clear the red warning as soon as the user makes a selection
    form.validateFields([correctPath]).catch(() => {});
  };

  return (
    <div className="md:col-span-12 mt-2">
      
      {/* HIDDEN FIELD FOR ANT DESIGN VALIDATION */}
      <Form.Item name={[field.name, 'correct_answers']} rules={[{ required: true, message: 'Please select a correct answer!' }]} hidden>
        <Input />
      </Form.Item>

      <div className={`p-4 rounded-xl border transition-all duration-300 ${errors.length > 0 ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'}`}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Select Correct Answer:
        </p>
        
        <div className="flex flex-wrap gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentCorrect.includes(opt.value);
            
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 transition-all font-bold text-[13px] outline-none select-none
                  ${isSelected 
                    ? `${opt.color} shadow-sm scale-[1.02]` 
                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-600'}
                `}
              >
                {isSelected && <Icon size={16} strokeWidth={3} />}
                {opt.label}
              </button>
            );
          })}
        </div>
        
        {/* Show warning message if submitted without selecting an answer */}
        {errors.length > 0 && (
          <p className="text-xs text-red-500 font-medium italic mt-3 flex items-center gap-1">
            * Please select an answer.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrueFalse;