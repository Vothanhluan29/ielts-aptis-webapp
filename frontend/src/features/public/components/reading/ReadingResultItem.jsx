import React, { useState } from 'react'; 
import { Check, X, ChevronDown, BookOpen, AlertCircle } from 'lucide-react';

const ReadingResultItem = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false); 

  // 🔥 SYNC DATA WITH BACKEND PYDANTIC SCHEMA
  const qNum = item.question_number || (index + 1);
  const qText = item.question_text || "Question content...";
  const explanation = item.explanation;
  const isCorrect = item.is_correct;
  const hasAnswer = !!item.user_answer;
  
  // Handle correct answers array
  const correctAnswersArray = item.correct_answers || [];
  // Join answers with " OR " for better readability
  const correctAnswerDisplay = correctAnswersArray.length > 0 
    ? correctAnswersArray.join(' OR ') 
    : "N/A";

  return (
    <>
      {/* --- MAIN ROW (TR) --- */}
      <tr 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          border-b border-slate-100 cursor-pointer transition-colors group select-none
          ${isOpen ? 'bg-blue-50/60' : 'hover:bg-slate-50'}
        `}
      >
        {/* Column 1: Index & Status */}
        <td className="py-4 pl-6 pr-4 align-middle w-16">
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold shadow-sm transition-all
              ${isCorrect 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : hasAnswer 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'}
            `}>
              {qNum}
            </div>
          </div>
        </td>

        {/* Column 2: Question content (hidden on mobile) */}
        <td className="py-4 px-4 align-middle hidden md:table-cell">
          <p 
            className="text-sm text-slate-700 font-medium truncate max-w-[250px] lg:max-w-[400px] m-0" 
            title={qText}
          >
            {qText}
          </p>
        </td>

        {/* Column 3: Your answer */}
        <td className="py-4 px-4 align-middle w-40">
          <div className={`text-sm font-bold flex items-center gap-2 ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
            {/* Display user's answer, join if array */}
            {Array.isArray(item.user_answer) ? item.user_answer.join(', ') : item.user_answer || (
              <span className="text-slate-400 font-normal italic">-- (Skipped) --</span>
            )}
            
            {/* Mobile check/x icon */}
            <div className="md:hidden">
              {isCorrect ? <Check size={16} strokeWidth={3}/> : <X size={16} strokeWidth={3}/>}
            </div>
          </div>
        </td>

        {/* Column 4: Correct answer */}
        <td className="py-4 px-4 align-middle min-w-[160px]">
          <div className="text-[13px] font-bold text-green-700 bg-green-50 px-2 py-1.5 rounded-lg w-fit border border-green-200 shadow-sm">
            {correctAnswerDisplay}
          </div>
        </td>

        {/* Column 5: Expand button */}
        <td className="py-4 px-4 pr-6 align-middle text-right w-12">
          <div 
            className={`p-1.5 rounded-full transition-all inline-block
              ${isOpen 
                ? 'bg-blue-100 text-blue-600 rotate-180' 
                : 'text-slate-400 group-hover:bg-slate-200'}
            `}
          >
            <ChevronDown size={20}/>
          </div>
        </td>
      </tr>

      {/* --- EXPANDED ROW (DETAILS) --- */}
      {isOpen && (
        <tr className="bg-blue-50/40 animate-in fade-in zoom-in-95 duration-200">
          <td colSpan="5" className="p-0 border-b border-blue-100">
            <div className="p-4 md:p-6 md:pl-20">
              <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm relative overflow-hidden">
                  
                {/* Decoration line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                  
                {/* Full question text */}
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Question:
                  </span>
                  <p className="text-slate-800 font-medium text-[15px] mt-1 leading-relaxed">
                    {qText}
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-blue-700 uppercase tracking-wider mb-2.5">
                    <BookOpen size={16}/> Detailed Explanation
                  </h4>
                  {explanation ? (
                    <div className="text-slate-700 text-[14.5px] leading-relaxed whitespace-pre-line text-justify bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {explanation}
                    </div>
                  ) : (
                    <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 inline-block">
                      <p className="text-slate-500 italic text-sm flex items-center gap-1.5 m-0">
                        <AlertCircle size={16}/> No explanation has been provided for this question yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ReadingResultItem;