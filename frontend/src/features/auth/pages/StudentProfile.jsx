import {
  Camera,
  Mail,
  Loader2,
  User,
  ShieldCheck,
  Save,
  Trophy,
  Target,
  Zap,
  BookOpen
} from "lucide-react";
import { useStudentProfile } from "../hooks/useStudentProfile";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dashboardAptisStudentApi from "../../public/api/APTIS/dashboard/dashboardAptisStudentApi";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { message } from "antd";

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

  const [statsLoading, setStatsLoading] = useState(false);
  const [skillStats, setSkillStats] = useState([]);
  const [levelInfo, setLevelInfo] = useState({ cefr: "A0", title: "Novice", tests: 0 });

  useEffect(() => {
    // Only fetch stats if we are on Aptis platform (or in general)
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await dashboardAptisStudentApi.getOverviewStats();
        
        // Process data for Radar chart
        const skillMap = {
          "LISTENING": "Listening",
          "READING": "Reading",
          "WRITING": "Writing",
          "SPEAKING": "Speaking",
          "GRAMMAR_VOCAB": "Grammar"
        };
        
        const chartData = response.skill_stats.map(s => ({
          subject: skillMap[s.skill] || s.skill,
          A: Math.round(s.average_score || 0),
          fullMark: 50 // Assuming 50 is max score for Aptis skills
        }));
        setSkillStats(chartData);

        // Process Level info
        const cefr = response.full_test_stats.highest_cefr || "N/A";
        let title = "Novice";
        if (cefr === "A1") title = "Apprentice";
        if (cefr === "A2") title = "Explorer";
        if (cefr === "B1") title = "Adept";
        if (cefr === "B2") title = "Expert";
        if (cefr === "C") title = "Master";

        setLevelInfo({
          cefr,
          title,
          tests: response.full_test_stats.total_exams
        });

      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const theme = {
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

  // Colors for skill bars
  const skillColors = {
    "Listening": "bg-emerald-500",
    "Reading": "bg-blue-500",
    "Writing": "bg-red-500",
    "Speaking": "bg-amber-500",
    "Grammar": "bg-purple-500"
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ===== PAGE TITLE ===== */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 m-0 tracking-tight">Profile & Attributes</h1>
        <p className="text-slate-400 text-sm mt-1 m-0">Manage your account and view your RPG aptitude stats</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- LEFT COLUMN: AVATAR & STATS --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center justify-center p-8"
               style={{ background: `linear-gradient(180deg, ${theme.bannerFrom}12 0%, #ffffff 100%)` }}>
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

              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>


              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </div>

            <div className="text-center w-full">
              <h2 className="text-xl font-extrabold text-slate-900 m-0 break-words">
                {user?.full_name || "Student"}
              </h2>

            </div>
          </div>

          {/* Account Settings Form Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-slate-400"/> Settings
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData?.full_name || ""}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-slate-700 text-[14px] font-medium ${theme.focusRing} focus:ring-4`}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Login Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-400 text-[14px] font-medium cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProfile}
                className={`
                  ${theme.btn} text-white font-bold py-2.5 px-4 rounded-lg
                  flex items-center gap-2 transition-all shadow-sm
                  hover:-translate-y-0.5 w-full justify-center text-[14px]
                `}
              >
                {submittingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: GAMIFIED STATS --- */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 relative overflow-hidden">
            {/* Background elements for gaming vibe */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8">
              
              {/* Radar Chart */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <h3 className="text-[16px] font-black text-slate-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={18} className="text-yellow-500" fill="currentColor"/> Aptitude Radar
                </h3>
                
                {statsLoading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                ) : skillStats.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillStats}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} axisLine={false} />
                        <Radar
                          name="Student"
                          dataKey="A"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
                    No data available
                  </div>
                )}
              </div>

              {/* Skill Bars */}
              <div className="w-full md:w-1/2 flex flex-col justify-center gap-5">
                <h3 className="text-[16px] font-black text-slate-800 mb-1 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-500" fill="currentColor"/> Skill Attributes
                </h3>

                {statsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                  </div>
                ) : skillStats.map((stat, idx) => (
                  <div key={idx} className="w-full">
                    <div className="flex justify-between text-[12px] font-bold mb-1.5">
                      <span className="text-slate-600 uppercase tracking-wider">{stat.subject}</span>
                      <span className="text-slate-800">{stat.A} <span className="text-slate-400">/ 50</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                      <div 
                        className={`h-full ${skillColors[stat.subject] || 'bg-indigo-500'} transition-all duration-1000 ease-out`}
                        style={{ width: `${(stat.A / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
            
          </div>
          
          {/* Security notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className={`text-[14px] font-bold text-slate-800 mb-1 m-0`}>Account Security</h4>
              <p className={`text-[13px] text-slate-500 leading-relaxed m-0`}>
                Your profile information and test aptitude stats are securely logged. Only system administrators can modify critical information.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentProfilePage;
