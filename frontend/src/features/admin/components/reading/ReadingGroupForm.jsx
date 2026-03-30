import React from 'react';
import { Trash2, Plus, GripVertical, Type } from 'lucide-react'; // Đã bỏ import ImageIcon
import ReadingQuestionForm from './ReadingQuestionForm';

const ReadingGroupForm = ({ 
  group, 
  // groupIndex, 
  onChange,           
  onRemove,           
  onAddQuestion,      
  onRemoveQuestion,   
  onQuestionChange,   
  isMaxQuestions 
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden group/card transition-all hover:border-indigo-200">
      
      {/* 1. GROUP HEADER (Chỉ còn Instruction) */}
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex justify-between items-start gap-4">
          
          {/* Drag Handle */}
          <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing">
            <GripVertical size={20} />
          </div>

          <div className="flex-1">
            {/* Instruction Input */}
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Type size={14} className="text-indigo-500"/> Group Instruction (Required)
            </label>
            <textarea
              value={group.instruction || ''}
              onChange={(e) => onChange('instruction', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none bg-white placeholder:font-normal"
              placeholder='e.g. "Questions 1-5: Reading Passage 1 has five sections, A-E. Choose the correct heading for each section..."'
              rows={2}
            />
          </div>

          {/* Delete Group Button */}
          <button
            onClick={onRemove}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
            title="Delete entire Group"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 2. QUESTIONS LIST */}
      <div className="p-4 bg-slate-50/30 space-y-4">
        {group.questions && group.questions.map((question, qIndex) => (
          <ReadingQuestionForm
            key={qIndex}
            question={question}
            index={qIndex}
            onChange={onQuestionChange}
            onRemove={() => onRemoveQuestion(qIndex)}
          />
        ))}

        {/* Add Question Button */}
        <button
          onClick={onAddQuestion}
          disabled={isMaxQuestions}
          className={`
            w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm flex items-center justify-center gap-2 transition duration-200
            ${isMaxQuestions 
              ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
              : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300'}
          `}
        >
          <Plus size={16} /> 
          {isMaxQuestions ? 'Max questions reached' : 'Add Question to this Group'}
        </button>
      </div>
    </div>
  );
};

export default ReadingGroupForm;