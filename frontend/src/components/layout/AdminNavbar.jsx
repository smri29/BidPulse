import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Package, 
  LogOut, 
  User, 
  ChevronDown 
} from 'lucide-react';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
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
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. Admin Logo (Links to Dashboard) */}
          <Link to="/dashboard/admin" className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-500 transition">
               <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Admin<span className="text-red-500">Panel</span>
            </span>
          </Link>

          {/* 2. Admin Controls */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard/admin" className="hover:text-white flex items-center gap-2 text-sm font-medium transition">
              <LayoutDashboard size={18} /> Overview
            </Link>

            <Link to="/admin/users" className="hover:text-white flex items-center gap-2 text-sm font-medium transition">
              <Users size={18} /> Users
            </Link>

            <Link to="/" className="hover:text-white flex items-center gap-2 text-sm font-medium transition">
               <Package size={18} /> Live Site
            </Link>

            <div className="h-6 w-px bg-slate-700 mx-2"></div>

            {/* 3. Profile & User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-red-400 font-semibold">SUPER USER</p>
                </div>
                <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-red-500">
                   {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 py-1 border border-slate-700 z-50">
                   <Link 
                     to="/profile" 
                     className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
                     onClick={() => setIsDropdownOpen(false)}
                   >
                     <User size={16} /> My Profile
                   </Link>
                   <button 
                     onClick={onLogout}
                     className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition"
                   >
                     <LogOut size={16} /> Logout
                   </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;