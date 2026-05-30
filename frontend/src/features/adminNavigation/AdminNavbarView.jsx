import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, ExternalLink, LogOut, Menu, User, X } from 'lucide-react';

import NotificationPopover from '../../components/ui/NotificationPopover';
import { ADMIN_LINKS } from './adminNavbarConfig';
import { useAdminNavbarState } from './useAdminNavbarState';

const AdminNavbarView = () => {
  const {
    location,
    user,
    unreadCount,
    isDropdownOpen,
    setIsDropdownOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    dropdownRef,
    notificationRef,
    onLogout,
  } = useAdminNavbarState();

  return (
    <nav className="admin-navbar sticky top-0 z-50">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/dashboard/admin" className="inline-flex min-w-0 items-center gap-3"><img src="/AuctionPulse.png" alt="AuctionPulse" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20" /></Link>
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="admin-link-cluster flex items-center gap-1.5 rounded-2xl p-1.5">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return <Link key={item.to} to={item.to} className={`admin-nav-link inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'is-active' : ''}`} aria-label={item.label} title={item.label}><Icon size={16} />{item.label === 'Overview' ? null : item.label}</Link>;
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block" ref={notificationRef}>
            <button onClick={() => setIsNotificationOpen((prev) => !prev)} className="admin-icon-button relative inline-flex h-11 w-11 items-center justify-center rounded-xl" type="button" aria-label="Open notifications">
              <Bell size={17} />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {isNotificationOpen && <NotificationPopover onClose={() => setIsNotificationOpen(false)} variant="admin" />}
          </div>
          <Link to="/" className="admin-site-link hidden items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold lg:inline-flex"><ExternalLink size={15} /> Live Site</Link>
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen((prev) => !prev)} className="admin-profile-chip inline-flex items-center gap-2 rounded-2xl px-1.5 py-1.5 pr-3" type="button">
              <div className="admin-avatar flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
              <div className="text-left leading-tight">
                <p className="max-w-[110px] truncate text-sm font-semibold text-slate-100">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Super User</p>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && <div className="admin-dropdown absolute right-0 mt-2 w-52 rounded-2xl py-2 shadow-2xl"><Link to="/admin/profile" onClick={() => setIsDropdownOpen(false)} className="admin-dropdown-link flex items-center gap-2 px-4 py-2 text-sm"><User size={15} /> My Profile</Link><button onClick={onLogout} className="admin-dropdown-danger flex w-full items-center gap-2 px-4 py-2 text-left text-sm" type="button"><LogOut size={15} /> Logout</button></div>}
          </div>
          <button onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="admin-mobile-toggle inline-flex rounded-xl p-2.5 lg:hidden" type="button" aria-label="Toggle admin navigation">{isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>

      {isMobileMenuOpen && <div className="admin-mobile-drawer px-4 pb-4 pt-3 lg:hidden"><div className="grid gap-2">{ADMIN_LINKS.map((item) => { const Icon = item.icon; const isActive = location.pathname === item.to; return <Link key={item.to} to={item.to} className={`admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'is-active' : ''}`}><Icon size={16} /> {item.label}</Link>; })}<Link to="/notifications" className="admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"><Bell size={16} /> Notifications{unreadCount > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</Link><Link to="/admin/profile" className="admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"><User size={16} /> My Profile</Link><Link to="/" className="admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"><ExternalLink size={16} /> Live Site</Link><button onClick={onLogout} className="rounded-lg border border-red-400/25 bg-red-500/8 px-3 py-2 text-left text-sm font-semibold text-red-200 hover:bg-red-500/20" type="button">Logout</button></div></div>}
    </nav>
  );
};

export default AdminNavbarView;
