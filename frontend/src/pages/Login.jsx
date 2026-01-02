import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../redux/authSlice';
import { Mail, Lock, LogIn, Shield } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    // Redirect logic matched to App.jsx routes
    if (user || isSuccess) {
        if (user?.role === 'admin') {
            navigate('/dashboard/admin'); 
        } else if (user?.role === 'seller') {
            navigate('/dashboard/seller');
        } else {
            navigate('/dashboard/bidder'); 
        }
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-bid-purple rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your auctions
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-bid-purple focus:border-bid-purple sm:text-sm"
                placeholder="Email Address"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-bid-purple focus:border-bid-purple sm:text-sm"
                placeholder="Password"
              />
            </div>

            {/* --- FORGOT PASSWORD LINK --- */}
            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-bid-purple hover:text-indigo-500 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            {/* --------------------------- */}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bid-purple hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bid-purple transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center text-sm">
             <span className="text-gray-500">Don't have an account? </span>
             <Link to="/register" className="font-medium text-bid-purple hover:text-indigo-500">
               Sign up
             </Link>
          </div>
          
          {/* --- ADMIN LINK --- */}
          <div className="pt-6 border-t border-gray-100 text-center">
             <Link 
               to="/admin-login" 
               className="text-xs text-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-1"
             >
               <Shield size={12} /> Admin Access
             </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;