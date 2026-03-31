import React, { useState } from 'react'; 
import { Check, X, ChevronDown, BookOpen, AlertCircle, Headphones } from 'lucide-react';

const ListeningResultItem = ({ item, index }) => {
  // State to control expand / collapse of details
  const [isOpen, setIsOpen] = useState(false); 

  // Safely normalize data (avoid null / undefined errors)
  const qNum = item.question_number || item.question?.question_number || (index + 1);
  const qText = item.question_text || item.question?.question_text || "Listening audio prompt...";
  const explanation = item.explanation || item.question?.explanation;
  
  const correctAnswersList = item.correct_answers || item.question?.correct_answers || [];
  const correctAnswerText = correctAnswersList.length > 0 
    ? correctAnswersList.join(' or ')
    : "N/A";
  
  // 🔥 FIX 2: Xử lý user_answer nếu nó là mảng (Multiple Answer)
  let userAnswerText = "--";
  if (Array.isArray(item.user_answer) && item.user_answer.length > 0) {
      userAnswerText = item.user_answer.join(', '); // Nối mảng bằng dấu phẩy
  } else if (item.user_answer && String(item.user_answer).trim() !== "") {
      userAnswerText = String(item.user_answer);
  }

  const isCorrect = item.is_correct;
  const hasAnswer = userAnswerText !== "--";

  return (
    <>
      {/* --- MAIN ROW (TR) --- */}
      <tr 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            border-b border-gray-100 cursor-pointer transition-colors group
            ${isOpen ? 'bg-purple-50/60' : 'hover:bg-gray-50'}
        `}
      >
        {/* Column 1: Index & Status */}
        <td className="py-4 pl-6 pr-4 align-middle w-16">
            <div className="flex items-center gap-3">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold shadow-sm transition-transform group-hover:scale-110
                    ${isCorrect 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : hasAnswer 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-gray-100 text-gray-500 border-gray-200'}
                `}>
                    {qNum}
                </div>
            </div>
        </td>

        {/* Column 2: Question content (hidden on mobile) */}
        <td className="py-4 px-4 align-middle hidden md:table-cell">
            <div className="flex items-center gap-2">
                 {/* Small Headphones icon to distinguish Listening */}
                <Headphones size={14} className="text-gray-400 shrink-0"/>
                <p 
                  className="text-sm text-gray-700 font-medium truncate max-w-62.5 lg:max-w-100" 
                  title={qText}
                >
                    {qText}
                </p>
            </div>
        </td>

        {/* Column 3: Your answer */}
        <td className="py-4 px-4 align-middle w-48">
            <div className={`text-sm font-bold flex items-center gap-2 ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                {hasAnswer ? userAnswerText : (
                  <span className="text-gray-400 font-normal italic">--</span>
                )}
                {/* Mobile check / x icon */}
                <div className="md:hidden">
                    {isCorrect ? <Check size={14}/> : <X size={14}/>}
                </div>
            </div>
        </td>

        {/* Column 4: Correct answer */}
        <td className="py-4 px-4 align-middle w-48">
            <div className="text-sm font-bold text-green-700 bg-green-50 px-2 py-1 rounded w-fit border border-green-100 wrap-break-word max-w-full">
                {correctAnswerText}
            </div>
        </td>

        {/* Column 5: Expand button */}
        <td className="py-4 px-4 pr-6 align-middle text-right w-10">
            <button 
              className={`p-1.5 rounded-full transition-all 
                ${isOpen 
                  ? 'bg-purple-100 text-purple-600 rotate-180' 
                  : 'text-gray-400 group-hover:bg-gray-100'}
              `}
            >
                <ChevronDown size={18}/>
            </button>
        </td>
      </tr>

      {/* --- EXPANDED ROW (DETAILS) --- */}
      {isOpen && (
        <tr className="bg-purple-50/30 animate-in fade-in duration-200">
            <td colSpan="5" className="p-0 border-b border-purple-100">
                <div className="p-4 md:p-6 md:pl-20">
                    <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-sm relative overflow-hidden">
                        
                        {/* Decoration line (primary purple color) */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                        
                        {/* Full question text */}
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Headphones size={12}/> Full question:
                            </span>
                            <p className="text-gray-800 font-medium text-base mt-1 leading-relaxed">
                              {qText}
                            </p>
                        </div>

                        {/* Explanation */}
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-purple-700 uppercase mb-2">
                                <BookOpen size={16}/> Detailed explanation
                            </h4>
                            {explanation ? (
                                <div className="text-gray-600 text-sm leading-7 whitespace-pre-line text-justify bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    {explanation}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-sm flex items-center gap-1 bg-gray-50 p-2 rounded w-fit">
                                    <AlertCircle size={14}/> No explanation available for this question.
                                </p>
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

export default ListeningResultItem;