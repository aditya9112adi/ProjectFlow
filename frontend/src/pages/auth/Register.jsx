import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

const DEPARTMENTS = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil',
  'Electrical', 'Information Technology', 'Chemical',
];
const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Enter valid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
  rollNumber: z.string().min(3, 'Roll number required'),
  department: z.string().min(1, 'Select department'),
  academicYear: z.string().min(1, 'Select year'),
  phoneNumber: z.string().optional(),
  section: z.string().optional(),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-dark-950 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="ProjectFlow Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <span className="text-white font-black text-lg">ProjectFlow</span>
        </div>

        <div className="card p-8">
          <div className="mb-8">
            <h2 className="text-dark-50 text-2xl font-black mb-1">Create Student Account</h2>
            <p className="text-dark-500 text-sm">Fill in your academic details to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label">First Name *</label>
                <input className={`input ${errors.firstName ? 'border-red-500/50' : ''}`} placeholder="Alice" {...register('firstName')} />
                {errors.firstName && <p className="text-red-400 text-xs">⚠ {errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="label">Last Name *</label>
                <input className={`input ${errors.lastName ? 'border-red-500/50' : ''}`} placeholder="Johnson" {...register('lastName')} />
                {errors.lastName && <p className="text-red-400 text-xs">⚠ {errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label">Email Address *</label>
              <input type="email" autoComplete="off" className={`input ${errors.email ? 'border-red-500/50' : ''}`} placeholder="alice@university.edu" {...register('email')} />
              {errors.email && <p className="text-red-400 text-xs">⚠ {errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="Min 8 chars, uppercase, number"
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">⚠ {errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label">Roll Number *</label>
                <input className={`input ${errors.rollNumber ? 'border-red-500/50' : ''}`} placeholder="CS2021001" {...register('rollNumber')} />
                {errors.rollNumber && <p className="text-red-400 text-xs">⚠ {errors.rollNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="label">Phone Number</label>
                <input className="input" placeholder="9876543210" {...register('phoneNumber')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="label">Department *</label>
                <select className={`input ${errors.department ? 'border-red-500/50' : ''}`} {...register('department')}>
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-400 text-xs">⚠ {errors.department.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="label">Academic Year *</label>
                <select className={`input ${errors.academicYear ? 'border-red-500/50' : ''}`} {...register('academicYear')}>
                  <option value="">Select</option>
                  {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.academicYear && <p className="text-red-400 text-xs">⚠ {errors.academicYear.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="label">Section</label>
                <input className="input" placeholder="A" {...register('section')} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full h-12 text-base gap-2 mt-2">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-dark-700 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
