/**
 * Module: pages/ProfileVerificationLink.jsx
 * Purpose: Supports the Profile Verification Link module and keeps its responsibility isolated by file name.
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { fetchCurrentUser } from '../redux/authSlice';

// This page finishes the email-link variant of profile verification.
const ProfileVerificationLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      try {
        const response = await axios.get(`/auth/profile-verification/verify-link/${token}`);
        if (!isMounted) return;

        toast.success(response.data?.message || 'Profile verified successfully');

        if (user?.token) {
          await dispatch(fetchCurrentUser());
          navigate('/profile', { replace: true });
          return;
        }

        navigate('/login', { replace: true });
      } catch (error) {
        if (!isMounted) return;
        toast.error(error.response?.data?.message || 'Unable to verify your profile');
        navigate(user?.token ? '/profile' : '/login', { replace: true });
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate, token, user?.token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div>
        <p className="text-lg font-semibold text-slate-900">Verifying your profile...</p>
        <p className="mt-2 text-sm text-slate-500">Please wait while we confirm your verification link.</p>
      </div>
    </div>
  );
};

export default ProfileVerificationLink;
