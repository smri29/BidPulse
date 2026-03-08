import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/auctions', label: 'Auctions', icon: Package },
  { to: '/admin/support', label: 'Support', icon: MessageCircle },
];

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="admin-navbar sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard/admin" className="inline-flex items-center gap-2.5">
          <img src="/BidPulse.svg" alt="BidPulse" className="h-8 w-auto" />
          <span className="admin-badge inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
            <Shield size={11} /> Admin
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}

          <Link to="/notifications" className="admin-nav-link relative rounded-lg px-3 py-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <Bell size={16} /> Notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link to="/" className="admin-live-link px-3 py-2 text-sm">
            Live Site
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="admin-profile-chip inline-flex items-center gap-2 rounded-full px-1.5 py-1 pr-2"
              type="button"
            >
              <div className="admin-avatar flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-left leading-tight">
                <p className="max-w-[92px] truncate text-sm font-semibold text-slate-100">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300">Super User</p>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="admin-dropdown absolute right-0 mt-2 w-52 rounded-2xl py-2 shadow-2xl">
                <Link to="/admin/profile" onClick={() => setIsDropdownOpen(false)} className="admin-dropdown-link flex items-center gap-2 px-4 py-2 text-sm">
                  <User size={15} /> My Profile
                </Link>
                <button onClick={onLogout} className="admin-dropdown-danger flex w-full items-center gap-2 px-4 py-2 text-left text-sm" type="button">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="admin-mobile-toggle inline-flex rounded-lg p-2 lg:hidden"
            type="button"
            aria-label="Toggle admin navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="admin-mobile-drawer px-4 pb-4 pt-3 lg:hidden">
          <div className="grid gap-2">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}

            <Link to="/notifications" className="admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
              <Bell size={16} /> Notifications
              {unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>
            <Link to="/admin/profile" className="admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
              <User size={16} /> My Profile
            </Link>
            <Link to="/" className="admin-nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
              <Package size={16} /> Live Site
            </Link>
            <button onClick={onLogout} className="rounded-lg border border-red-400/25 bg-red-500/8 px-3 py-2 text-left text-sm font-semibold text-red-200 hover:bg-red-500/20" type="button">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
