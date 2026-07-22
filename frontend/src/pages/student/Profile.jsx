import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology', 'Chemical'];
const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      department: user?.department || '',
      academicYear: user?.academicYear || '',
    },
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const endpoint = user?.role === 'student' ? '/student/profile' : '/admin/profile';
      const res = await api.patch(endpoint, data);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const endpoint = user?.role === 'student' ? '/student/avatar' : '/admin/avatar';
      const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to update avatar');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-dark-50 font-black text-2xl">My Profile</h2>
        <p className="text-dark-500 text-sm mt-1">Update your personal information</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-dark-800">
          <div className="relative">
            <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="2xl" />
            <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center cursor-pointer transition-all shadow-lg">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h3 className="text-dark-50 text-xl font-black">{user?.firstName} {user?.lastName}</h3>
            <p className="text-dark-500 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={user?.role === 'admin' ? 'warning' : 'primary'}>
                {user?.role === 'admin' ? '👨‍🏫 Admin' : '🎓 Student'}
              </Badge>
              {user?.department && <Badge variant="info">{user.department}</Badge>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">First Name</label>
              <input className="input" {...register('firstName')} />
            </div>
            <div className="space-y-1.5">
              <label className="label">Last Name</label>
              <input className="input" {...register('lastName')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label">Phone Number</label>
            <input className="input" placeholder="9876543210" {...register('phoneNumber')} />
          </div>
          {user?.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label">Department</label>
                <select className="input" {...register('department')}>
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label">Academic Year</label>
                <select className="input" {...register('academicYear')}>
                  <option value="">Select</option>
                  {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="pt-2">
            <button type="submit" disabled={isSaving || !isDirty} className="btn-primary gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
