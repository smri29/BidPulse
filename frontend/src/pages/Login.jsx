import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../redux/authSlice';
import { Mail, Lock, LogIn, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) toast.error(message);

    if (user || isSuccess) {
      if (user?.role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/bidder');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/60 shadow-xl glass-surface animate-fade-up">
        <div className="hidden lg:flex bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 text-white p-10 flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider bg-white/10 rounded-full px-3 py-1 mb-6">SECURE ACCESS</div>
            <h1 className="text-4xl font-bold leading-tight">Welcome back to BidPulse</h1>
            <p className="text-white/80 mt-4 text-sm">Live bidding intelligence, escrow confidence, and high-integrity auction flow.</p>
          </div>
          <div className="text-sm text-white/80">Need an account? <Link to="/register" className="font-bold text-white hover:underline">Create one now</Link></div>
        </div>

        <div className="bg-white p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-bid-purple rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-1 text-sm text-gray-600">Access your bidder, seller, or admin workflow</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input type="email" name="email" value={email} onChange={onChange} required placeholder="Email Address" className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-bid-purple focus:outline-none" />
            </div>
            <div className="relative">
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input type="password" name="password" value={password} onChange={onChange} required placeholder="Password" className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-bid-purple focus:outline-none" />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-bid-purple hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-bid-purple hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold inline-flex items-center justify-center gap-2 transition disabled:opacity-70">
              {isLoading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="text-center text-sm mt-6">
            <span className="text-gray-500">New here? </span>
            <Link to="/register" className="font-semibold text-bid-purple hover:underline">Create account</Link>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 text-center">
            <Link to="/admin-login" className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1">
              <Shield size={12} /> Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
