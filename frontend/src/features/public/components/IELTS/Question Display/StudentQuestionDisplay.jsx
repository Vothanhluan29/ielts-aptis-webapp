import React from 'react';
import MultipleChoiceDisplay from './MultipleChoiceDisplay';
import TrueFalseDisplay from './TrueFalseDisplay';
import FillInBlankDisplay from './FillInBlankDisplay';
import MatchingDisplay from './MatchingDisplay'; // 🔥 Import component mới

const StudentQuestionDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  if (!question) return null;

  switch (question.question_type) {
    // 🔥 NHÓM TRẮC NGHIỆM CHỌN A, B, C, D
    case 'MULTIPLE_CHOICE':
    case 'MULTIPLE_ANSWER':
      return (
        <MultipleChoiceDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );

    // 🔥 NHÓM NỐI THÔNG TIN (SỬ DỤNG DROPDOWN)
    case 'MATCHING_HEADINGS':
    case 'MATCHING_FEATURES':
    case 'MATCHING_PARAGRAPH_INFORMATION':
    case 'MATCHING':
    case 'MAP_PLAN_LABELING': // Dạng MAP IELTS thường cũng chọn A, B, C, D từ danh sách
    case 'DIAGRAM_LABELING':
      return (
        <MatchingDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );
      
    // 🔥 NHÓM ĐÚNG/SAI/KHÔNG CÓ THÔNG TIN
    case 'TRUE_FALSE_NOT_GIVEN':
    case 'YES_NO_NOT_GIVEN':
      return (
        <TrueFalseDisplay 
          question={question} 
          currentAnswer={currentAnswer} 
          onAnswerChange={onAnswerChange} 
        />
      );
      
    // 🔥 NHÓM ĐIỀN TỪ 
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