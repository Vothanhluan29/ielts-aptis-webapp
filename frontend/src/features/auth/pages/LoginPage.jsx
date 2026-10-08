import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import authApi from '../api/authApi';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authApi.getMe();
        if (user) {
          const isAdmin = user.role && (user.role.toLowerCase() === 'admin' || user.role.includes('ADMIN'));
          const isTeacher = user.role && (user.role.toLowerCase() === 'teacher' || user.role.includes('TEACHER'));
          if (isAdmin) navigate('/admin/dashboard', { replace: true });
          else if (isTeacher) navigate('/teacher/dashboard', { replace: true });
          else navigate('/aptis/dashboard', { replace: true });
        }
      } catch (err) {
        // Not authenticated, stay on login page
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.submit) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
      delete newErrors.submit;
      setErrors(newErrors);
    }
  };

  const redirect = async () => {
    try {
      const user = await authApi.getMe();
      const isAdmin = user.role && (user.role.toLowerCase() === 'admin' || user.role.includes('ADMIN'));
      const isTeacher = user.role && (user.role.toLowerCase() === 'teacher' || user.role.includes('TEACHER'));
      if (isAdmin) navigate('/admin/dashboard');
      else if (isTeacher) navigate('/teacher/dashboard');
      else navigate('/aptis/dashboard');
    } catch (error) {
      console.error("Failed to fetch user in redirect:", error);
      navigate('/aptis/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    setLoading(true);
    const tid = toast.loading('Authenticating...');
    try {
      await authApi.login(formData.email, formData.password);
      toast.success('Access granted.', { id: tid });
      await redirect();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password.';
      toast.error(errorMsg, { id: tid });
      setErrors((prev) => ({ ...prev, submit: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) { toast.error('Cannot get Google Token'); return; }
    const tid = toast.loading('Verifying token...');
    try {
      await authApi.loginWithGoogle(credential);
      toast.success('Access granted.', { id: tid });
      await redirect();
    } catch {
      toast.error('Authentication failed.', { id: tid });
    }
  };

  if (checkingAuth) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center font-sans overflow-hidden bg-slate-900">
        <AuthBackground />
        <div className="z-10 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-blue-200 text-sm font-medium animate-pulse tracking-widest uppercase">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden p-4 sm:p-6">
      
      {/* 3D Animated Background */}
      <AuthBackground />

      {/* Glassmorphism Card */}
      <div
        className="relative z-10 w-full max-w-[420px] flex flex-col items-center"
        style={{ animation: 'cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* ── LOGO ── */}
        <div className="flex flex-col items-center mb-7" style={{ animation: 'slideDown 0.6s ease-out 0.1s both' }}>
          <div
            className="relative mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(150,200,255,0.5))',
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '2px solid rgba(200,220,255,0.5)',
                boxShadow: '0 8px 32px rgba(0,30,120,0.4), 0 0 0 6px rgba(150,200,255,0.1)',
              }}
            >
              <img src="/logo.jpg" alt="Greenwich Logo" className="w-full h-full object-contain" />
            </div>
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(150,200,255,0.3)',
                transform: 'scale(1.15)',
                animation: 'logoPulse 3s ease-in-out infinite',
              }}
            />
          </div>
          <p className="text-blue-200/80 text-xs font-semibold tracking-[0.25em] uppercase">University of</p>
          <h1
            className="text-white text-2xl font-black tracking-[0.2em] mt-0.5"
            style={{ textShadow: '0 0 30px rgba(150,200,255,0.4)' }}
          >
            GREENWICH
          </h1>
        </div>

        {/* ── GLASS FORM CARD ── */}
        <div
          className="w-full rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px rgba(0, 10, 60, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            animation: 'slideUp 0.7s ease-out 0.2s both',
          }}
        >
          {/* Tab Header */}
          <div
            className="flex"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Link
              to="/login"
              className="flex-1 py-4 text-center text-sm font-bold tracking-wide transition-all"
              style={{
                color: 'rgba(255,255,255,0.95)',
                borderBottom: '2px solid rgba(150,200,255,0.8)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 py-4 text-center text-sm font-medium tracking-wide transition-all hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '2px solid transparent' }}
            >
              Create Account
            </Link>
          </div>

          {/* Form Body */}
          <div className="p-8">

            {errors.submit && (
              <div
                className="mb-5 p-3 rounded-xl text-sm text-center font-medium flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(220,50,50,0.15)',
                  border: '1px solid rgba(255,100,100,0.3)',
                  color: '#ff9999',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-blue-200/60 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@greenwich.edu"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-blue-300/30 outline-none transition-all disabled:opacity-40"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: errors.email ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                  }}
                  onFocus={(e) => { e.target.style.border = '1px solid rgba(150,200,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                  onBlur={(e) => { e.target.style.border = errors.email ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-blue-200/60 mb-2 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-blue-300/30 outline-none transition-all disabled:opacity-40 pr-11 tracking-widest"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.password ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(255,255,255,0.12)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(150,200,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                    onBlur={(e) => { e.target.style.border = errors.password ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(150,200,255,0.5)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm tracking-wide"
                style={{
                  background: loading
                    ? 'rgba(150,200,255,0.3)'
                    : 'linear-gradient(135deg, rgba(100,160,255,0.9) 0%, rgba(60,100,220,0.9) 100%)',
                  color: 'white',
                  border: '1px solid rgba(150,200,255,0.4)',
                  boxShadow: '0 8px 24px rgba(60,100,220,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 12px 32px rgba(60,100,220,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(60,100,220,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    Authenticate
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(150,200,255,0.4)' }}>
                Or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <div
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(150,200,255,0.35)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(100,150,255,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google login failed')}
                  shape="rectangular"
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.5; transform: scale(1.15); }
          50%       { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
