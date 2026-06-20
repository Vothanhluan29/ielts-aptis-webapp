import React, { useState } from 'react';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, DownOutlined } from '@ant-design/icons';

/* ─── Helpers ─── */
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

const getOptionLabel = (optionsObj, key) => {
  if (!key || String(key).trim() === '') return 'Skipped';
  const p = safeParse(optionsObj);
  if (Array.isArray(p)) {
    const idx = parseInt(key);
    return (!isNaN(idx) && p[idx]) ? `${String.fromCharCode(65 + idx)}. ${p[idx]}` : key;
  }
  if (typeof key === 'string' && key.includes('-')) return key; // reorder format
  return p[key] ? `${key}. ${p[key]}` : key;
};

/**
 * Unified Question Review Card for Grammar & Vocab, Listening, Reading.
 * 
 * Props:
 * - q: question object (question_text, options, correct_answer, explanation, question_type)
 * - questionNumber: display string like "1" or "6 - 10"
 * - userAnswerKey: user's answer key
 * - answerDetail: { is_correct, correct_answer, explanation }
 * - showExplanationDefault: whether explanation starts open (default: false)
 */
const QuestionReviewCard = ({
  q,
  questionNumber,
  userAnswerKey,
  answerDetail,
  showExplanationDefault = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(showExplanationDefault);

  const correctAnswerRaw = answerDetail?.correct_answer || q.correct_answer;
  const isCorrect = answerDetail?.is_correct || false;
  const isSkipped = !userAnswerKey || String(userAnswerKey).trim() === '';
  const explanation = answerDetail?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);
  const qType = q.question_type?.toUpperCase();

  // Partial score logic for REORDER
  let isPartial = false;
  let partialScore = 0;
  let totalPositions = 0;
  if (qType === 'REORDER_SENTENCES' && userAnswerKey && correctAnswerRaw && !isCorrect) {
    const userArr = String(userAnswerKey).split('-');
    const correctArr = String(correctAnswerRaw).split('-');
    if (userArr.length === correctArr.length) {
      totalPositions = correctArr.length;
      for (let i = 0; i < correctArr.length; i++) {
        if (userArr[i] === correctArr[i]) partialScore++;
      }
      if (partialScore > 0) isPartial = true;
    }
  }

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'N/A';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;
    if (typeof correctAnswerRaw === 'string' && correctAnswerRaw.includes('-')) return correctAnswerRaw;

    const entries = Array.isArray(parsedOptions)
      ? parsedOptions.map((v, i) => [i, v])
      : Object.entries(parsedOptions);
    const found = entries.find(
      ([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase()
    );
    if (found) {
      return Array.isArray(parsedOptions)
        ? `${String.fromCharCode(65 + parseInt(found[0]))}. ${found[1]}`
        : `${found[0]}. ${found[1]}`;
    }
    return correctAnswerRaw;
  };

  // Visual styling
  const borderColor = isCorrect
    ? 'border-l-emerald-500'
    : isPartial
      ? 'border-l-amber-500'
      : isSkipped
        ? 'border-l-slate-300'
        : 'border-l-red-400';

  const badgeBg = isCorrect
    ? 'bg-emerald-500'
    : isPartial
      ? 'bg-amber-500'
      : isSkipped
        ? 'bg-slate-400'
        : 'bg-red-500';

  const statusIcon = isCorrect
    ? <CheckCircleFilled className="text-emerald-500" />
    : isPartial
      ? <ExclamationCircleFilled className="text-amber-500" />
      : <CloseCircleFilled className="text-red-400" />;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="px-4 py-3.5">
        {/* Top row: badge + question text */}
        <div className="flex gap-3 items-start">
          <div className={`min-w-7 h-7 rounded-lg ${badgeBg} text-white flex items-center justify-center text-xs font-bold mt-0.5 px-1.5 shrink-0`}>
            {questionNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-800 leading-snug mb-2.5">
              {q.question_text}
            </div>

            {/* Answer tags */}
            <div className="flex flex-wrap items-center gap-2">
              {/* User's answer */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                isPartial ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {statusIcon}
                <span><strong>Yours:</strong> {isSkipped ? 'Skipped' : getOptionLabel(q.options, userAnswerKey)}</span>
              </div>

              {/* Partial score */}
              {isPartial && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                  ✨ {partialScore}/{totalPositions} correct
                </div>
              )}

              {/* Correct answer */}
              {!isCorrect && correctAnswerRaw && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                  <CheckCircleFilled />
                  <span><strong>Answer:</strong> {getCorrectDisplay()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible explanation */}
      {explanation && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-slate-500 hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <span className="font-semibold uppercase tracking-wide">Explanation</span>
            <DownOutlined className={`text-[10px] transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`} />
          </button>
          {showExplanation && (
            <div className="px-4 pb-3 text-xs text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionReviewCard;
