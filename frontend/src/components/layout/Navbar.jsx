import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Bell, 
  Settings, 
  RefreshCw, 
  ChevronDown 
} from 'lucide-react';

const SELLER_MODE_PATHS = ['/dashboard/seller', '/create-auction', '/edit-auction'];
const BIDDER_MODE_PATHS = ['/dashboard/bidder', '/auction'];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To detect current page
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((item) => !item.read).length;
  
  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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
    navigate('/');
  };

  const getModeFromPath = (path) => {
    if (SELLER_MODE_PATHS.some((sellerPath) => path.startsWith(sellerPath))) return 'seller';
    if (BIDDER_MODE_PATHS.some((bidderPath) => path.startsWith(bidderPath))) return 'bidder';
    return null;
  };

  const modeFromPath = getModeFromPath(location.pathname);
  const preferredMode = localStorage.getItem('RiZBiD_dashboard_mode') || 'bidder';
  const activeMode = modeFromPath || preferredMode;
  const isSellerMode = activeMode === 'seller';
  const dashboardPath = isSellerMode ? '/dashboard/seller' : '/dashboard/bidder';

  useEffect(() => {
    if (modeFromPath) {
      localStorage.setItem('RiZBiD_dashboard_mode', modeFromPath);
    }
  }, [modeFromPath]);

  const handleSwitchMode = () => {
    const nextMode = isSellerMode ? 'bidder' : 'seller';
    localStorage.setItem('RiZBiD_dashboard_mode', nextMode);
    navigate(nextMode === 'seller' ? '/dashboard/seller' : '/dashboard/bidder');
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50 animate-fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* 1. Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-bid-purple hover:text-indigo-700 transition">
              <img src="/RiZBiD.svg" alt="RiZBiD" className="h-10 w-auto" />
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-cyan-600 to-emerald-600 bg-[length:200%_100%] bg-clip-text text-transparent animate-brand-shimmer">
                RiZBiD
              </span>
            </Link>
          </div>

          {/* 2. Navigation Items */}
          <div className="flex items-center gap-2 md:gap-6">
            
            {/* Global Links */}
            <Link to="/" className="text-gray-600 hover:text-bid-purple font-medium text-sm hidden md:block transition">
              Auctions
            </Link>

            {user ? (
              <>
                {!user.emailVerified && user.role !== 'admin' && (
                  <Link
                    to="/profile"
                    className="hidden lg:inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full animate-pulse-glow"
                  >
                    Verify Email
                  </Link>
                )}

                {/* --- A. SWITCHING SYSTEM (The "Fiverr" Toggle) --- */}
                <button 
                  onClick={handleSwitchMode}
                  className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-bid-purple transition px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw size={16} className={isSellerMode ? "text-green-600" : "text-blue-600"} />
                  {isSellerMode ? "Switch to Buying" : "Switch to Selling"}
                </button>

                {/* --- B. NOTIFICATIONS --- */}
                <Link 
                  to="/notifications" 
                  className="relative p-2 text-gray-400 hover:text-bid-purple transition rounded-full hover:bg-gray-50"
                >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                </Link>

                {/* Separator */}
                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* --- C. USER PROFILE DROPDOWN --- */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                  >
                    {/* Avatar Circle */}
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-indigo-200" />
                    ) : (
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Name & Chevron */}
                    <div className="hidden md:flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{user.name}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* --- DROPDOWN MENU --- */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-2 transform origin-top-right transition-all z-50">
                      
                      {/* Menu Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      </div>

                      {/* Main Links */}
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-bid-purple transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User size={16} /> My Profile
                        </Link>
                        
                        <Link 
                          to={dashboardPath} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-bid-purple transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>

                        {/* Mobile-only Switch */}
                        <button 
                          onClick={handleSwitchMode}
                          className="w-full text-left flex md:hidden items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-bid-purple transition"
                        >
                           <RefreshCw size={16} /> {isSellerMode ? "Switch to Buying" : "Switch to Selling"}
                        </button>
                      </div>

                      {/* Settings Section */}
                      <div className="border-t border-gray-100 py-1">
                        <Link 
                          to="/settings" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-bid-purple transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} /> Settings
                        </Link>
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-100 py-1">
                        <button 
                          onClick={onLogout} 
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest View */
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-bid-purple font-medium text-sm">
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

