import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import { Shield, LayoutDashboard, Users, Package, LogOut } from 'lucide-react';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Admin Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
               <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Admin<span className="text-red-500">Panel</span>
            </span>
          </div>

          {/* Admin Controls */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard/admin" className="text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition">
              <LayoutDashboard size={18} /> Overview
            </Link>

            <Link to="/admin/users" className="text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition">
              <Users size={18} /> Users
            </Link>

            {/* We will reuse the main auction list for now, but admins can delete from there */}
            <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition">
               <Package size={18} /> Live Auctions
            </Link>

            <div className="h-6 w-px bg-slate-700 mx-2"></div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-red-500">
                SUPER USER
              </span>
              <button 
                onClick={onLogout} 
                className="text-slate-400 hover:text-red-400 transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;