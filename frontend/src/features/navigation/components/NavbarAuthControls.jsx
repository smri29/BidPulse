/**
 * Module: features/navigation/components/NavbarAuthControls.jsx
 * Purpose: Presents the Navbar Auth Controls UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Bell, ChevronDown, LayoutDashboard, LogOut, RefreshCw, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import NotificationPopover from '../../../components/ui/NotificationPopover';

const NavbarAuthControls = ({
  user,
  unreadCount,
  isNotificationOpen,
  setIsNotificationOpen,
  notificationRef,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  isSellerMode,
  dashboardPath,
  onLogout,
  handleSwitchMode,
}) => {
  if (!user) {
    return (
      <div className="hidden items-center gap-3 md:flex">
        <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-bid-purple">Log In</Link>
        <Link to="/register" className="btn-premium px-4 py-2 text-sm">Get Started</Link>
      </div>
    );
  }

  return (
    <>
      {!user.emailVerified && user.role !== 'admin' && (
        <Link to="/profile" className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 lg:inline-flex">
          Verify Profile
        </Link>
      )}

      <button onClick={handleSwitchMode} className="btn-soft hidden px-3 py-2 text-sm md:inline-flex" type="button">
        <RefreshCw size={15} className={isSellerMode ? 'text-emerald-600' : 'text-blue-600'} />
        {isSellerMode ? 'Switch to Buying' : 'Switch to Selling'}
      </button>

      <div className="relative" ref={notificationRef}>
        <button onClick={() => setIsNotificationOpen((prev) => !prev)} className="relative rounded-full p-2 text-slate-500 hover:bg-white hover:text-bid-purple" type="button" aria-label="Open notifications">
          <Bell size={19} />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        {isNotificationOpen && <NotificationPopover onClose={() => setIsNotificationOpen(false)} />}
      </div>

      <div className="relative hidden md:block" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen((prev) => !prev)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-1.5 py-1 pr-2" type="button">
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{user.name.charAt(0).toUpperCase()}</div>}
          <span className="max-w-[90px] truncate text-sm font-semibold text-slate-700">{user.name}</span>
          <ChevronDown size={14} className={`text-slate-400 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="premium-panel absolute right-0 mt-2 w-64 rounded-2xl py-2">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
              <p className="truncate text-sm font-bold text-slate-800">{user.email}</p>
            </div>
            <div className="py-1">
              <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><User size={15} /> My Profile</Link>
              <Link to={dashboardPath} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><LayoutDashboard size={15} /> Dashboard</Link>
              <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><Settings size={15} /> Settings</Link>
            </div>
            <div className="border-t border-slate-100 pt-1">
              <button onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" type="button"><LogOut size={15} /> Sign out</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NavbarAuthControls;
