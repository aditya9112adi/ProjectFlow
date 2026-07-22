import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../ui/Avatar.jsx';

const Topbar = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  const notifLink = user?.role === 'admin' ? '/admin/notifications' : '/student/notifications';

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[260px] h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-4 md:px-6 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-all"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <h1 className="text-dark-50 font-bold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={notifLink}
          className="w-9 h-9 rounded-xl hover:bg-dark-800 flex items-center justify-center text-dark-500 hover:text-dark-200 transition-all relative"
        >
          <Bell className="w-4 h-4" />
        </Link>
        {user?.role === 'admin' ? (
          <Link to="/admin/profile" className="ml-1">
            <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
          </Link>
        ) : (
          <div className="ml-1 cursor-default">
            <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
