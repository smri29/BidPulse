import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const MobileNavMenu = ({
  isMobileMenuOpen,
  links,
  currentPath,
  user,
  dashboardPath,
  isSellerMode,
  handleSwitchMode,
  onLogout,
}) => {
  if (!isMobileMenuOpen) return null;

  return (
    <div className="border-t border-slate-200 bg-white/96 px-4 pb-4 pt-3 backdrop-blur-xl lg:hidden">
      <div className="grid gap-2">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className={`rounded-lg px-3 py-2 text-sm font-semibold ${currentPath === item.to ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
            {item.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link to={dashboardPath} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Dashboard</Link>
            <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">My Profile</Link>
            <Link to="/settings" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Settings</Link>
            <button onClick={handleSwitchMode} className="btn-soft px-3 py-2 text-sm" type="button">
              <RefreshCw size={15} className={isSellerMode ? 'text-emerald-600' : 'text-blue-600'} />
              {isSellerMode ? 'Switch to Buying' : 'Switch to Selling'}
            </button>
            <button onClick={onLogout} className="rounded-lg border border-red-100 px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50" type="button">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Log In</Link>
            <Link to="/register" className="btn-premium px-3 py-2 text-sm">Get Started</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavMenu;
