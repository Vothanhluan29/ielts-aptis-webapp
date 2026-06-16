import {
  Camera,
  Mail,
  Loader2,
  User,
  ShieldCheck,
  Save
} from "lucide-react";
import { useStudentProfile } from "../hooks/useStudentProfile";
import { useLocation } from "react-router-dom";

const StudentProfilePage = () => {
  const location = useLocation();
  const isAptis = location.pathname.startsWith("/aptis");

  const {
    user,
    avatarUrl,
    uploadingAvatar,
    fileInputRef,
    handleAvatarChange,
    profileData,
    setProfileData,
    submittingProfile,
    handleUpdateProfile,
  } = useStudentProfile();

  const theme = isAptis
    ? {
        bannerFrom: "#6366f1",
        bannerTo:   "#a5b4fc",
        avatarGrad: "linear-gradient(135deg, #6366f1, #818cf8)",
        badge:      "bg-indigo-100 text-indigo-700",
        focusRing:  "focus:ring-indigo-50 focus:border-indigo-500",
        btn:        "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
        noticeBox:  "bg-indigo-50/70 border-indigo-100",
        noticeIcon: "bg-indigo-100 text-indigo-600",
        noticeTitle:"text-indigo-900",
        noticeText: "text-indigo-700/80",
        cameraIcon: "bg-indigo-600",
      }
    : {
        bannerFrom: "#3b82f6",
        bannerTo:   "#7c3aed",
        avatarGrad: "linear-gradient(135deg, #3b82f6, #6366f1)",
        badge:      "bg-blue-100 text-blue-700",
        focusRing:  "focus:ring-blue-50 focus:border-blue-500",
        btn:        "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
        noticeBox:  "bg-blue-50/80 border-blue-100",
        noticeIcon: "bg-blue-100 text-blue-600",
        noticeTitle:"text-blue-900",
        noticeText: "text-blue-700/80",
        cameraIcon: "bg-blue-600",
      };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">

      {/* ===== PAGE TITLE ===== */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 m-0 tracking-tight">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1 m-0">Manage your profile and account preferences</p>
      </div>

      {/* ===== MAIN CARD (SPLIT LAYOUT) ===== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">

        {/* --- LEFT PANEL: AVATAR --- */}
        <div 
          className="w-full md:w-[35%] flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-100"
          style={{ background: `linear-gradient(180deg, ${theme.bannerFrom}12 0%, #ffffff 100%)` }}
        >
          <div
            onClick={() => !uploadingAvatar && fileInputRef.current.click()}
            className="relative w-32 h-32 group cursor-pointer shrink-0 mb-5"
          >
            <div className="w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              {uploadingAvatar ? (
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              ) : avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" crossOrigin="anonymous" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
                  style={{ background: theme.avatarGrad }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>

            {/* Camera badge */}
            <div className={`absolute bottom-1 right-1 w-9 h-9 ${theme.cameraIcon} rounded-full flex items-center justify-center border-[3px] border-white shadow-sm`}>
              <Camera className="text-white" size={14} />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>

          <div className="text-center w-full">
            <h2 className="text-xl font-extrabold text-slate-900 m-0 break-words">
              {user?.full_name || "Student"}
            </h2>
            <span className={`inline-block mt-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${theme.badge}`}>
              Student Account
            </span>
          </div>
        </div>

        {/* --- RIGHT PANEL: FORM --- */}
        <div className="w-full md:w-[65%] p-6 sm:p-10">
          <form onSubmit={handleUpdateProfile} className="space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  required
                  value={profileData?.full_name || ""}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none transition-all text-slate-700 text-[15px] font-medium ${theme.focusRing} focus:ring-4`}
                  placeholder="Enter your full name"
                />
              </div>
              <p className="text-[12px] text-slate-400 mt-2 ml-1">
                This is the name displayed across the platform
              </p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">
                Login Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-400 text-[15px] font-medium cursor-not-allowed"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-slate-100 text-slate-400 text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider">
                  READ ONLY
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-2 ml-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            {/* Security notice */}
            <div className={`${theme.noticeBox} border rounded-xl p-5 flex items-start gap-3 mt-4`}>
              <div className={`w-10 h-10 rounded-full ${theme.noticeIcon} flex items-center justify-center shrink-0`}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className={`text-[14px] font-bold ${theme.noticeTitle} mb-1 m-0`}>Security Notice</h4>
                <p className={`text-[13px] ${theme.noticeText} leading-relaxed m-0`}>
                  Your profile information is secured and only accessible by system administrators. Changes to your account are logged for security purposes.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submittingProfile}
                className={`
                  ${theme.btn} text-white font-bold py-3.5 px-8 rounded-xl
                  flex items-center gap-2.5 transition-all shadow-md
                  hover:shadow-lg hover:-translate-y-0.5
                  disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed
                  w-full sm:w-auto justify-center text-[15px]
                `}
              >
                {submittingProfile
                  ? <Loader2 className="animate-spin" size={18} />
                  : <Save size={18} />
                }
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;