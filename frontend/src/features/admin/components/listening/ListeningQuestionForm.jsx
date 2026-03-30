import React from 'react';
import { Trash2, GripVertical, HelpCircle } from 'lucide-react';

// 1. Import đúng tên từ file index.js trong folder question-types
import { 
  ListeningMultipleChoice, 
  ListeningFillBlank, 
  ListeningMatching,
  // ListeningTrueFalse (Nếu cần)
} from './question-types';

// 2. Mapping đầy đủ các loại câu hỏi
const QUESTION_TYPES_OPTIONS = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', component: ListeningMultipleChoice },
  
  // Nhóm Fill Blank (Dùng chung component)
  { value: 'FORM_COMPLETION', label: 'Form Completion', component: ListeningFillBlank },
  { value: 'NOTE_COMPLETION', label: 'Note Completion', component: ListeningFillBlank },
  { value: 'TABLE_COMPLETION', label: 'Table Completion', component: ListeningFillBlank },
  { value: 'SENTENCE_COMPLETION', label: 'Sentence Completion', component: ListeningFillBlank },
  { value: 'SUMMARY_COMPLETION', label: 'Summary Completion', component: ListeningFillBlank },
  { value: 'SHORT_ANSWER_QUESTIONS', label: 'Short Answer', component: ListeningFillBlank },
  
  // Nhóm Matching (Dùng chung component)
  { value: 'MATCHING_INFORMATION', label: 'Matching Information', component: ListeningMatching },
  { value: 'PLAN_MAP_DIAGRAM_LABELING', label: 'Map/Diagram Labeling', component: ListeningMatching },
  { value: 'FLOW_CHART_COMPLETION', label: 'Flow Chart (Matching)', component: ListeningMatching },
];

const ListeningQuestionForm = ({ index, question, onChange, onRemove }) => {
  
  // 3. Logic chọn component con
  const getCurrentComponent = () => {
    const typeObj = QUESTION_TYPES_OPTIONS.find(t => t.value === question.question_type);
    return typeObj ? typeObj.component : ListeningFillBlank; // Default fallback
  };

  const SpecificQuestionComponent = getCurrentComponent();

  // 4. Wrapper onChange để khớp với component con
  // Component con chỉ gọi onChange('field', 'value')
  // Chúng ta truyền tiếp lên cha: onChange('field', 'value') 
  // (Lưu ý: index đã được xử lý ở ListeningEditPage rồi)
  const handleChildChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition relative group animate-in fade-in slide-in-from-bottom-2">
      
      {/* HEADER */}
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-2 text-gray-300 cursor-move">
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Question Number */}
            <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">No.</label>
                <input 
                   type="number"
                   className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-center font-bold text-gray-700 focus:border-purple-500 outline-none"
                   value={question.question_number}
                   onChange={(e) => onChange('question_number', parseInt(e.target.value))}
                />
            </div>

            {/* Question Type Select */}
            <div className="col-span-10">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Question Type</label>
                <select
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:border-purple-500 outline-none font-medium"
                    value={question.question_type}
                    onChange={(e) => onChange('question_type', e.target.value)}
                >
                    {QUESTION_TYPES_OPTIONS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>
        </div>

        <button 
            onClick={onRemove}
            className="mt-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition"
            title="Remove Question"
        >
            <Trash2 size={18} />
        </button>
      </div>

      {/* QUESTION TEXT */}
      <div className="mb-2 pl-8">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Question Text</label>
        <input
          type="text"
          placeholder="Enter the question content..."
          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 outline-none"
          value={question.question_text || ''}
          onChange={(e) => onChange('question_text', e.target.value)}
        />
      </div>

      {/* DYNAMIC ANSWER INPUT */}
      <div className="pl-8">
         <SpecificQuestionComponent 
            question={question} 
            onChange={handleChildChange} // Truyền wrapper function
         />
      </div>

      {/* EXPLANATION */}
      <div className="mt-3 pl-8">
         <details className="text-xs text-gray-500 group/exp">
            <summary className="cursor-pointer hover:text-purple-600 font-bold flex items-center gap-1 select-none transition">
               <HelpCircle size={12}/> Explanation (Optional)
            </summary>
            <textarea 
                className="w-full mt-2 p-2 border border-gray-200 rounded bg-gray-50 focus:bg-white focus:border-purple-300 outline-none text-gray-600"
                rows={2}
                placeholder="Explain why this answer is correct..."
                value={question.explanation || ''}
                onChange={(e) => onChange('explanation', e.target.value)}
            />
         </details>
      </div>

    </div>
  );
};

export default ListeningQuestionForm;