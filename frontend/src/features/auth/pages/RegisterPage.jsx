import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import authApi from '../api/authApi';
import { CheckCircle2, GraduationCap, UserPlus, BookOpen, Sparkles } from 'lucide-react';

const FEATURES = [
  'Full-length mock tests for IELTS & APTIS',
  'AI-powered scoring & instant feedback',
  'Adaptive practice based on your level',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const redirect = async () => {
    try {
      const user = await authApi.getMe();
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/choose-mode');
    } catch {
      navigate('/choose-mode');
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) { toast.error('Cannot get Google Token'); return; }
    const tid = toast.loading('Verifying with Google...');
    try {
      const res = await authApi.loginWithGoogle(credential);
      localStorage.setItem('access_token', res.access_token);
      toast.success('Login successful!', { id: tid });
      await redirect();
    } catch {
      toast.error('Google login failed.', { id: tid });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creating account...');

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      };

      await authApi.register(payload);

      toast.success('Registration successful! Please login.', { id: loadingToast });
      navigate('/login');

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || 'Registration failed.';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">

      {/* ── LEFT PANEL (BRANDING - MODERN GRADIENT) ── */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">

        {/* Soft glowing orbs for background texture */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-float pointer-events-none"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-300 rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-float animation-delay-400 pointer-events-none"></div>

        <div className="relative z-10 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-10 xl:mb-12">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl shadow-white/5">
              <GraduationCap className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">English Master</h1>
              <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Proficiency Platform</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4 drop-shadow-sm">
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">
              Journey Today.
            </span>
          </h2>

          <p className="text-white/90 text-sm xl:text-base leading-relaxed max-w-md mb-8 font-medium">
            Join thousands of successful students achieving their target scores with our interactive platform.
          </p>

          <div className="space-y-3.5">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-sm w-max pr-5 hover:bg-white/20 transition-colors">
                <div className="bg-white/20 p-1 rounded-full">
                  <CheckCircle2 className="text-white" size={16} strokeWidth={2.5} />
                </div>
                <span className="text-white font-semibold text-xs xl:text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 opacity-0 animate-fade-in-up animation-delay-200 mt-6">
          <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase mb-3 flex items-center gap-2">
            <Sparkles size={12} /> Available Modules
          </p>
          <div className="flex gap-3">
            <div className="bg-white/15 border border-white/20 px-4 py-2.5 rounded-xl backdrop-blur-md cursor-default">
              <div className="flex items-center gap-2 mb-0.5">
                <BookOpen size={14} className="text-white" />
                <p className="text-white font-black text-base">IELTS</p>
              </div>
              <p className="text-white/80 text-[10px] font-medium">Academic & General</p>
            </div>
            <div className="bg-white/15 border border-white/20 px-4 py-2.5 rounded-xl backdrop-blur-md cursor-default">
              <div className="flex items-center gap-2 mb-0.5">
                <BookOpen size={14} className="text-white" />
                <p className="text-white font-black text-base">APTIS</p>
              </div>
              <p className="text-white/80 text-[10px] font-medium">British Council</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (REGISTER FORM) ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="min-h-full flex flex-col justify-center items-center p-6 sm:p-8">
          <div className="w-full max-w-[400px] py-8">

            {/* Custom Toggle Switch */}
            <div className="flex bg-slate-200/60 p-1 rounded-full mb-8 relative opacity-0 animate-fade-in-up">
              <Link
                to="/login"
                className="flex-1 text-center py-2.5 text-sm font-bold rounded-full transition-all duration-300 text-slate-500 hover:text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-white shadow-sm text-indigo-600"
              >
                Create Account
              </Link>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 opacity-0 animate-fade-in-up animation-delay-200">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-800 mb-1.5">Join us!</h2>
                <p className="text-slate-500 text-sm font-medium">Start your learning journey today.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 group-focus-within:text-indigo-600 transition-colors">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    disabled={loading}
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 group-focus-within:text-indigo-600 transition-colors">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 group-focus-within:text-indigo-600 transition-colors">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 tracking-wider"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 group-focus-within:text-indigo-600 transition-colors">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    disabled={loading}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2 text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Create Account <UserPlus size={16} /></>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Or continue with</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <div className="flex justify-center hover:scale-[1.02] transition-transform duration-300">
                <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:!w-full [&_iframe]:!w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Login Failed')}
                    theme="filled_blue"
                    shape="rectangular"
                    text="signup_with"
                    size="large"
                  />
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] font-medium text-slate-400 mt-6 opacity-0 animate-fade-in-up animation-delay-400">
              By creating an account, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}