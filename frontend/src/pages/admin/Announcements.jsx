import { useState } from 'react';
import { Send, Megaphone, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import ProcessingModal from '../../components/ui/ProcessingModal.jsx';

const AnnouncementTypes = [
  { id: 'info', label: 'Information', icon: Info, color: 'text-primary-400', bg: 'bg-primary-400/10' },
  { id: 'success', label: 'Success', icon: CheckCircle, color: 'text-success-400', bg: 'bg-success-400/10' },
  { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-400/10' },
  { id: 'error', label: 'Urgent/Error', icon: AlertCircle, color: 'text-danger-400', bg: 'bg-danger-400/10' },
];

const Announcements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [processing, setProcessing] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setProcessing({ isOpen: true, status: 'loading', message: 'Broadcasting to all students...' });
    
    try {
      const res = await api.post('/admin/notifications/broadcast', { title, message, type });
      const { count } = res.data.data;
      
      setProcessing({ isOpen: true, status: 'success', message: `Announcement sent successfully to ${count} students!` });
      setTitle('');
      setMessage('');
      setType('info');
      
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    } catch (err) {
      console.error(err);
      setProcessing({ isOpen: true, status: 'error', message: err.response?.data?.message || 'Failed to send announcement' });
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Global Announcements</h1>
          <p className="text-dark-400 text-sm mt-1">Broadcast an important message to all registered students in real-time.</p>
        </div>
      </div>

      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800 shadow-xl space-y-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-dark-200">Announcement Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AnnouncementTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-dark-700 bg-dark-950 hover:border-dark-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${t.bg}`}>
                      <Icon className={`w-4 h-4 ${t.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-dark-300'}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Title</label>
            <Input 
              placeholder="e.g., Final Review Date Changed" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-dark-950 border-dark-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Message</label>
            <textarea
              className="w-full bg-dark-950 border border-dark-700 rounded-xl p-4 text-white placeholder:text-dark-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none min-h-[200px]"
              placeholder="Write your detailed announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-dark-800">
            <p className="text-dark-500 text-xs">
              This message will be sent to all active students and cannot be undone.
            </p>
            <Button 
              onClick={handleBroadcast} 
              icon={Send}
              className="px-8 shadow-lg shadow-primary-500/20"
            >
              Broadcast Now
            </Button>
          </div>
        </div>
      </div>

      <ProcessingModal 
        isOpen={processing.isOpen}
        status={processing.status}
        message={processing.message}
      />
    </div>
  );
};

export default Announcements;
