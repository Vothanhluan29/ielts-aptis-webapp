import React from 'react';
import MultipleChoiceDisplay from './MultipleChoiceDisplay';
import TrueFalseDisplay from './TrueFalseDisplay';
import FillInBlankDisplay from './FillInBlankDisplay';

const StudentQuestionDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  if (!question) return null;

  switch (question.question_type) {
    // 🔥 NHÓM TRẮC NGHIỆM & NỐI THÔNG TIN (Dùng cho cả Reading & Listening)
    case 'MULTIPLE_CHOICE':
    case 'MULTIPLE_ANSWER':
    case 'MATCHING_HEADINGS':
    case 'MATCHING_FEATURES':
    case 'MATCHING_PARAGRAPH_INFORMATION':
    case 'MATCHING':
    case 'MAP_PLAN_LABELING':
    case 'DIAGRAM_LABELING':
      return (
        <MultipleChoiceDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );
      
    // 🔥 NHÓM ĐÚNG/SAI/KHÔNG CÓ THÔNG TIN (Chủ yếu dùng cho Reading)
    case 'TRUE_FALSE_NOT_GIVEN':
    case 'YES_NO_NOT_GIVEN':
      return (
        <TrueFalseDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );
      
    // 🔥 NHÓM ĐIỀN TỪ (Dùng rất nhiều trong Listening & Reading)
    case 'SENTENCE_COMPLETION':
    case 'SUMMARY_COMPLETION':
    case 'FORM_COMPLETION':
    case 'NOTE_COMPLETION':
    case 'TABLE_COMPLETION':
    case 'FLOWCHART_COMPLETION':
    case 'SHORT_ANSWER':
      return (
        <FillInBlankDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );
      
    default:
      // Mặc định an toàn: Nếu vô tình có type lạ, hệ thống vẫn cho phép gõ text
      return (
        <FillInBlankDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );
  }
};

export default StudentQuestionDisplay;