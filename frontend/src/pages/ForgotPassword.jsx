import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';;
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct call to backend API
      const response = await axios.post('/auth/forgotpassword', { email });
      
      toast.success(response.data.message || 'Email sent! Check your inbox.');
      setEmail(''); // Clear field on success
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to send email. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-bid-purple/10 rounded-full flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-bid-purple" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-bid-purple focus:border-bid-purple sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bid-purple hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bid-purple transition-colors disabled:opacity-70"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center mt-4">
             <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-bid-purple transition">
               <ArrowLeft size={16} /> Back to Login
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;