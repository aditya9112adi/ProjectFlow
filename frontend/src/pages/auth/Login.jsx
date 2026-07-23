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
    <div className="h-screen bg-dark-950 flex overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-dark-900 to-accent-950" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(217,70,239,0.15) 0%, transparent 50%)',
        }} />
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 w-full h-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ProjectFlow Logo" className="w-11 h-11 object-contain drop-shadow-lg" />
            <span className="text-white font-black text-xl">ProjectFlow</span>
          </div>
          <div className="flex-1 flex items-center justify-center my-4 min-h-0">
            <img 
              src="/login-illustration.png" 
              alt="ProjectFlow Workflow" 
              className="w-full h-full max-w-xl object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo.png" alt="ProjectFlow Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="text-white font-black text-lg">ProjectFlow</span>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-dark-50 text-3xl font-black mb-2">Sign In</h2>
            <p className="text-dark-500">Access your academic project workspace</p>
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
  );
};

export default Login;
