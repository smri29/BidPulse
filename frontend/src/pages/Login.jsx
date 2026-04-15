import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../redux/authSlice';
import { addNotification } from '../redux/notificationSlice';
import { Mail, Lock, LogIn, Shield, ArrowRight } from 'lucide-react';
import Reveal from '../components/ui/Reveal';
import TurnstileWidget from '../components/ui/TurnstileWidget';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const { email, password } = formData;
  const turnstileRef = useRef(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message, { toastId: `login-error-${message}` });
      dispatch(addNotification({ title: 'Login Failed', message, type: 'warning' }));
      setTurnstileToken('');
      turnstileRef.current?.reset?.();
    }

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

    if (!turnstileToken) {
      toast.error('Please complete the Cloudflare verification challenge.');
      return;
    }

    dispatch(login({ email, password, turnstileToken }));
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <Reveal className="w-full max-w-5xl">
        <div className="premium-panel grid overflow-hidden rounded-3xl border-white/60 lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-10 text-white lg:flex">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider">SECURE ACCESS</div>
              <h1 className="text-4xl font-bold leading-tight">Welcome back to BidPulse</h1>
              <p className="mt-4 text-sm text-white/80">Live bidding intelligence, verified listings, and high-integrity auction flow.</p>
            </div>
            <div className="text-sm text-white/80">Need an account? <Link to="/register" className="font-bold text-white hover:underline">Create one now</Link></div>
          </div>

          <div className="bg-white p-8 md:p-10">
            <div className="mb-8 text-center">
              <div className="animate-pulse-glow mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bid-purple">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
              <p className="mt-1 text-sm text-slate-600">Access your bidder, seller, or admin workflow</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="email" name="email" value={email} onChange={onChange} required placeholder="Email Address" className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="password" name="password" value={password} onChange={onChange} required placeholder="Password" className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5" />
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Cloudflare Verification</p>
                <TurnstileWidget
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  className="mt-4"
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => setTurnstileToken('')}
                />
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-bid-purple hover:underline">Forgot password?</Link>
              </div>

              <button type="submit" disabled={isLoading} className="btn-premium w-full py-2.5 text-sm disabled:opacity-70">
                {isLoading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500">New here? </span>
              <Link to="/register" className="font-semibold text-bid-purple hover:underline">Create account</Link>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
              <Link to="/admin-login" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                <Shield size={12} /> Admin Access
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default Login;
