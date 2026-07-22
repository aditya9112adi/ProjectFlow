import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/notification.service.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';

const typeVariant = { success: 'success', error: 'error', warning: 'warning', info: 'info' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 50 });
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-dark-50 font-black text-2xl">Notifications</h2>
          <p className="text-dark-500 text-sm mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm gap-2">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-2 animate-pulse">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n._id} className={`card p-5 transition-all ${!n.isRead ? 'border-primary-600/20 bg-primary-600/3' : ''}`}>
              <div className="flex items-start gap-4">
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-dark-100 text-sm font-semibold">{n.title}</p>
                    <Badge variant={typeVariant[n.type] || 'info'}>{n.type}</Badge>
                  </div>
                  <p className="text-dark-400 text-sm leading-relaxed">{n.message}</p>
                  <p className="text-dark-600 text-xs mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n._id)}
                      className="w-7 h-7 rounded-lg bg-primary-600/10 flex items-center justify-center text-primary-400 hover:bg-primary-600/20 transition-all">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n._id)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
