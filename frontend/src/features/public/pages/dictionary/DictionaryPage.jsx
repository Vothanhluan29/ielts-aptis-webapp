import React, { useState } from "react";
import { Sparkles, Search, Volume2, BookOpen, Layers, Type, FileText } from "lucide-react";

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    // Simulate AI loading
    setTimeout(() => {
      setResult({
        word: searchTerm.toLowerCase(),
        phonetic: "/pəˈfɔːməns/",
        audio: "us-pronunciation.mp3",
        partOfSpeech: "noun",
        level: "B2",
        definition: "The action or process of carrying out or accomplishing an action, task, or function.",
        aiExplanation: "In the context of exams like IELTS/APTIS, this word frequently appears when discussing work, art, or technology. It refers to how well a person or a machine does a piece of work or an activity.",
        examples: [
          "The team's performance in the recent project was outstanding.",
          "High-performance computers are required for this software."
        ],
        synonyms: ["execution", "accomplishment", "achievement", "operation"]
      });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[80vh] flex flex-col">
      {/* Header Area */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 shadow-sm">
          <BookOpen size={28} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">
          AI Dictionary
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base">
          Look up any word or phrase. Our AI will provide definitions, context, and examples tailored for English proficiency exams.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-12 group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={22} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Type a word to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-16 pl-14 pr-40 text-lg text-slate-700 bg-white border-2 border-slate-200/60 rounded-3xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl px-6 font-bold tracking-wide flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <Sparkles size={18} className="animate-pulse" /> Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles size={18} /> Search
            </span>
          )}
        </button>
      </form>

      {/* Results Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto">
        {!result && !isSearching && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <Layers size={48} className="text-slate-300 mb-4" strokeWidth={1} />
            <p className="text-slate-400 font-medium">Enter a word above to start discovering</p>
          </div>
        )}

        {isSearching && (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-6 bg-slate-100 rounded-lg w-1/4"></div>
            <div className="h-24 bg-slate-100 rounded-2xl w-full mt-8"></div>
            <div className="h-24 bg-slate-100 rounded-2xl w-full"></div>
          </div>
        )}

        {result && !isSearching && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Word Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-8 border-b border-slate-100">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 capitalize mb-3 tracking-tight">
                  {result.word}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-lg uppercase tracking-wider">
                    {result.partOfSpeech}
                  </span>
                  <span className="text-slate-500 font-mono text-lg">{result.phonetic}</span>
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 font-black text-xs rounded-md">
                    {result.level}
                  </span>
                </div>
              </div>
              <button className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors border border-slate-200 shrink-0">
                <Volume2 size={24} />
              </button>
            </div>

            {/* AI Explanation & Definition */}
            <div className="space-y-8">
              
              {/* Core Definition */}
              <div className="flex gap-4">
                <div className="shrink-0 mt-1"><BookOpen size={20} className="text-blue-500" /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5">Definition</h3>
                  <p className="text-lg text-slate-800 font-medium leading-relaxed">{result.definition}</p>
                </div>
              </div>

              {/* AI Context */}
              <div className="flex gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100/50">
                <div className="shrink-0 mt-1"><Sparkles size={20} className="text-purple-500" /></div>
                <div>
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1.5">AI Insights</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">{result.aiExplanation}</p>
                </div>
              </div>

              {/* Examples */}
              <div className="flex gap-4">
                <div className="shrink-0 mt-1"><FileText size={20} className="text-emerald-500" /></div>
                <div className="w-full">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Examples</h3>
                  <ul className="space-y-3">
                    {result.examples.map((ex, idx) => (
                      <li key={idx} className="bg-slate-50 p-4 rounded-xl text-slate-700 italic border border-slate-100/80">
                        "{ex}"
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Synonyms */}
              <div className="flex gap-4">
                <div className="shrink-0 mt-1"><Type size={20} className="text-orange-500" /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Synonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.synonyms.map((syn, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
