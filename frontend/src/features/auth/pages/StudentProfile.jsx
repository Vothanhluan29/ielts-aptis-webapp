import {
  Camera,
  Mail,
  Loader2,
  Target as TargetIcon,
  User,
  ShieldCheck,
  Save
} from "lucide-react";
import { useStudentProfile } from "../hooks/useStudentProfile";

const StudentProfilePage = () => {
  const {
    user,
    avatarUrl,
    isUpdatingTarget,
    uploadingAvatar,
    fileInputRef,
    handleUpdateTarget,
    handleAvatarChange,
    // 👇 Thêm các hàm/biến này vào hook của bạn để xử lý form
    profileData,
    setProfileData,
    submittingProfile,
    handleUpdateProfile,
  } = useStudentProfile();

  const currentTarget = user?.target_band || 6.0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile and learning goals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: AVATAR & TARGET BAND                        */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              
              <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col items-center">
                <div
                  onClick={() => !uploadingAvatar && fileInputRef.current.click()}
                  className="relative w-24 h-24 group cursor-pointer shrink-0"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105">
                    {uploadingAvatar ? (
                      <Loader2 className="animate-spin text-blue-600" size={28} />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" crossOrigin="anonymous" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-3xl font-bold">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 border-4 border-transparent bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                    <Camera className="text-white" size={20} />
                  </div>
                  
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Camera className="text-white" size={14} />
                  </div>
                  
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-lg font-bold text-slate-900">{user?.full_name || "Student"}</h2>
                  <p className="text-sm text-slate-500">IELTS Learner</p>
                </div>
              </div>
            </div>

            {/* Target Band Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-200">
                  <TargetIcon className="text-white" size={20} />
                </div>
                <div className="flex-1 mt-0.5">
                  <h3 className="text-base font-bold text-slate-900">IELTS Target</h3>
                  <p className="text-xs text-slate-500">Set your goal score</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <select
                    value={currentTarget}
                    onChange={(e) => handleUpdateTarget(e.target.value)}
                    disabled={isUpdatingTarget}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer appearance-none transition-all disabled:opacity-50"
                  >
                    {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(v => (
                      <option key={v} value={v}>Band {v.toFixed(1)}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {isUpdatingTarget && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-2 rounded-lg animate-pulse">
                    <Loader2 size={14} className="animate-spin" /><span>Updating target...</span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold text-teal-600">{currentTarget}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${(currentTarget / 9.0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: PERSONAL INFORMATION (GIỐNG ẢNH 100%)      */}
          {/* ======================================================== */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full">
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-[#028ee6] flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-200">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Update your account details and preferences</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={profileData?.full_name || ''}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-50 focus:border-[#028ee6] outline-none transition-all text-slate-700 font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">This is the name that will be displayed across the platform</p>
                </div>

                {/* Login Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Login Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-11 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed"
                    />
                    <div className="absolute right-3">
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">
                        READ ONLY
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Email address cannot be changed for security reasons</p>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="text-[#028ee6]" size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1e3a8a] mb-1">Security Notice</h4>
                    <p className="text-sm text-blue-700/80 leading-relaxed">
                      Your profile information is secured and only accessible by system administrators. Changes to your account are logged for security purposes.
                    </p>
                  </div>
                </div>

                {/* Footer / Submit Button */}
                <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {submittingProfile ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;