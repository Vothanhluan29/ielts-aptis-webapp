import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

const SmartBackButton = ({ 
  fallbackPath, 
  customText, 
  themeClass = 'text-indigo-600' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use URL path to determine if we are in admin mode
  const isAdmin = location.pathname.startsWith('/admin');

  const handleBack = () => {
    if (isAdmin) {
      if (window.opener) {
        window.close();
      } else {
        // Fallback in case opened directly
        navigate(-1);
      }
    } else {
      if (fallbackPath) {
        navigate(fallbackPath);
      } else {
        navigate(-1);
      }
    }
  };

  if (isAdmin) {
    return (
      <button 
        onClick={handleBack} 
        className={`mb-6 flex items-center gap-2 text-slate-400 hover:${themeClass} text-sm font-bold transition-all group`}
      >
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
          <X size={14} className="group-hover:scale-110 transition-transform duration-200" />
        </div>
        Close Result Tab
      </button>
    );
  }

  return (
    <button 
      onClick={handleBack} 
      className={`mb-6 flex items-center gap-2 text-slate-400 hover:${themeClass} text-sm font-bold transition-all group`}
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
      {customText || 'Back to History'}
    </button>
  );
};

export default SmartBackButton;
