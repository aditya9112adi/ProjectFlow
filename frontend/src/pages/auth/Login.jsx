import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, GraduationCap, BookOpen, UserCircle2 } from 'lucide-react';
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
    <div className="h-screen relative flex bg-slate-950 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#2e1065] opacity-90" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(6,182,212,0.1) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(16,185,129,0.1) 0%, transparent 50%)',
      }} />

      {/* Main Split Layout */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row h-full">
        
        {/* Left Side: Brand & Text */}
        <div className="lg:w-1/2 flex flex-col justify-center items-center lg:items-start p-8 lg:p-24 overflow-hidden">
          
          <div className="w-full max-w-lg">
            {/* NIAT Logo */}
            <div className="w-[45vw] max-w-[360px] min-w-[250px] mb-12 mx-auto lg:mx-0 lg:-ml-4">
              <img 
                src="/niat-brand.png" 
                alt="NIAT Brand" 
                className="w-full h-auto object-contain object-left opacity-90 mix-blend-screen" 
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            <div className="space-y-6 text-center lg:text-left">
               <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1]">
                 Streamlining Academic <br className="hidden lg:block" />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                   Innovation
                 </span>
               </h1>
               <p className="text-slate-300 text-lg lg:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
                 Your centralized workspace for collaborative project management, seamless phase submissions, and real-time team synchronization.
               </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8 h-full">
          
          <div className="w-full max-w-[420px] bg-slate-900/60 backdrop-blur-2xl p-6 lg:p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-full overflow-y-auto scrollbar-hide">
            
            <div className="mb-6">
              <h2 className="text-white text-3xl font-bold tracking-tight mb-1">Sign In</h2>
              <p className="text-slate-400 text-sm">Access your academic project workspace</p>
            </div>

            {/* Segmented Control (Tabs) */}
            <div className="flex p-1 bg-slate-950/60 rounded-xl mb-6 border border-white/5 relative">
              <button
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'student' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('student')}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'admin' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('admin')}
              >
                <BookOpen className="w-4 h-4" />
                Admin
              </button>
              
              {/* Sliding Background for Tabs */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out ${
                  activeTab === 'student' 
                    ? 'translate-x-0 bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'translate-x-[calc(100%+8px)] bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              />
            </div>

            {/* Student Form */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit(onStudentSubmit)} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300" htmlFor="login-prn">
                    Student PRN (Last 3 Digits)
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950/50 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all h-[44px]">
                    <div className="flex items-center justify-center pl-4 pr-3 text-slate-500 font-mono text-sm h-full border-r border-slate-800">
                      252921
                    </div>
                    <input
                      id="login-prn"
                      type="text"
                      autoComplete="off"
                      maxLength={3}
                      className="w-16 bg-transparent text-white font-mono text-base text-center focus:outline-none tracking-widest placeholder-slate-700"
                      placeholder="001"
                      {...registerStudent('prn')}
                    />
                    <div className="flex items-center justify-center pr-4 pl-3 text-slate-500 font-mono text-sm h-full border-l border-slate-800">
                      @sguk.ac.in
                    </div>
                  </div>
                  {studentErrors.prn && <p className="text-red-400 text-xs mt-1">⚠ {studentErrors.prn.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 gap-2 mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Enter Dashboard
                    </>
                  )}
                </button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-900 px-4 text-xs text-slate-500 rounded-full">Or continue with</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => toast('Google Sign-In is not configured for Students yet.')}
                  className="w-full h-11 bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold rounded-xl flex items-center justify-center gap-3 transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>

              </form>
            )}

            {/* Admin Form */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit(onAdminSubmit)} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300" htmlFor="login-email">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="off"
                    className={`w-full h-11 bg-slate-950/50 border border-slate-700 rounded-xl px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${adminErrors.email ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                    placeholder="admin@projectflow.com"
                    {...registerAdmin('email')}
                  />
                  {adminErrors.email && <p className="text-red-400 text-xs mt-1">⚠ {adminErrors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-300" htmlFor="login-password">
                      Password
                    </label>
                    <a href="mailto:admin-support@projectflow.com" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`w-full h-11 bg-slate-950/50 border border-slate-700 rounded-xl px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all pr-12 ${adminErrors.password ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                      placeholder="••••••••"
                      {...registerAdmin('password')}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {adminErrors.password && <p className="text-red-400 text-xs mt-1">⚠ {adminErrors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 gap-2 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In to Admin
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
