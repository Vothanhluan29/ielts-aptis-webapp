import React, { useMemo } from 'react';
import { Form, Input, Button, Select, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

// Import các sub-components (Cấu trúc phẳng)
import MultipleChoice from './MultipleChoice';
import TrueFalse from './TrueFalse';
import FillInBlank from './FillInBlank';

const { TextArea } = Input;


const READING_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'MULTIPLE_ANSWER', label: 'Multiple Answer' },
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
  { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given' },
  { value: 'SENTENCE_COMPLETION', label: 'Sentence Completion' },
  { value: 'SUMMARY_COMPLETION', label: 'Summary Completion' },
  { value: 'MATCHING_HEADINGS', label: 'Matching Headings' },
  { value: 'MATCHING_FEATURES', label: 'Matching Features' },
  { value: 'MATCHING_PARAGRAPH_INFORMATION', label: 'Matching Paragraph Info' }
];


const LISTENING_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'MULTIPLE_ANSWER', label: 'Multiple Answer' },
  { value: 'MATCHING', label: 'Matching Information' },
  { value: 'MAP_PLAN_LABELING', label: 'Map / Plan Labeling' },
  { value: 'DIAGRAM_LABELING', label: 'Diagram Labeling' },
  { value: 'FORM_COMPLETION', label: 'Form Completion' },
  { value: 'NOTE_COMPLETION', label: 'Note Completion' },
  { value: 'TABLE_COMPLETION', label: 'Table Completion' },
  { value: 'FLOWCHART_COMPLETION', label: 'Flowchart Completion' },
  { value: 'SUMMARY_COMPLETION', label: 'Summary Completion' },
  { value: 'SENTENCE_COMPLETION', label: 'Sentence Completion' },
  { value: 'SHORT_ANSWER', label: 'Short Answer Questions' }
];


const QuestionCard = ({ field, remove, namePath, module = 'reading' }) => {
  const form = Form.useFormInstance();
  
  const typePath = useMemo(() => {
    return [...namePath, field.name, 'question_type'];
  }, [namePath, field.name]);

  const currentType = Form.useWatch(typePath, form);


  const currentOptions = module === 'listening' ? LISTENING_TYPES : READING_TYPES;

  const renderSpecificForm = (type) => {
    switch (type) {
  
      case 'MULTIPLE_CHOICE':
      case 'MULTIPLE_ANSWER':
      case 'MATCHING_HEADINGS':
      case 'MATCHING_FEATURES':
      case 'MATCHING_PARAGRAPH_INFORMATION':
      case 'MATCHING':
      case 'MAP_PLAN_LABELING':
      case 'DIAGRAM_LABELING':
        return <MultipleChoice field={field} namePath={namePath} />;
        

      case 'TRUE_FALSE_NOT_GIVEN':
        return <TrueFalse field={field} isYesNo={false} namePath={namePath} />;
      case 'YES_NO_NOT_GIVEN':
        return <TrueFalse field={field} isYesNo={true} namePath={namePath} />;
        

      case 'SENTENCE_COMPLETION':
      case 'SUMMARY_COMPLETION':
      case 'FORM_COMPLETION':
      case 'NOTE_COMPLETION':
      case 'TABLE_COMPLETION':
      case 'FLOWCHART_COMPLETION':
      case 'SHORT_ANSWER':
        return <FillInBlank field={field} namePath={namePath} />;
        
      default:
        return <FillInBlank field={field} namePath={namePath} />; 
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 relative shadow-sm mb-4">
      <Button 
        type="text" danger icon={<DeleteOutlined />} 
        onClick={() => remove(field.name)} 
        className="absolute top-2 right-2 hover:bg-red-50" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3 items-start pr-8">
        
        {/* Question Number & Question Type */}
        <Form.Item name={[field.name, 'question_number']} label="Question No." className="md:col-span-3 mb-0" rules={[{ required: true }]}>
          <InputNumber min={1} className="w-full" size="large" />
        </Form.Item>

        <Form.Item name={[field.name, 'question_type']} label="Question Type" className="md:col-span-5 mb-0" rules={[{ required: true }]}>
          <Select 
            options={currentOptions} 
            placeholder="Select question type" 
            size="large" 
          />
        </Form.Item>

        {/* Question Text — full width, below the two fields above */}
        <Form.Item name={[field.name, 'question_text']} label="Question Content" className="md:col-span-12 mb-0">
          <TextArea rows={2} placeholder="E.g: The main purpose of agriculture is..." size="large" />
        </Form.Item>

        {/* Sub-form component based on question type */}
        {renderSpecificForm(currentType)}

        {/* Explanation — shared across all question types */}
        <Form.Item name={[field.name, 'explanation']} label="Answer Explanation (Optional)" className="md:col-span-12 mb-0 mt-2">
          <TextArea rows={2} placeholder="Explain why this answer is correct, shown to students after submission..." size="large" />
        </Form.Item>
      </div>
    </div>
  );
};

export default QuestionCard;