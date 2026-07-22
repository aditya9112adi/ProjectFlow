import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../ui/Avatar.jsx';

const Sidebar = ({ navItems, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-[260px] bg-dark-900 border-r border-dark-800 z-40 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-dark-50 font-black text-base">ProjectFlow</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-dark-500 hover:text-dark-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-dark-800 p-3">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 transition-all">
            <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-dark-100 text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-dark-600 text-xs capitalize">{user?.role}</p>
            </div>
            <button
              onClick={() => logout()}
              className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-dark-600 hover:text-red-400 transition-all flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
