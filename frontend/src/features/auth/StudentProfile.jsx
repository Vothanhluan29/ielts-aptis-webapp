import React from "react";
import {
  Camera,
  Mail,
  ShieldCheck,
  KeyRound,
  Save,
  Loader2,
  Target as TargetIcon,
  Lock,
  User,
} from "lucide-react";
import { useStudentProfile } from "./hooks/useStudentProfile";

const StudentProfilePage = () => {
  const {
    user,
    avatarUrl,
    pwdData,
    setPwdData,
    isUpdatingTarget,
    uploadingAvatar,
    submittingPwd,
    fileInputRef,
    handleUpdateTarget,
    handleAvatarChange,
    handleChangePassword,
  } = useStudentProfile();

  const currentTarget = user?.target_band || 6.0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          </div>
          <p className="text-slate-600 ml-13">Manage your account information and security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Avatar & User Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Header Gradient */}
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              
              {/* Avatar Section */}
              <div className="px-6 pb-6 -mt-12">
                <div
                  onClick={() => !uploadingAvatar && fileInputRef.current.click()}
                  className="relative w-24 h-24 mx-auto group cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {uploadingAvatar ? (
                      <Loader2 className="animate-spin text-blue-600" size={28} />
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        className="w-full h-full object-cover"
                        alt="avatar"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-3xl font-bold">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={20} />
                  </div>
                  
                  {/* Upload Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <Camera className="text-white" size={14} />
                  </div>
                  
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </div>

                {/* User Info */}
                <div className="text-center mt-4 space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-600">
                    <Mail size={12} />
                    <span className="lowercase">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Band Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <TargetIcon className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">IELTS Target</h3>
                  <p className="text-sm text-slate-600">Set your goal band score</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={currentTarget}
                    onChange={(e) => handleUpdateTarget(e.target.value)}
                    disabled={isUpdatingTarget}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(v => (
                      <option key={v} value={v}>
                        Band {v.toFixed(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isUpdatingTarget && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    <span>Updating target...</span>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-600">Progress to goal</span>
                    <span className="text-xs font-bold text-emerald-600">{currentTarget}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${(currentTarget / 9) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Security Settings */}
          <div className="lg:col-span-8">
            <form
              onSubmit={handleChangePassword}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
            >
              {/* Section Header */}
              <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Lock className="text-white" size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">Security Settings</h3>
                  <p className="text-sm text-slate-600">Update your password to keep your account secure</p>
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={pwdData.current_password}
                      onChange={(e) => setPwdData({ ...pwdData, current_password: e.target.value })}
                      className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter current password"
                    />
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={pwdData.new_password}
                        onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                        className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter new password"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={pwdData.confirm_password}
                        onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })}
                        className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Confirm new password"
                      />
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                      Include uppercase and lowercase letters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                      Include at least one number
                    </li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={submittingPwd}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submittingPwd ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;