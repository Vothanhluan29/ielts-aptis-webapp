import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../api/authApi';
import { CheckCircle2, GraduationCap, UserPlus } from 'lucide-react';

const FEATURES = [
  'Full-length mock tests for IELTS & APTIS',
  'AI-powered scoring & instant feedback',
  'Adaptive practice based on your level',
];

export default function RegisterPage() {
  const navigate = useNavigate();
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
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* ── LEFT PANEL (BRANDING) ── */}
      <div className="hidden lg:flex w-[45%] bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Lớp lưới mờ trang trí (Background Pattern) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
              <GraduationCap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">English Master</h1>
              <p className="text-indigo-200 text-xs font-medium">English Proficiency Platform</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            Start Your <br />
            <span className="text-cyan-300">Journey Today.</span>
          </h2>
          
          <p className="text-indigo-200 text-base leading-relaxed max-w-md mb-10">
            Join thousands of successful students achieving their target scores with our interactive platform.
          </p>

          <div className="space-y-4">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="text-cyan-300 shrink-0" size={20} />
                <span className="text-white/90 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10">
          <p className="text-xs font-bold text-indigo-300 tracking-widest uppercase mb-4">Available Modules</p>
          <div className="flex gap-4">
            <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-white font-bold">IELTS</p>
              <p className="text-indigo-200 text-xs">Academic & General</p>
            </div>
            <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-white font-bold">APTIS</p>
              <p className="text-indigo-200 text-xs">British Council</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (REGISTER FORM) ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto">
        
        <div className="w-full max-w-md my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl mb-3 shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-800">EduPro</h1>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Account</h2>
              <p className="text-slate-500 text-sm">Start your learning journey today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  required 
                  disabled={loading}
                  value={formData.full_name} 
                  onChange={handleChange} 
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  disabled={loading}
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  disabled={loading}
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  required 
                  disabled={loading}
                  value={formData.confirm_password} 
                  onChange={handleChange} 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-50"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 mt-2 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <UserPlus size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
          <p className="text-center text-xs text-slate-400 mt-8">
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
      
    </div>
  );
}