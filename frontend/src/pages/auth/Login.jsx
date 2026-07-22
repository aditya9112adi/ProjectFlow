import { useState } from 'react';
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

  const { register: registerStudent, handleSubmit: handleStudentSubmit, formState: { errors: studentErrors } } = useForm({
    resolver: zodResolver(studentSchema),
  });

  const { register: registerAdmin, handleSubmit: handleAdminSubmit, formState: { errors: adminErrors } } = useForm({
    resolver: zodResolver(adminSchema),
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

  const onGoogleLogin = () => {
    toast.error('Google Login requires OAuth configuration.');
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
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-dark-900 to-accent-950" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(217,70,239,0.15) 0%, transparent 50%)',
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <span className="text-white font-black text-xl">ProjectFlow</span>
          </div>
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/20 border border-primary-600/30 mb-6">
                <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-primary-400 text-xs font-semibold">Academic Project Management</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                Manage Projects<br />
                <span className="text-gradient">From Idea to Prototype</span>
              </h1>
              <p className="text-dark-400 text-base leading-relaxed max-w-sm">
                A complete workflow system for college field projects — from proposal submission to final prototype approval.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📋', label: 'Proposal Review', desc: 'Submit & track proposals' },
                { icon: '📊', label: 'PPT Submission', desc: 'Upload presentations' },
                { icon: '📄', label: 'Report Upload', desc: 'Submit project reports' },
                { icon: '🚀', label: 'Prototype Demo', desc: 'Final project showcase' },
              ].map((f) => (
                <div key={f.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl mb-2">{f.icon}</p>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-dark-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-dark-600 text-sm">© 2025 ProjectFlow. Academic Excellence Platform.</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <span className="text-white font-black">P</span>
            </div>
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
                <label className="label" htmlFor="login-prn">Student PRN Number</label>
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

              <div className="relative flex items-center py-2 mt-4">
                <div className="flex-grow border-t border-dark-700"></div>
                <span className="flex-shrink-0 mx-4 text-dark-500 text-xs font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-dark-700"></div>
              </div>

              <button
                type="button"
                onClick={onGoogleLogin}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold transition-all border border-gray-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
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
                <label className="label" htmlFor="login-password">Password</label>
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
