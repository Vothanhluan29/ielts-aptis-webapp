import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import authApi from './api/authApi';

const FEATURES = [
  'Full-length mock tests for IELTS & APTIS',
  'AI-powered scoring & instant feedback',
  'Adaptive practice based on your level',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const redirect = async () => {
    try {
      const user = await authApi.getMe();
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/choose-mode');
    } catch {
      navigate('/choose-mode');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Logging in...');
    try {
      const res = await authApi.login(formData.email, formData.password);
      localStorage.setItem('access_token', res.access_token);
      toast.success('Welcome back!', { id: tid });
      await redirect();
    } catch {
      toast.error('Invalid email or password', { id: tid });
    } finally {
      setLoading(false);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;900&family=DM+Sans:wght@400;500;600&display=swap');
        .lp *{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
        .lp-left{
          background:linear-gradient(145deg,#1e1b4b 0%,#312e81 45%,#4338ca 100%);
          position:relative;overflow:hidden;
        }
        .lp-grid{
          position:absolute;inset:0;
          background-image:linear-gradient(rgba(255,255,255,.04)1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.04)1px,transparent 1px);
          background-size:48px 48px;
        }
        .blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.3;}
        .b1{width:380px;height:380px;background:#818cf8;top:-100px;left:-80px;}
        .b2{width:260px;height:260px;background:#a78bfa;bottom:40px;right:-60px;}
        .b3{width:180px;height:180px;background:#38bdf8;bottom:180px;left:40px;}
        .feat-check{width:20px;height:20px;border-radius:6px;flex-shrink:0;margin-top:1px;
          background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);
          display:flex;align-items:center;justify-content:center;}
        .mod-chip{
          display:flex;align-items:center;gap:8px;padding:9px 13px;border-radius:11px;
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);flex:1;
        }
        .inp{
          width:100%;border-radius:9px;border:1.5px solid #e2e8f0;
          padding:11px 13px;font-size:14px;font-weight:500;color:#1e293b;
          outline:none;transition:border-color .17s,box-shadow .17s;background:#fff;
        }
        .inp::placeholder{color:#94a3b8;}
        .inp:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12);}
        .inp:disabled{opacity:.5;cursor:not-allowed;}
        .btn{
          width:100%;padding:12px;border-radius:9px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;
          font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;
          box-shadow:0 4px 18px rgba(99,102,241,.32);transition:all .17s;
        }
        .btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(99,102,241,.42);}
        .btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin .8s linear infinite}
      `}</style>

      <div className="lp" style={{ minHeight:'100vh', display:'flex' }}>

        {/* ── LEFT PANEL ── */}
        <div className="lp-left" style={{ display:'none', width:'46%', flexDirection:'column', justifyContent:'space-between', padding:'44px 48px' }}>
          <style>{`@media(min-width:1024px){.lp-left{display:flex!important}}`}</style>
          <div className="lp-grid"/><div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>

          {/* Logo */}
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:44 }}>
              <div style={{ width:42,height:42,borderRadius:11,background:'rgba(255,255,255,.14)',border:'1px solid rgba(255,255,255,.22)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:'Outfit,sans-serif', fontSize:17, fontWeight:900, color:'white', letterSpacing:'-.3px' }}>EduPro</div>
                <div style={{ fontSize:11, color:'rgba(199,210,254,.55)', fontWeight:500, marginTop:1 }}>English Proficiency Platform</div>
              </div>
            </div>

            <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:38, fontWeight:900, color:'white', lineHeight:1.15, letterSpacing:'-1px', marginBottom:14 }}>
              Achieve Your<br/><span style={{ color:'#a5f3fc' }}>Target Score.</span>
            </h2>
            <p style={{ fontSize:14, color:'rgba(199,210,254,.72)', lineHeight:1.75, maxWidth:360, marginBottom:36 }}>
              Practice smarter with AI-powered feedback and full-length mock exams — for both IELTS and APTIS.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:11 }}>
                  <div className="feat-check">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#a5f3fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize:14, color:'rgba(255,255,255,.82)', fontWeight:500 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module chips */}
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(199,210,254,.4)', letterSpacing:'1px', marginBottom:10 }}>AVAILABLE MODULES</div>
            <div style={{ display:'flex', gap:8 }}>
              {[
                { label:'IELTS', sub:'Academic & General', grad:'linear-gradient(135deg,#3b82f6,#0ea5e9)' },
                { label:'APTIS', sub:'British Council',    grad:'linear-gradient(135deg,#7c3aed,#a21caf)' },
              ].map(({ label, sub, grad }) => (
                <div className="mod-chip" key={label}>
                  <div style={{ width:30,height:30,borderRadius:8,background:grad,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize:12,fontWeight:700,color:'white' }}>{label}</div>
                    <div style={{ fontSize:10,color:'rgba(199,210,254,.45)',marginTop:1 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'40px 24px' }}>
          <div style={{ width:'100%', maxWidth:388 }}>

            {/* Mobile logo */}
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <style>{`@media(min-width:1024px){.mob-logo{display:none!important}}`}</style>
              <div className="mob-logo">
                <div style={{ fontFamily:'Outfit,sans-serif', fontSize:26, fontWeight:900, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>EduPro</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>IELTS · APTIS</div>
              </div>
            </div>

            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', boxShadow:'0 4px 32px rgba(15,23,42,.07)', padding:'32px 28px' }}>
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-.4px', marginBottom:4 }}>Welcome back</h2>
                <p style={{ fontSize:13, color:'#64748b' }}>Sign in to continue your practice</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>Email Address</label>
                  <input className="inp" type="email" name="email" required disabled={loading}
                    value={formData.email} onChange={handleChange} placeholder="name@example.com"/>
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Password</label>
                  </div>
                  <input className="inp" type="password" name="password" required disabled={loading}
                    value={formData.password} onChange={handleChange} placeholder="Enter your password"/>
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading
                    ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Signing in...
                      </span>
                    : 'Sign In'}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
                <div style={{ flex:1, height:1, background:'#f1f5f9' }}/>
                <span style={{ fontSize:10, fontWeight:700, color:'#cbd5e1', letterSpacing:'.6px' }}>OR</span>
                <div style={{ flex:1, height:1, background:'#f1f5f9' }}/>
              </div>

              <div style={{ display:'flex', justifyContent:'center' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google Login Failed')}
                  theme="outline" shape="rectangular" text="signin_with" size="large" width="100%"/>
              </div>

              <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid #f1f5f9', textAlign:'center' }}>
                <p style={{ fontSize:13, color:'#64748b' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ fontWeight:700, color:'#6366f1', textDecoration:'none' }}>Create Account</Link>
                </p>
              </div>
            </div>

            <p style={{ marginTop:14, textAlign:'center', fontSize:11, color:'#94a3b8' }}>
              By signing in, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}