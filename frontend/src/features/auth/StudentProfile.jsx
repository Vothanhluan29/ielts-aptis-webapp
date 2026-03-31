import React from "react";
import {
  Camera,
  Mail,
  Loader2,
  Target as TargetIcon,
  User,
} from "lucide-react";
import { useStudentProfile } from "./hooks/useStudentProfile";

const StudentProfilePage = () => {
  // Đã lược bỏ toàn bộ các biến liên quan đến Password
  const {
    user,
    avatarUrl,
    isUpdatingTarget,
    uploadingAvatar,
    fileInputRef,
    handleUpdateTarget,
    handleAvatarChange,
  } = useStudentProfile();

  const currentTarget = user?.target_band || 6.0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Thu gọn max-w xuống 5xl để 2 thẻ đứng cạnh nhau vừa vặn hơn */}
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <User className="text-white" size={20} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
          </div>
          <p className="text-slate-500 font-medium md:ml-13">Manage your account information and study goals</p>
        </div>

        {/* Chuyển Layout thành Grid 2 cột bằng nhau */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ======================================================== */}
          {/* CARD 1: Avatar & User Info                               */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
            {/* Header Gradient */}
            <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute inset-0 bg-white/10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>
            
            {/* Avatar Section */}
            <div className="px-6 pb-8 -mt-16 flex-1 flex flex-col items-center">
              <div
                onClick={() => !uploadingAvatar && fileInputRef.current.click()}
                className="relative w-32 h-32 group cursor-pointer shrink-0"
              >
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105">
                  {uploadingAvatar ? (
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      className="w-full h-full object-cover"
                      alt="avatar"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-600 text-white text-4xl font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 border-4 border-transparent bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px] group-hover:scale-105">
                  <Camera className="text-white" size={24} />
                </div>
                
                {/* Upload Indicator */}
                <div className="absolute bottom-1 right-1 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-transform group-hover:scale-110">
                  <Camera className="text-white" size={16} />
                </div>
                
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </div>

              {/* User Info */}
              <div className="text-center mt-5 space-y-2">
                <h2 className="text-2xl font-black text-slate-900">{user?.full_name || "Student"}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-sm font-semibold text-slate-600">
                  <Mail size={14} className="text-indigo-500" />
                  <span className="lowercase">{user?.email || "email@example.com"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD 2: Target Band Card                                 */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col transition-all hover:shadow-md">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm shadow-teal-200">
                <TargetIcon className="text-white" size={28} />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="text-xl font-black text-slate-900">IELTS Target</h3>
                <p className="text-sm font-medium text-slate-500">Set your goal band score</p>
              </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="relative">
                <select
                  value={currentTarget}
                  onChange={(e) => handleUpdateTarget(e.target.value)}
                  disabled={isUpdatingTarget}
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-5 py-4 text-lg font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-200 cursor-pointer appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(v => (
                    <option key={v} value={v}>
                      Band {v.toFixed(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none bg-slate-50 pl-2">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isUpdatingTarget && (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl animate-pulse">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating target...</span>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="pt-4 mt-auto border-t border-slate-100">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Progress</span>
                  <span className="text-2xl font-black text-emerald-600 leading-none">{currentTarget}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(currentTarget / 9.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;