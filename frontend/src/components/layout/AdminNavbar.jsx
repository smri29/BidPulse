import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import NotificationPopover from '../ui/NotificationPopover';
import {
  NOTIFICATION_POPOVER_EVENT,
  readDismissedNotificationIds,
} from '../../utils/notificationPopover';
import {
  Bell,
  ChevronDown,
  ExternalLink,
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

// The admin navbar is tuned for moderation work rather than marketplace browsing.
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
  const { items: notifications, ownerKey } = useSelector((state) => state.notifications);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(() =>
    readDismissedNotificationIds(ownerKey)
  );
  const unreadCount = notifications.filter(
    (item) => !item.read && !dismissedNotificationIds.includes(item.id)
  ).length;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    // Route transitions should clear temporary UI state so the next admin page
    // does not inherit an old open drawer or dropdown.
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Notification preview dismissals are still scoped by owner in admin mode.
    setDismissedNotificationIds(readDismissedNotificationIds(ownerKey));

    const handleDismissedChange = (event) => {
      if (event.detail?.ownerKey === ownerKey) {
        setDismissedNotificationIds(event.detail.ids || []);
      }
    };

    window.addEventListener(NOTIFICATION_POPOVER_EVENT, handleDismissedChange);
    return () => window.removeEventListener(NOTIFICATION_POPOVER_EVENT, handleDismissedChange);
  }, [ownerKey]);

  useEffect(() => {
    // Shared click-away logic for the notification panel and profile menu.
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
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
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
    navigate('/');
  };

  return (
    <nav className="admin-navbar sticky top-0 z-50">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/dashboard/admin" className="inline-flex min-w-0 items-center gap-3">
          <img src="/AuctionPulse.png" alt="AuctionPulse" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20" />
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="admin-link-cluster flex items-center gap-1.5 rounded-2xl p-1.5">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              // "Overview" stays icon-only in desktop mode to keep the nav compact.
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`admin-nav-link inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'is-active' : ''}`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={16} />
                  {item.label === 'Overview' ? null : item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="admin-icon-button relative inline-flex h-11 w-11 items-center justify-center rounded-xl"
              type="button"
              aria-label="Open notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && <NotificationPopover onClose={() => setIsNotificationOpen(false)} variant="admin" />}
          </div>

          <Link to="/" className="admin-site-link hidden items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold lg:inline-flex">
            <ExternalLink size={15} /> Live Site
          </Link>

          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="admin-profile-chip inline-flex items-center gap-2 rounded-2xl px-1.5 py-1.5 pr-3"
              type="button"
            >
              <div className="admin-avatar flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-left leading-tight">
                <p className="max-w-[110px] truncate text-sm font-semibold text-slate-100">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Super User</p>
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
            className="admin-mobile-toggle inline-flex rounded-xl p-2.5 lg:hidden"
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
              <ExternalLink size={16} /> Live Site
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
