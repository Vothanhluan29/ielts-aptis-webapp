import React, { useMemo } from 'react';
import { Form, Select } from 'antd';
import { PenLine, Info } from 'lucide-react';

const FillInBlank = ({ field, namePath }) => {
  const form = Form.useFormInstance();

  // Lock path array to prevent unnecessary re-renders
  const correctPath = useMemo(() => [...namePath, field.name, 'correct_answers'], [namePath, field.name]);
  
  // Watch for errors to highlight the border red if the admin forgets to enter an answer
  const errors = form.getFieldError(correctPath) || [];

  return (
    <div className="md:col-span-12 mt-2">
      <div className={`p-4 rounded-xl border transition-all duration-300 ${errors.length > 0 ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'}`}>
        
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-3">
          <PenLine size={16} className="text-blue-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
            Fill in the blank Answers (Accepts synonyms / alternative spellings)
          </p>
        </div>

        {/* INPUT: Using Antd Select mode="tags" to automatically create a String array */}
        <Form.Item
          name={[field.name, 'correct_answers']}
          rules={[{ required: true, message: 'At least 1 answer is required!' }]}
          className="mb-0!"
        >
          <Select
            mode="tags"
            placeholder="E.g: agriculture (Enter), farming (Enter), the agriculture (Enter)"
            style={{ width: '100%' }}
            tokenSeparators={[',']} // Pressing comma also splits into a new tag
            size="large"
            className="custom-fill-blank-tags"
          />
        </Form.Item>

        {/* TEACHER INSTRUCTIONS */}
        <div className="mt-4 flex items-start gap-2 text-slate-600 bg-blue-50/70 p-3 rounded-lg border border-blue-100 shadow-sm">
          <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <p className="text-[13px] m-0 leading-relaxed">
            Type an answer and press <b>Enter</b> or a comma <b>(,)</b> to add it. <br/>
            <span className="text-slate-500">
              *Tip: Enter all possible variants (e.g. with/without articles "a", "an", "the", singular/plural forms) so the auto-grading system scores students as accurately as possible.
            </span>
          </p>
        </div>

        {/* ERROR WARNING */}
        {errors.length > 0 && (
          <p className="text-xs text-red-500 font-medium italic mt-3 mb-0">
            * Please enter at least one answer before saving the test.
          </p>
        )}
      </div>
    </div>
  );
};

export default FillInBlank;