import React from 'react';

const MatchingDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  if (!question) return null;

  // Safely process options
  // Support both Object format {A: "...", B: "..."} and Array format
  let optionsEntries = [];
  if (question.options) {
    if (Array.isArray(question.options)) {
      // If options are an array, automatically assign labels A, B, C...
      optionsEntries = question.options.map((opt, index) => [
        String.fromCharCode(65 + index),
        opt
      ]);
    } else {
      // If options are an object (current API format)
      optionsEntries = Object.entries(question.options).sort((a, b) =>
        a[0].localeCompare(b[0])
      );
    }
  }

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center items-start">
      
      {/* Question display section */}
      <div className="flex items-start gap-3 flex-1">
        <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
          {question.question_number}
        </div>
        <div className="text-slate-700 font-medium leading-relaxed text-[15px] pt-1">
          {question.question_text || "Choose the correct matching option:"}
        </div>
      </div>

      {/* Answer selection dropdown */}
      <div className="w-full sm:w-70 shrink-0">
        <select
          value={currentAnswer || ""}
          onChange={(e) =>
            onAnswerChange(question.question_number, e.target.value)
          }
          className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm font-semibold outline-none transition-all cursor-pointer appearance-none bg-slate-50
            ${
              currentAnswer
                ? "border-indigo-500 text-indigo-700 bg-indigo-50/30"
                : "border-slate-200 text-slate-600 focus:border-indigo-400 hover:border-slate-300"
            }
          `}
          style={{
            // Custom dropdown arrow icon using CSS
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
            paddingRight: "40px"
          }}
        >
          <option value="" disabled className="text-slate-400">
            Select your answer...
          </option>

          {optionsEntries.map(([key, value]) => (
            <option key={key} value={key} className="text-slate-700 font-medium">
              {key} - {value.length > 40 ? value.substring(0, 40) + "..." : value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MatchingDisplay;