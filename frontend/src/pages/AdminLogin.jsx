import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../redux/authSlice';
import { toast } from 'react-toastify';
import { Shield, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess || user) {
      if (user?.role === 'admin') {
        // Success: Redirect to Admin Dashboard
        navigate('/dashboard/admin');
      } else {
        // Fail: Logic for non-admins trying to access admin panel
        toast.error("Access Denied: You are not an Admin.");
        dispatch(reset()); 
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
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4 border border-red-800">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-400">Restricted Access Only</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin Email"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-red-300 group-hover:text-red-200" />
            </span>
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;