import React, { useState, useEffect } from 'react';
import { Modal, Select, message, Tooltip } from 'antd';
import { Copy, X, CheckCircle2 } from 'lucide-react';
import writingAptisAdminApi from '../../../api/APTIS/writing/writingAptisAdminApi';

const AISuggestionModal = ({ visible, onClose, onCopy, partsData = [] }) => {
  const [inputText, setInputText] = useState('');
  const [partContext, setPartContext] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (!partContext || !partsData.length) {
      setAvailableQuestions([]);
      setSelectedQuestionIndex(0);
      return;
    }

    let targetPartNumber = null;
    let targetSubType = null;

    if (partContext === 'Part 1') targetPartNumber = 1;
    else if (partContext === 'Part 2') targetPartNumber = 2;
    else if (partContext === 'Part 3') targetPartNumber = 3;
    else if (partContext === 'Part 4 (Informal)') {
      targetPartNumber = 4;
      targetSubType = 'informal';
    } else if (partContext === 'Part 4 (Formal)') {
      targetPartNumber = 4;
      targetSubType = 'formal';
    }

    const part = partsData.find(p => p.part_number === targetPartNumber);
    if (part) {
      let filteredQs = part.questions || [];
      if (targetPartNumber === 4 && targetSubType) {
         const hasSubTypes = filteredQs.some(q => q.sub_type);
         if (hasSubTypes) {
           filteredQs = filteredQs.filter(q => q.sub_type === targetSubType);
         } else {
           if (targetSubType === 'informal' && filteredQs.length >= 2) filteredQs = [filteredQs[1]];
           else if (targetSubType === 'formal' && filteredQs.length >= 3) filteredQs = [filteredQs[2]];
           else filteredQs = [];
         }
      }
      
      filteredQs = filteredQs.filter(q => !q.isScenario);
      
      setAvailableQuestions(filteredQs);
      setSelectedQuestionIndex(0);
      
      if (filteredQs.length > 0) {
        setInputText(filteredQs[0].finalAnswer || '');
      } else {
        setInputText('');
      }
    } else {
      setAvailableQuestions([]);
      setSelectedQuestionIndex(0);
      setInputText('');
    }
  }, [partContext, partsData]);

  const handleQuestionChange = (index) => {
    setSelectedQuestionIndex(index);
    if (availableQuestions[index]) {
      setInputText(availableQuestions[index].finalAnswer || '');
    }
  };

  const handleSuggest = async () => {
    if (!inputText.trim()) {
      message.warning('Please enter some text to get suggestions.');
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await writingAptisAdminApi.getAISuggestion(inputText.trim(), partContext);
      const data = res.data || res;
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        message.error('Failed to get suggestions. Please try again.');
      }
    } catch (err) {
      console.error(err);
      message.error('An error occurred while fetching AI suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied to clipboard!');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      if (onCopy) onCopy(text);
    } catch (err) {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('Copied to clipboard!');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        if (onCopy) onCopy(text);
      } catch (e) {
        message.error('Failed to copy to clipboard.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      destroyOnClose={false}
      closeIcon={<X className="text-slate-400 hover:text-slate-600 transition-colors" size={20} />}
      classNames={{
        content: 'p-0 overflow-hidden rounded-2xl shadow-2xl border-0',
        body: 'p-0',
      }}
      centered
    >
      <div className="flex flex-col md:flex-row h-[600px]">
        {/* Left Side: Input & Controls */}
        <div className="w-full md:w-[45%] bg-gradient-to-b from-indigo-50/80 to-white p-8 border-r border-slate-100 flex flex-col h-full">
          <div className="mb-6 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">AI Assistant</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Aptis Writing Enhancement</p>
          </div>

          <div className="mb-4 shrink-0">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Task Context
            </label>
            <Select
              className="w-full"
              size="large"
              placeholder="Select Aptis Part"
              value={partContext || undefined}
              onChange={setPartContext}
              allowClear
              options={[
                { label: 'Part 1 (Word-level, 1-5 words)', value: 'Part 1' },
                { label: 'Part 2 (Short text, 20-30 words)', value: 'Part 2' },
                { label: 'Part 3 (Social network, 30-40 words)', value: 'Part 3' },
                { label: 'Part 4 - Informal Email', value: 'Part 4 (Informal)' },
                { label: 'Part 4 - Formal Email', value: 'Part 4 (Formal)' },
              ]}
            />
          </div>

          {availableQuestions.length > 0 && (
            <div className="mb-4 shrink-0 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Question Context
              </label>
              {availableQuestions.length > 1 && (
                <Select
                  className="w-full mb-2"
                  value={selectedQuestionIndex}
                  onChange={handleQuestionChange}
                  options={availableQuestions.map((q, idx) => ({
                    label: `Question ${idx + 1}`,
                    value: idx
                  }))}
                />
              )}
              <div className="p-3 bg-white border border-indigo-100 rounded-lg text-sm text-slate-700 shadow-sm overflow-y-auto max-h-24 custom-scrollbar">
                <span className="font-bold text-indigo-600 mr-1">Q:</span> 
                {availableQuestions[selectedQuestionIndex]?.question_text}
              </div>
            </div>
          )}

          <div className="mb-6 flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
              <span>Student's Text</span>
              {inputText.length > 0 && <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{inputText.trim().split(/\s+/).length} words</span>}
            </label>
            <textarea 
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={partContext ? "Student's answer will appear here..." : "Select a Task Context to load the student's answer, or paste text manually..."}
              className="w-full flex-1 p-4 text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none shadow-sm transition-all text-[15px] leading-relaxed"
            />
          </div>

          <button
            onClick={handleSuggest}
            disabled={loading || !inputText.trim()}
            className="w-full shrink-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 px-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98] text-[15px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Ideas...
              </>
            ) : (
              "Improve Text"
            )}
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="w-full md:w-[55%] bg-slate-50/50 p-8 flex flex-col h-full overflow-hidden">
          <div className="mb-6 shrink-0 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                AI Suggestions
              </h3>
              <p className="text-sm text-slate-500 mt-1">Review and copy the best phrasing.</p>
            </div>
            {suggestions.length > 0 && (
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {suggestions.length} Results
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4 pb-4">
            {suggestions.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <h4 className="text-slate-700 font-bold text-lg mb-2">Ready to improve</h4>
                <p className="text-slate-500 text-sm max-w-[250px] leading-relaxed">Enter some text on the left and click "Improve Text" to generate better alternatives.</p>
              </div>
            )}

            {loading && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between mb-4">
                      <div className="w-28 h-6 bg-slate-200 rounded-md"></div>
                      <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="w-full h-5 bg-slate-200 rounded mb-3"></div>
                    <div className="w-3/4 h-5 bg-slate-200 rounded mb-5"></div>
                    <div className="w-20 h-3 bg-slate-200 rounded mb-2"></div>
                    <div className="w-full h-3 bg-slate-100 rounded mb-1"></div>
                    <div className="w-4/5 h-3 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && suggestions.map((sug, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                
                {/* Decorative left border for types */}
                {sug.type === 'Advanced' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                )}
                {sug.type === 'Standard' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${
                    sug.type === 'Advanced' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {sug.type}
                  </span>
                  
                  <Tooltip title={copiedIndex === idx ? "Copied!" : "Copy to clipboard"} placement="left">
                    <button 
                      onClick={() => handleCopy(sug.rewritten_text, idx)}
                      className={`p-2 rounded-lg transition-all border ${
                        copiedIndex === idx 
                          ? 'bg-green-50 text-green-600 border-green-200' 
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 lg:opacity-0 group-hover:opacity-100 shadow-sm'
                      }`}
                    >
                      {copiedIndex === idx ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  </Tooltip>
                </div>

                <div className="mb-5">
                  <p className="text-base font-semibold text-slate-800 leading-relaxed">
                    "{sug.rewritten_text}"
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Why this works</span>
                  <p className="text-[13.5px] text-slate-600 leading-relaxed">
                    {sug.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
        }
      `}} />
    </Modal>
  );
};

export default AISuggestionModal;
