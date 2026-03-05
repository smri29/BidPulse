import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../redux/authSlice';
import { addNotification } from '../redux/notificationSlice';
import { User, Mail, Phone, Lock, FileText, Calendar, CheckSquare, RefreshCw, ShieldCheck, MapPin } from 'lucide-react';
import { COUNTRIES } from '../constants/countries';

const Register = () => {
  const [captcha, setCaptcha] = useState({
    num1: Math.floor(Math.random() * 10) + 1,
    num2: Math.floor(Math.random() * 10) + 1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dob: '',
    location: '',
    idType: 'nid',
    idNumber: '',
    captchaInput: '',
    agreeTerms: false,
  });

  const { name, email, mobile, password, confirmPassword, dob, location, idType, idNumber, captchaInput, agreeTerms } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message, { toastId: `register-error-${message}` });
      dispatch(addNotification({ title: 'Registration Failed', message, type: 'warning' }));
    }

    if (isSuccess || user) {
      const successMessage = 'Registration successful. Please verify your email with OTP.';
      toast.success(successMessage, { toastId: 'register-success' });
      dispatch(addNotification({ title: 'Registration Successful', message: successMessage, type: 'success' }));
      navigate('/profile');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const regenerateCaptcha = () => {
    setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1 });
    setFormData((prev) => ({ ...prev, captchaInput: '' }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordScore < 2) {
      toast.error('Use a stronger password (8+ chars with numbers/symbols).');
      return;
    }

    if (parseInt(captchaInput, 10) !== captcha.num1 + captcha.num2) {
      toast.error('Incorrect captcha answer');
      regenerateCaptcha();
      return;
    }

    if (!agreeTerms) {
      toast.error('You must agree to the Terms of Service');
      return;
    }

    dispatch(register({ name, email, mobile, password, dob, location, idType, idNumber }));
  };

  const strengthLabel = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Excellent'][passwordScore];
  const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][passwordScore];

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="max-w-5xl w-full rounded-3xl overflow-hidden border border-white/60 shadow-xl glass-surface animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex bg-gradient-to-br from-blue-800 via-indigo-700 to-emerald-600 p-10 text-white flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wider mb-6">VERIFIED ONBOARDING</div>
              <h1 className="text-4xl font-bold">Create your RiZBiD account</h1>
              <p className="text-white/80 mt-4 text-sm">Email OTP verification keeps bidding and listing secure.</p>
            </div>
            <p className="text-sm text-white/80">Already have an account? <Link to="/login" className="font-bold text-white hover:underline">Sign in</Link></p>
          </div>

          <div className="bg-white p-7 md:p-9">
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 bg-bid-purple/10 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-bid-purple" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Sign Up</h2>
              <p className="text-sm text-gray-600 mt-1">Complete your profile and verify email to start bidding.</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="relative">
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input type="text" name="name" value={name} onChange={onChange} required className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" placeholder="Full Name" />
              </div>

              <div className="relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input type="email" name="email" value={email} onChange={onChange} required className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" placeholder="Email Address" />
              </div>

              <div className="relative">
                <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input type="tel" name="mobile" value={mobile} onChange={onChange} required className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" placeholder="Mobile Number" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <input type="date" name="dob" value={dob} onChange={onChange} required className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Country</label>
                  <div className="relative">
                    <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <select
                      name="location"
                      value={location}
                      onChange={onChange}
                      required
                      className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 bg-white"
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <select name="idType" value={idType} onChange={onChange} className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 bg-white">
                    <option value="nid">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="birth_cert">Birth Certificate</option>
                  </select>
                </div>
                <div className="relative">
                  <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input type="text" name="idNumber" value={idNumber} onChange={onChange} required minLength={6} className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" placeholder="Document Number" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input type="password" name="password" value={password} onChange={onChange} required className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" placeholder="Password" />
                </div>
                <div className="relative">
                  <CheckSquare className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5" placeholder="Confirm Password" />
                </div>
              </div>

              <div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${(passwordScore / 4) * 100}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password Strength: {strengthLabel}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Human Verification</label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-white px-3 py-2 rounded-lg border border-gray-300 font-bold text-gray-700">{captcha.num1} + {captcha.num2} = ?</div>
                  <button type="button" onClick={regenerateCaptcha} className="text-gray-400 hover:text-bid-purple p-1"><RefreshCw size={18} /></button>
                  <input type="number" name="captchaInput" value={captchaInput} onChange={onChange} required className="w-24 rounded-lg border border-gray-300 px-2 py-1.5" placeholder="Answer" />
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={agreeTerms} onChange={onChange} className="mt-1 h-4 w-4" />
                <span>I agree to the <Link to="/terms" className="text-bid-purple hover:underline">Terms</Link> and <Link to="/privacy" className="text-bid-purple hover:underline">Privacy Policy</Link>.</span>
              </label>

              <button type="submit" disabled={isLoading} className="w-full bg-bid-purple hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold transition disabled:opacity-70">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

