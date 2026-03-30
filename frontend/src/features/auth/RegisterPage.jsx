import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // 👈 Import Toast
import authApi from './api/authApi';

const RegisterPage = () => {
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
    
    // 1. Validate: Check khớp mật khẩu
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
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <h1 className="text-6xl font-black mb-4 leading-tight">
              IELTS<br />
              <span className="text-cyan-200">PRO</span>
            </h1>
            <div className="w-20 h-1.5 bg-cyan-300 rounded-full"></div>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">
            Join Thousands of<br />
            Successful Students
          </h2>
          
          <p className="text-lg text-blue-100 leading-relaxed max-w-md mb-12">
            Start your journey to achieving your target IELTS band score with personalized 
            practice, expert feedback, and comprehensive mock tests.
          </p>

          {/* Benefits List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">Unlimited practice tests</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">Instant AI-powered feedback</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">Track your progress over time</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              IELTS PRO
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Create Your Account
              </h2>
              <p className="text-slate-600">
                Start your IELTS learning journey today!
              </p>
            </div>

            {/* REGISTER FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="
                    w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3
                    text-slate-800 placeholder-slate-400 font-medium
                    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    outline-none transition disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  disabled={loading}
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="
                    w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3
                    text-slate-800 placeholder-slate-400 font-medium
                    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    outline-none transition disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="
                    w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3
                    text-slate-800 placeholder-slate-400 font-medium
                    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    outline-none transition disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  disabled={loading}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="
                    w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3
                    text-slate-800 placeholder-slate-400 font-medium
                    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    outline-none transition disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 
                  py-3.5 font-bold text-white shadow-lg shadow-indigo-200
                  hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl
                  focus:ring-4 focus:ring-indigo-300
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;  