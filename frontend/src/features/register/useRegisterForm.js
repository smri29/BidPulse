import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { register, reset } from '../../redux/authSlice';
import { getPasswordChecks } from './passwordRules';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasTypedPassword, setHasTypedPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
    if (isError && message) {
      toast.error(message, { toastId: `register-error-${message}` });
      setTurnstileToken('');
      turnstileRef.current?.reset?.();
    }

    if (isSuccess) {
      toast.success('Registration successful. Please sign in to continue.', { toastId: 'register-success' });
      navigate('/login');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const onChange = (event) => {
    const { name: fieldName, value } = event.target;
    if (fieldName === 'password' && !hasTypedPassword) {
      setHasTypedPassword(true);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please satisfy all password requirements.');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }
    if (!turnstileToken) {
      toast.error('Please complete the Cloudflare verification challenge.');
      return;
    }

    dispatch(register({ name, email, password, turnstileToken }));
  };

  return {
    formData,
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    hasTypedPassword,
    turnstileRef,
    turnstileSiteKey,
    isLoading,
    passwordChecks,
    isPasswordValid,
    passwordsMatch,
    setTurnstileToken,
    onChange,
    onSubmit,
  };
};
