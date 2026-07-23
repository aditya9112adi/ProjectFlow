import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, GraduationCap, BookOpen, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

const studentSchema = z.object({
  prn: z.string().length(3, 'Enter exactly 3 digits').regex(/^\d{3}$/, 'Must be numbers only'),
});

const adminSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const inputId = activeTab === 'student' ? 'login-prn' : 'login-email';
      const input = document.getElementById(inputId);
      if (input) input.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const { register: registerStudent, handleSubmit: handleStudentSubmit, formState: { errors: studentErrors } } = useForm({
    resolver: zodResolver(studentSchema),
    mode: 'onTouched',
  });

  const { register: registerAdmin, handleSubmit: handleAdminSubmit, formState: { errors: adminErrors } } = useForm({
    resolver: zodResolver(adminSchema),
    mode: 'onTouched',
  });

  const onStudentSubmit = async (data) => {
    setIsLoading(true);
    try {
      const fullPrn = `252921${data.prn.trim()}`;
      const user = await login({ prn: fullPrn });
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid PRN Number. Access Denied.');
    } finally {
      setIsLoading(false);
    }
  };



  const onAdminSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login({ email: data.email, password: data.password });
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-screen relative flex overflow-hidden bg-slate-950">
      {/* Full-screen background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e1b4b] via-[#0f172a] to-[#2e1065] opacity-90" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(6,182,212,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.15) 0%, transparent 60%)',
      }} />

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row p-6 lg:p-12 h-full overflow-y-auto lg:overflow-hidden">
        
        {/* Left Side: Brand & Text */}
        <div className="lg:w-1/2 flex flex-col justify-center items-start lg:pr-12 pt-8 lg:pt-0">
          
          {/* NIAT Logo (Normal Flow) */}
          <div className="-ml-4 lg:-ml-6 w-[30vw] min-w-[200px] mb-8">
            <img 
              src="/niat-brand.png" 
              alt="NIAT Brand" 
              className="w-full h-auto object-contain object-left drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          <div className="space-y-4 max-w-lg">
             <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
               Streamlining Academic <br className="hidden lg:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">Innovation</span>
             </h1>
             <p className="text-slate-300 text-lg leading-relaxed">
               Your centralized workspace for collaborative project management, seamless phase submissions, and real-time team synchronization.
             </p>
          </div>
        </div>

        {/* Right Side: Login Box */}
        <div className="lg:w-1/2 flex items-center justify-center lg:justify-end mb-12 lg:mb-0 h-full">
          <div className="w-full max-w-sm h-[65vh] min-h-[450px] flex flex-col bg-gradient-to-r from-[#1e1b4b]/80 to-[#2e1065]/80 backdrop-blur-xl p-4 lg:p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden mx-auto lg:mx-0">
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2 pb-2 flex flex-col justify-center">
              <div className="mb-4 text-center">
                <h2 className="text-white text-2xl font-black mb-1 drop-shadow-sm">Sign In</h2>
            <p className="text-slate-300 text-sm">Access your academic project workspace</p>
          </div>

          {/* Login Tabs */}
          <div className="flex p-1 bg-slate-800 rounded-xl mb-4 border border-white/5">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'student' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('student')}
            >
              <GraduationCap className="w-3 h-3" />
              Student Login
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              <BookOpen className="w-3 h-3" />
              Admin Login
            </button>
          </div>

          {/* Student Form */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit(onStudentSubmit)} className="space-y-3 animate-fade-in">
              <div className="space-y-1">
                <label className="label text-xs" htmlFor="login-prn">Student PRN (Last 3 Digits)</label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all h-[36px]">
                    <div className="flex items-center justify-center pl-3 pr-2 text-slate-400 bg-slate-900/50 h-full border-r border-slate-700 font-mono text-[13px]">
                      252921
                    </div>
                    <input
                      id="login-prn"
                      type="text"
                      autoComplete="off"
                      maxLength={3}
                      className="w-[40px] bg-transparent text-white font-mono text-[13px] text-center focus:outline-none tracking-widest placeholder-slate-600"
                      placeholder="001"
                      {...registerStudent('prn')}
                    />
                    <div className="flex items-center justify-center pr-3 pl-1 text-slate-400 bg-slate-900/50 h-full border-l border-slate-700 font-mono text-[13px]">
                      @sguk.ac.in
                    </div>
                  </div>
                {studentErrors.prn && <p className="text-red-400 text-[10px]">⚠ {studentErrors.prn.message}</p>}
                <p className="text-slate-400 text-[10px] mt-1 leading-tight">
                  Enter last 3 digits. Only authorized PRNs permitted.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-7 text-xs gap-1.5 mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center justify-center transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-3 h-3" />
                    Enter Dashboard
                  </>
                )}
              </button>
              
              <div className="relative mt-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-slate-900/60 px-3 text-slate-500">Or</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => toast('Google Sign-In is not configured for Students yet.')}
                className="w-full h-7 mt-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-700/50 hover:border-slate-500"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>


            </form>
          )}

          {/* Admin Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit(onAdminSubmit)} className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="off"
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent hover:border-slate-600 transition-all duration-300 ${adminErrors.email ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                  placeholder="kshirsagaraditya9112@gmail.com"
                  {...registerAdmin('email')}
                />
                {adminErrors.email && <p className="text-red-400 text-[10px]">⚠ {adminErrors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300" htmlFor="login-password">Password</label>
                  <a href="mailto:admin-support@projectflow.com" className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent hover:border-slate-600 transition-all duration-300 pr-10 ${adminErrors.password ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                    placeholder="Enter your password"
                    {...registerAdmin('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminErrors.password && <p className="text-red-400 text-xs">⚠ {adminErrors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-7 text-xs gap-1.5 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-3 h-3" />
                    Admin Login
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              Access is restricted to authorized university personnel and enrolled students.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
