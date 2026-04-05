import {
  Camera,
  Mail,
  Loader2,
  User,
  ShieldCheck,
  Save
} from "lucide-react";
import { useStudentProfile } from "../hooks/useStudentProfile";

const StudentProfilePage = () => {
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans flex justify-center">
      {/* Box chính - Căn giữa và giới hạn chiều rộng */}
      <div className="w-full max-w-3xl">
        
        {/* Header Text */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-2">Manage your profile and account preferences</p>
        </div>

        {/* ======================================================== */}
        {/* SINGLE COMBINED CARD                                     */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Banner linear (Nền phía trên avatar) */}
          <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="px-6 sm:px-10 pb-10">
            
            {/* Avatar Section (Bị đẩy lên đè lên banner) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 mb-10">
              <div
                onClick={() => !uploadingAvatar && fileInputRef.current.click()}
                className="relative w-28 h-28 sm:w-32 sm:h-32 group cursor-pointer shrink-0"
              >
                <div className="w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  {uploadingAvatar ? (
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-600 text-white text-4xl font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Overlay Hover Effect */}
                <div className="absolute inset-0 border-4 border-transparent bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                  <Camera className="text-white" size={24} />
                </div>
                
                {/* Mini Camera Icon */}
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Camera className="text-white" size={14} />
                </div>
                
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </div>

              {/* Tên và Role */}
              <div className="text-center sm:text-left pb-2">
                <h2 className="text-2xl font-bold text-slate-900">{user?.full_name || "Student"}</h2>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  Student Account
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-slate-100 mb-8" />

            {/* Form Section */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={profileData?.full_name || ''}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 ml-1">This is the name that will be displayed across the platform</p>
                </div>

                {/* Login Email */}
                <div className="col-span-1 sm:col-span-2">
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
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-md tracking-wider">
                        READ ONLY
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 ml-1">Email address cannot be changed for security reasons</p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 mt-8">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Security Notice</h4>
                  <p className="text-sm text-blue-700/80 leading-relaxed">
                    Your profile information is secured and only accessible by system administrators. Changes to your account are logged for security purposes.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 mt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed w-full sm:w-auto justify-center"
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
  );
};

export default StudentProfilePage;