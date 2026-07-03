import React from 'react';
import { Save, RefreshCw, X, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const DraftRestoreBanner = ({ 
  draftExists, 
  lastSavedTime, 
  onRestore, 
  onDiscard 
}) => {
  if (!draftExists) return null;

  return (
    <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500 relative z-10">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
            <Save size={18} />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-amber-900 m-0 leading-tight mb-1">
              Unsaved Draft Detected
            </h4>
            <p className="text-sm text-amber-700/80 m-0 flex items-center gap-1.5 font-medium">
              <Clock size={13} />
              You have an unsaved draft from {lastSavedTime ? dayjs(lastSavedTime).fromNow() : 'earlier'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pl-11 md:pl-0">
          <button
            type="button"
            onClick={onRestore}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 hover:-translate-y-0.5 transition-all shadow-sm focus:outline-none"
          >
            <RefreshCw size={14} />
            Restore Draft
          </button>
          
          <button
            type="button"
            onClick={onDiscard}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-amber-200 text-amber-700 text-sm font-bold rounded-lg hover:bg-amber-50 transition-colors focus:outline-none"
            title="Discard Draft"
          >
            <X size={16} />
            <span className="md:hidden">Discard</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default DraftRestoreBanner;
