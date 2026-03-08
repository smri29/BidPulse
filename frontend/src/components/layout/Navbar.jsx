import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  User,
  X,
} from 'lucide-react';

const SELLER_MODE_PATHS = ['/dashboard/seller', '/create-auction', '/edit-auction'];
const BIDDER_MODE_PATHS = ['/dashboard/bidder', '/auction'];
const MODE_KEY = 'BidPulse_dashboard_mode';
const LEGACY_MODE_KEY = 'RiZBiD_dashboard_mode';

const NAV_LINKS = [
  { to: '/', label: 'Auctions' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/safety', label: 'Safety' },
];

const readPreferredMode = () => {
  if (typeof window === 'undefined') return 'bidder';
  const stored = localStorage.getItem(MODE_KEY) || localStorage.getItem(LEGACY_MODE_KEY);
  return stored === 'seller' ? 'seller' : 'bidder';
};

const persistPreferredMode = (mode) => {
  localStorage.setItem(MODE_KEY, mode);
  localStorage.setItem(LEGACY_MODE_KEY, mode);
};

const getModeFromPath = (path) => {
  if (SELLER_MODE_PATHS.some((sellerPath) => path.startsWith(sellerPath))) return 'seller';
  if (BIDDER_MODE_PATHS.some((bidderPath) => path.startsWith(bidderPath))) return 'bidder';
  return null;
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const modeFromPath = getModeFromPath(location.pathname);
  const preferredMode = useMemo(() => readPreferredMode(), []);
  const activeMode = modeFromPath || preferredMode;
  const isSellerMode = activeMode === 'seller';
  const dashboardPath = isSellerMode ? '/dashboard/seller' : '/dashboard/bidder';

  useEffect(() => {
    if (modeFromPath) persistPreferredMode(modeFromPath);
  }, [modeFromPath]);

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
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleSwitchMode = () => {
    const nextMode = isSellerMode ? 'bidder' : 'seller';
    persistPreferredMode(nextMode);
    navigate(nextMode === 'seller' ? '/dashboard/seller' : '/dashboard/bidder');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/82 shadow-[0_18px_35px_-28px_rgba(9,24,56,0.95)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/BidPulse.svg" alt="BidPulse" className="h-10 w-auto" />
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent text-shimmer">
            BidPulse
          </span>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                location.pathname === item.to
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {!user.emailVerified && user.role !== 'admin' && (
                <Link
                  to="/profile"
                  className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 lg:inline-flex"
                >
                  Verify Email
                </Link>
              )}

              <button
                onClick={handleSwitchMode}
                className="btn-soft hidden px-3 py-2 text-sm md:inline-flex"
                type="button"
              >
                <RefreshCw size={15} className={isSellerMode ? 'text-emerald-600' : 'text-blue-600'} />
                {isSellerMode ? 'Switch to Buying' : 'Switch to Selling'}
              </button>

              <Link to="/notifications" className="relative rounded-full p-2 text-slate-500 hover:bg-white hover:text-bid-purple">
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-1.5 py-1 pr-2"
                  type="button"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
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
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to={dashboardPath} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Settings size={15} /> Settings
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" type="button">
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-bid-purple">
                Log In
              </Link>
              <Link to="/register" className="btn-premium px-4 py-2 text-sm">
                Get Started
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded-lg border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
            type="button"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white/96 px-4 pb-4 pt-3 backdrop-blur-xl lg:hidden">
          <div className="grid gap-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  location.pathname === item.to ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link to={dashboardPath} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Dashboard
                </Link>
                <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  My Profile
                </Link>
                <Link to="/settings" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Settings
                </Link>
                <button onClick={handleSwitchMode} className="btn-soft px-3 py-2 text-sm" type="button">
                  <RefreshCw size={15} className={isSellerMode ? 'text-emerald-600' : 'text-blue-600'} />
                  {isSellerMode ? 'Switch to Buying' : 'Switch to Selling'}
                </button>
                <button onClick={onLogout} className="rounded-lg border border-red-100 px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50" type="button">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Log In
                </Link>
                <Link to="/register" className="btn-premium px-3 py-2 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
