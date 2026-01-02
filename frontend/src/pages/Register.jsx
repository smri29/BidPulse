import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../redux/authSlice';
import { User, Mail, Lock, FileText, Calendar, CheckSquare, RefreshCw } from 'lucide-react';

const Register = () => {
  // 1. Generate random math problem for CAPTCHA
  const [captcha, setCaptcha] = useState({
    num1: Math.floor(Math.random() * 10) + 1,
    num2: Math.floor(Math.random() * 10) + 1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    idType: 'nid', // Default to NID
    idNumber: '',
    captchaInput: '',
    agreeTerms: false,
  });

  const { name, email, password, confirmPassword, dob, idType, idNumber, captchaInput, agreeTerms } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      toast.success('Registration Successful! Please check your email.');
      navigate('/'); 
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: value,
    }));
  };

  const regenerateCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
    });
    setFormData((prev) => ({ ...prev, captchaInput: '' }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // --- VALIDATIONS ---
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (parseInt(captchaInput) !== captcha.num1 + captcha.num2) {
      toast.error('Incorrect Captcha Answer. Are you human?');
      regenerateCaptcha();
      return;
    }

    if (!agreeTerms) {
      toast.error('You must agree to the Terms of Service');
      return;
    }

    // Prepare data (removed Role selection, default is 'user')
    const userData = { 
      name, 
      email, 
      password,
      // Pass extra fields to backend (Make sure to update User Model in backend to accept these if needed!)
      dob,
      idType,
      idNumber 
    };

    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-bid-purple/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-bid-purple" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the premium marketplace for secure auctions.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          
          <div className="space-y-4">
            {/* --- Full Name --- */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
                className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                placeholder="Full Name (as per ID)"
              />
            </div>

            {/* --- Email --- */}
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
                className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                placeholder="Email Address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* --- Date of Birth --- */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={dob}
                  onChange={onChange}
                  required
                  className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                  placeholder="Date of Birth"
                />
              </div>

              {/* --- ID Type Selection --- */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="idType"
                  value={idType}
                  onChange={onChange}
                  className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                >
                  <option value="nid">National ID (NID)</option>
                  <option value="passport">Passport</option>
                  <option value="birth_cert">Birth Certificate</option>
                </select>
              </div>
            </div>

            {/* --- ID Number --- */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="idNumber"
                value={idNumber}
                onChange={onChange}
                required
                className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                placeholder={`Enter your ${idType === 'nid' ? 'NID' : idType === 'passport' ? 'Passport' : 'Birth Certificate'} Number`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* --- Password --- */}
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
                  className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                  placeholder="Password"
                />
              </div>

              {/* --- Confirm Password --- */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckSquare className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                  className="appearance-none rounded-lg block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bid-purple focus:border-transparent sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            {/* --- Human Verification (Math Captcha) --- */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
               <label className="block text-sm font-medium text-gray-700 mb-2">Human Verification</label>
               <div className="flex items-center gap-4">
                  <div className="bg-white px-4 py-2 rounded border border-gray-300 font-bold text-lg tracking-widest text-gray-700 select-none">
                      {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <button type="button" onClick={regenerateCaptcha} className="text-gray-400 hover:text-bid-purple" title="Refresh Captcha">
                      <RefreshCw size={20} />
                  </button>
                  <input
                    type="number"
                    name="captchaInput"
                    value={captchaInput}
                    onChange={onChange}
                    required
                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-bid-purple focus:border-transparent"
                    placeholder="Answer"
                  />
               </div>
            </div>

            {/* --- Terms Checkbox --- */}
            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={onChange}
                className="h-4 w-4 text-bid-purple focus:ring-bid-purple border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the <Link to="/terms" className="text-bid-purple hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-bid-purple hover:underline">Privacy Policy</Link>.
              </label>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-bid-purple hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bid-purple transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center text-sm">
             <span className="text-gray-500">Already have an account? </span>
             <Link to="/login" className="font-medium text-bid-purple hover:text-indigo-500">
               Sign in
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;