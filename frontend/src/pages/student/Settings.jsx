import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-dark-50 font-black text-2xl">Settings</h2>
        <p className="text-dark-500 text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="card p-6">
        <h3 className="text-dark-100 font-bold text-base mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-200 text-sm font-semibold">Theme Mode</p>
            <p className="text-dark-500 text-xs mt-0.5">Currently: {isDark ? 'Dark Mode' : 'Light Mode'}</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-primary-600' : 'bg-dark-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-primary-400" />
          <h3 className="text-dark-100 font-bold text-base">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {['current', 'newPass', 'confirm'].map((field, i) => (
            <div key={field} className="space-y-1.5">
              <label className="label">{i === 0 ? 'Current Password' : i === 1 ? 'New Password' : 'Confirm New Password'}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder={i === 0 ? 'Current password' : i === 1 ? 'New password (min 8 chars)' : 'Confirm password'}
                  value={passwords[field]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
                  required
                />
                {i === 2 && (
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={isSaving} className="btn-primary gap-2">
            {isSaving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
