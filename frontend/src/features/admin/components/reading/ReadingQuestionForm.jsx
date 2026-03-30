import React from 'react';
import { Trash } from 'lucide-react';
import { 
  MultipleChoiceAdmin, 
  TrueFalseAdmin, 
  MatchingAdmin, 
  FillBlankAdmin 
} from './question-types';

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
  { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given' },
  { value: 'MATCHING_HEADINGS', label: 'Matching Headings' },
  { value: 'MATCHING_INFORMATION', label: 'Matching Information' },
  { value: 'MATCHING_FEATURES', label: 'Matching Features' },
  { value: 'SHORT_ANSWER_QUESTIONS', label: 'Short Answer / Fill in the Blank' },
];

const ReadingQuestionForm = ({ 
  question, 
  index, 
  onChange, 
  onRemove 
}) => {

  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  // Render detailed form based on question type
  const renderDetailForm = () => {
    switch (question.question_type) {
      case 'MULTIPLE_CHOICE':
        return <MultipleChoiceAdmin question={question} onChange={handleChange} />;
      
      case 'TRUE_FALSE_NOT_GIVEN':
      case 'YES_NO_NOT_GIVEN':
        return <TrueFalseAdmin question={question} onChange={handleChange} />;
      
      case 'MATCHING_HEADINGS':
      case 'MATCHING_INFORMATION':
      case 'MATCHING_FEATURES':
        return <MatchingAdmin question={question} onChange={handleChange} />;
      
      // Default for all fill-in / short answer types
      default: 
        return <FillBlankAdmin question={question} onChange={handleChange} />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative group hover:border-blue-300 transition">
      
      {/* Delete Button */}
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition"
        title="Delete this question"
      >
        <Trash size={16}/>
      </button>

      {/* Row 1: General Settings */}
      <div className="grid grid-cols-12 gap-3 mb-3 pr-8">
        <div className="col-span-3">
          <label className="text-[11px] uppercase font-bold text-gray-500 block mb-1">
            Question No.
          </label>
          <input 
            type="number" 
            value={question.question_number} 
            onChange={(e) => handleChange('question_number', parseInt(e.target.value) || 0)}
            className="w-full p-1.5 border border-gray-300 rounded text-center font-bold text-blue-600"
          />
        </div>

        <div className="col-span-9">
          <label className="text-[11px] uppercase font-bold text-gray-500 block mb-1">
            Question Type
          </label>
          <select 
            value={question.question_type} 
            onChange={(e) => handleChange('question_type', e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
          >
            {QUESTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Question Content */}
      <div className="mb-3">
        <label className="text-[11px] uppercase font-bold text-gray-500 block mb-1">
          Question Content
        </label>
        <textarea 
          rows={2}
          value={question.question_text} 
          onChange={(e) => handleChange('question_text', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-400 outline-none"
          placeholder="Enter the question content..."
        />
      </div>

      {/* Row 3: Dynamic Detail Form */}
      <div className="mb-3">
        {renderDetailForm()}
      </div>

      {/* Row 4: Explanation */}
      <div>
        <label className="text-[11px] uppercase font-bold text-gray-500 block mb-1">
          Explanation (Optional)
        </label>
        <input 
          type="text" 
          value={question.explanation} 
          onChange={(e) => handleChange('explanation', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm text-gray-600 focus:border-blue-400 outline-none"
          placeholder="Explain why this answer is correct..."
        />
      </div>
    </div>
  );
};

export default ReadingQuestionForm;
