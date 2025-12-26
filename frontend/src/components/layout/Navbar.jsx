import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';
import { Gavel, LogOut, User, PlusCircle, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  // Determine Dashboard URL based on Role
  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'seller') return '/dashboard/seller';
    return '/dashboard/bidder';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-bid-purple hover:text-indigo-700 transition">
              <div className="bg-bid-purple p-1.5 rounded-lg">
                 <Gavel size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">BidPulse</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-bid-purple font-medium text-sm hidden md:block">
              Auctions
            </Link>
            
            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center gap-1 text-gray-600 hover:text-bid-purple font-medium text-sm"
                >
                  <LayoutDashboard size={18} /> 
                  <span className="hidden sm:block">Dashboard</span>
                </Link>

                {user.role === 'seller' && (
                  <Link 
                    to="/create-auction" 
                    className="flex items-center gap-1 bg-bid-purple text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
                  >
                    <PlusCircle size={18} /> Post Auction
                  </Link>
                )}

                <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 hidden md:block">
                    {user.name}
                  </span>
                  <button 
                    onClick={onLogout} 
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-bid-purple font-medium text-sm">
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition"
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