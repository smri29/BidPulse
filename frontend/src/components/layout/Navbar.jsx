import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../redux/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get real user state from Redux Store
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-bid-purple p-2 rounded-lg">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              BidPulse
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-bid-purple font-medium transition">
              Auctions
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-bid-purple font-medium transition">
              About
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={`/dashboard/${user.role}`} 
                  className="text-gray-900 font-semibold hover:text-bid-purple capitalize"
                >
                  Dashboard
                </Link>
                
                <div className="flex items-center gap-2">
                    {/* Optional: Show user name */}
                    <span className="text-sm text-gray-500 hidden lg:block">
                        Hello, {user.name}
                    </span>
                    
                    <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                    <LogOut className="h-4 w-4" />
                    Logout
                    </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 font-medium hover:text-bid-purple"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-bid-purple text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-600 transition shadow-lg shadow-indigo-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon (Placeholder) */}
          <div className="md:hidden">
             <User className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;