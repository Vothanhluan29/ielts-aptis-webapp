import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import authApi from '../api/authApi';
import { CheckCircle2, GraduationCap, BookOpen, Sparkles, Eye, EyeOff } from 'lucide-react';

const FEATURES = [
  'Authentic mock tests for IELTS & APTIS',
  'Instant AI grading with detailed feedback',
  'Personalized practice to boost your score',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const redirect = async () => {
    try {
      const user = await authApi.getMe();
      const isAdmin = user.role && (user.role.toLowerCase() === 'admin' || user.role.includes('ADMIN'));
      navigate(isAdmin ? '/admin/dashboard' : '/choose-mode');
    } catch (error) {
      console.error("Failed to fetch user in redirect:", error);
      navigate('/choose-mode');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Authenticating...');
    try {
      const res = await authApi.login(formData.email, formData.password);
      localStorage.setItem('access_token', res.access_token);
      toast.success('Access granted.', { id: tid });
      await redirect();
    } catch {
      toast.error('Invalid credentials.', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) { toast.error('Cannot get Google Token'); return; }
    const tid = toast.loading('Verifying token...');
    try {
      const res = await authApi.loginWithGoogle(credential);
      localStorage.setItem('access_token', res.access_token);
      toast.success('Access granted.', { id: tid });
      await redirect();
    } catch {
      toast.error('Authentication failed.', { id: tid });
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 font-sans selection:bg-blue-500/30 selection:text-blue-900 overflow-hidden relative">

      {/* ── ANIMATED BACKGROUND BLOBS ── */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* ── LEFT PANEL (MODERN LIGHT THEME) ── */}
      <div className="hidden lg:flex w-[45%] bg-transparent p-8 xl:p-12 flex-col justify-between relative overflow-hidden border-r border-blue-200/60">
        
        <div className="relative z-10 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-10 xl:mb-12">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden w-12 h-12">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <p className="text-blue-600/80 text-[10px] font-bold uppercase tracking-[0.2em]">Learning Platform</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Achieve Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Dream Score.
            </span>
          </h2>

          <p className="text-slate-600 text-sm xl:text-base leading-relaxed max-w-md mb-8 font-medium">
            Experience the smartest way to prepare for IELTS & APTIS. Get instant AI feedback, track your progress, and boost your confidence.
          </p>

          <div className="space-y-4">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-max pr-6">
                <div className="bg-blue-50 p-1 rounded">
                  <CheckCircle2 className="text-blue-600" size={14} strokeWidth={3} />
                </div>
                <span className="text-slate-700 font-semibold text-xs xl:text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 opacity-0 animate-fade-in-up animation-delay-200 mt-8">
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
            Supported Frameworks
          </p>
          <div className="flex gap-4">
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-lg flex items-center gap-3 shadow-sm">
              <BookOpen size={16} className="text-blue-600" />
              <div>
                <p className="text-slate-800 font-bold text-sm tracking-wider">IELTS</p>
                
              </div>
            </div>
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-lg flex items-center gap-3 shadow-sm">
              <BookOpen size={16} className="text-indigo-600" />
              <div>
                <p className="text-slate-800 font-bold text-sm tracking-wider">APTIS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (LOGIN FORM) ── */}
      <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-2xl custom-scrollbar relative shadow-[-10px_0_30px_rgba(37,99,235,0.03)] z-10 transition-all duration-500 hover:bg-white/70">
        <div className="min-h-full flex flex-col justify-center items-center p-6 sm:p-8 relative z-10">
          
          <div className="w-full max-w-[400px] py-8 z-10">

            {/* Form Container */}
            <div className="opacity-0 animate-fade-in-up animation-delay-200 bg-white/40 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white backdrop-blur-sm transition-transform duration-500 hover:scale-[1.01] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">System Login</h2>
                <p className="text-slate-500 text-sm font-medium">Authenticate to access your dashboard.</p>
              </div>

              {/* Custom Tab Switch */}
              <div className="flex border-b border-slate-200 mb-8">
                <Link
                  to="/login"
                  className="flex-1 text-center py-3 text-sm font-bold border-b-2 border-blue-600 text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-3 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-blue-600 transition-colors"
                >
                  Create Account
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      disabled={loading}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 tracking-widest pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-sm tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Authenticate</>
                  )}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-400 font-medium text-xs uppercase tracking-wider">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="hover:scale-105 transition-transform rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google login failed')}
                      useOneTap
                      shape="rectangular"
                      theme="outline"
                      size="large"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}