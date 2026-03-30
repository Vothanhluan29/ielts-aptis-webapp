import React, { useRef } from 'react';
import { User, Mail, ShieldCheck, Camera, Save, Loader2, CheckCircle2, Crown } from 'lucide-react';
import { useAdminProfile } from '../../hooks/profile/useAdminProfile';

const AdminProfilePage = () => {
  const { admin, loading, updating, handleUpdateInfo, handleAvatarChange } = useAdminProfile();
  const fileInputRef = useRef(null);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} />
          <p className="text-slate-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* ===== HEADER ===== */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Admin Profile
              </h1>
              <p className="text-slate-600 text-sm">
                Manage your administrator account settings
              </p>
            </div>
          </div>
        </header>

        {/* ===== GRID LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- LEFT COLUMN: Profile Card --- */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header Gradient */}
              <div className="h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              </div>

              {/* Avatar Section */}
              <div className="px-6 pb-6 -mt-16">
                <div
                  className="relative group cursor-pointer w-28 h-28 mx-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative z-10">
                    {admin?.avatar_url ? (
                      <img
                        src={admin.avatar_url}
                        alt="Admin Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                        {admin?.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Camera className="text-white" size={24} />
                  </div>

                  {/* Camera Badge */}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center border-4 border-white shadow-lg z-30">
                    <Camera className="text-white" size={16} />
                  </div>

                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => handleAvatarChange(e.target.files[0])}
                    accept="image/*"
                  />
                </div>

                {/* User Info */}
                <div className="text-center mt-6 space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {admin?.full_name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {admin?.email}
                  </p>

                  {/* Admin Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      Administrator
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6" />

                {/* Status Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600">Account Status</p>
                        <p className="text-sm font-bold text-emerald-600">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* --- RIGHT COLUMN: Personal Info Form --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              {/* Section Header */}
              <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <User size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Personal Information
                  </h3>
                  <p className="text-sm text-slate-600">
                    Update your account details and preferences
                  </p>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateInfo({ full_name: e.target.full_name.value });
                }}
                className="space-y-6"
              >
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      name="full_name"
                      type="text"
                      defaultValue={admin?.full_name}
                      className="w-full px-4 py-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Enter your full name"
                    />
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">
                    This is the name that will be displayed across the admin panel
                  </p>
                </div>

                {/* Email Field (Disabled) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Login Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      defaultValue={admin?.email}
                      className="w-full px-4 py-3.5 pl-12 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                    />
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        Read Only
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 ml-1">
                    Email address cannot be changed for security reasons
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Security Notice
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your profile information is secured and only accessible by system administrators. 
                      Changes to your account are logged for security purposes.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all active:scale-95 shadow-lg"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Saving Changes...</span>
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
    </div>
  );
};

export default AdminProfilePage;