import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, PieChart, DollarSign, User, FolderPlus, Plus } from 'lucide-react';

const navItems = [
  { to: '/records', label: 'Records', icon: <List /> },
  { to: '/analysis', label: 'Analysis', icon: <PieChart /> },
  { to: '/budget', label: 'Budget', icon: <DollarSign /> },
  { to: '/accounts', label: 'Accounts', icon: <User /> },
  { to: '/categories', label: 'Categories', icon: <FolderPlus /> },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-end animate-fade-in">
      <div className="lux-bottom-bar flex gap-4 px-6 py-3 rounded-full shadow-2xl border border-white/30 relative">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center transition-all duration-400 ease-luxury select-none group ${isActive ? 'lux-nav-popout' : 'lux-nav-inbar'}`
            }
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.01em', minWidth: 56 }}
            tabIndex={0}
          >
            {/* Icon */}
            <span className={`flex items-center justify-center w-12 h-12 ${item.label === 'Records' ? 'text-3xl' : 'text-3xl'} transition-all duration-400`}
              aria-hidden="true"
            >
              <span className="lux-nav-icon-bubble flex items-center justify-center w-12 h-12">
                {item.icon}
              </span>
            </span>
            {/* Label */}
            <span className="text-xs font-semibold tracking-wide mt-0.5 lux-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
      <style>{`
        .lux-bottom-bar {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          border-radius: 9999px;
          border: 1.5px solid rgba(245,247,250,0.18);
          backdrop-filter: blur(18px);
        }
        .lux-nav-inbar .lux-nav-icon-bubble {
          background: transparent;
          color: #64748b;
          filter: drop-shadow(0 2px 8px rgba(14,165,233,0.08));
          border-radius: 9999px;
          transform: translateY(0);
          box-shadow: none;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .lux-nav-inbar:hover .lux-nav-icon-bubble,
        .lux-nav-inbar:focus .lux-nav-icon-bubble {
          color: #0ea5e9;
          filter: drop-shadow(0 4px 16px rgba(14,165,233,0.18));
        }
        .lux-nav-popout {
          z-index: 2;
        }
        .lux-nav-popout .lux-nav-icon-bubble {
          background: linear-gradient(120deg, rgba(232,245,255,0.95) 60%, rgba(220,255,245,0.95) 100%);
          color: #0ea5e9;
          border-radius: 9999px;
          box-shadow: 0 4px 24px 0 #0ea5e955, 0 1.5px 0 #fff;
          transform: translateY(-28%) scale(1.18);
          border: 2.5px solid #0ea5e9;
          filter: drop-shadow(0 8px 24px #0ea5e955);
          animation: luxPopoutUp 0.5s cubic-bezier(0.4,0,0.2,1);
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes luxPopoutUp {
          from { transform: translateY(0) scale(1); box-shadow: 0 2px 8px 0 #0ea5e955; }
          to { transform: translateY(-28%) scale(1.18); box-shadow: 0 4px 24px 0 #0ea5e955, 0 1.5px 0 #fff; }
        }
        .lux-nav-popout .lux-nav-label {
          color: #0ea5e9 !important;
        }
        .lux-nav-inbar .lux-nav-label {
          color: #64748b;
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;