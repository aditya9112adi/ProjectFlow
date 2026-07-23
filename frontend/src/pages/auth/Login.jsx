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
    <div className="h-screen relative flex overflow-hidden bg-dark-950">
      {/* Full-screen background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-dark-900 to-accent-950 opacity-90" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.2) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(217,70,239,0.2) 0%, transparent 60%)',
      }} />

      {/* Top Left Header (Red NIAT & Kolhapur) */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-20 flex items-center gap-4">
        <img 
          src="/niat-brand.png" 
          alt="NIAT Brand" 
          className="h-14 lg:h-16 w-auto object-contain" 
          style={{ filter: 'invert(22%) sepia(95%) saturate(7080%) hue-rotate(352deg) brightness(94%) contrast(118%)' }}
        />
        <span className="text-[#DC2626] font-black text-2xl lg:text-3xl uppercase tracking-wider">Kolhapur</span>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row p-6 lg:p-12 h-full overflow-y-auto lg:overflow-hidden pt-28 lg:pt-12">
        
        {/* Left Side: Brand & Text */}
        <div className="lg:w-1/2 flex flex-col justify-center items-start lg:pr-12 mt-8 lg:mt-0">
           <img src="/logo.png" alt="ProjectFlow Brand Logo" className="h-14 lg:h-16 w-auto object-contain drop-shadow-2xl mb-8" />
           <div className="space-y-4 max-w-lg">
             <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
               Streamlining Academic <br className="hidden lg:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Innovation</span>
             </h1>
             <p className="text-dark-300 text-lg leading-relaxed">
               Your centralized workspace for collaborative project management, seamless phase submissions, and real-time team synchronization.
             </p>
           </div>
        </div>

        {/* Right Side: Login Box */}
        <div className="lg:w-1/2 flex items-center justify-center lg:justify-end mt-12 lg:mt-0 mb-12 lg:mb-0">
          <div className="w-full max-w-md bg-dark-950/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="mb-8 text-center">
            <h2 className="text-white text-3xl font-black mb-2 drop-shadow-sm">Sign In</h2>
            <p className="text-dark-300">Access your academic project workspace</p>
          </div>

          {/* Login Tabs */}
          <div className="flex p-1 bg-dark-900 rounded-xl mb-8">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'student' ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
              }`}
              onClick={() => setActiveTab('student')}
            >
              <GraduationCap className="w-4 h-4" />
              Student Login
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin' ? 'bg-accent-600 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              <BookOpen className="w-4 h-4" />
              Admin Login
            </button>
          </div>

          {/* Student Form */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit(onStudentSubmit)} className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="label" htmlFor="login-prn">Student PRN (Last 3 Digits)</label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-dark-700 bg-dark-800/50 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50 transition-all h-[46px]">
                    <div className="flex items-center justify-center pl-4 pr-2 text-dark-400 bg-dark-900/50 h-full border-r border-dark-700 font-mono text-[15px]">
                      252921
                    </div>
                    <input
                      id="login-prn"
                      type="text"
                      autoComplete="off"
                      maxLength={3}
                      className="w-[50px] bg-transparent text-white font-mono text-[15px] text-center focus:outline-none tracking-widest placeholder-dark-600"
                      placeholder="001"
                      {...registerStudent('prn')}
                    />
                    <div className="flex items-center justify-center pr-4 pl-1 text-dark-400 bg-dark-900/50 h-full border-l border-dark-700 font-mono text-[15px]">
                      @sguk.ac.in
                    </div>
                  </div>
                {studentErrors.prn && <p className="text-red-400 text-xs">⚠ {studentErrors.prn.message}</p>}
                <p className="text-dark-500 text-xs mt-2">
                  Enter the last 3 digits of your PRN (e.g., 083 for 252921083). Only authorized PRNs are permitted.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-12 text-base gap-2 mt-4"
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


            </form>
          )}

          {/* Admin Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit(onAdminSubmit)} className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="off"
                  className={`input ${adminErrors.email ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                  placeholder="kshirsagaraditya9112@gmail.com"
                  {...registerAdmin('email')}
                />
                {adminErrors.email && <p className="text-red-400 text-xs">⚠ {adminErrors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="label mb-0" htmlFor="login-password">Password</label>
                  <a href="mailto:admin-support@projectflow.com" className="text-xs text-accent-500 hover:text-accent-400 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-12 ${adminErrors.password ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                    placeholder="Enter your password"
                    {...registerAdmin('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminErrors.password && <p className="text-red-400 text-xs">⚠ {adminErrors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-12 text-base gap-2 bg-accent-600 hover:bg-accent-700 focus:ring-accent-600/50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-dark-600 text-xs">
              Access is restricted to authorized university personnel and enrolled students.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
