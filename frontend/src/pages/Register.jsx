import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../redux/authSlice';
import { addNotification } from '../redux/notificationSlice';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Fingerprint,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';
import TurnstileWidget from '../components/ui/TurnstileWidget';

const getPasswordChecks = (value) => ({
  minLength: value.length >= 8,
  hasNumber: /\d/.test(value),
  hasSpecial: /[^A-Za-z0-9]/.test(value),
  noEdgeWhitespace: value.length > 0 && value === value.trim(),
});

const FeaturePill = ({ icon: Icon, title, text }) => (
  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sky-100">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-1 text-sm leading-6 text-slate-100/90">{text}</p>
  </div>
);

const InputRow = ({
  label,
  icon: Icon,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  rightControl,
  inputClassName = '',
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="relative flex-1">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-14 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${inputClassName}`}
        />
        {rightControl}
      </div>
    </div>
  </label>
);

const Register = () => {
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

  const { name, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message, { toastId: `register-error-${message}` });
      dispatch(addNotification({ title: 'Registration Failed', message, type: 'warning' }));
      setTurnstileToken('');
      turnstileRef.current?.reset?.();
    }

    if (isSuccess || user) {
      const successMessage = 'Registration successful. Please verify your email with OTP.';
      toast.success(successMessage, { toastId: 'register-success' });
      dispatch(addNotification({ title: 'Registration Successful', message: successMessage, type: 'success' }));
      navigate('/profile');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const onChange = (e) => {
    const { name: fieldName, value } = e.target;
    if (fieldName === 'password' && !hasTypedPassword) {
      setHasTypedPassword(true);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

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

  const passwordRows = [
    { key: 'minLength', label: '8 characters minimum' },
    { key: 'hasNumber', label: '1 number minimum' },
    { key: 'hasSpecial', label: '1 special character like $, !, @, %, &' },
    { key: 'noEdgeWhitespace', label: 'No leading or trailing whitespace' },
  ];

  const passwordButton = (visible, onClick, label) => (
    <div className="absolute inset-y-0 right-0 flex w-14 items-center justify-center">
      <button type="button" onClick={onClick} aria-label={label} className="text-slate-400 hover:text-slate-700">
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef4fb] px-4 py-8 md:px-6 md:py-10">
      <Reveal className="mx-auto w-full max-w-5xl">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.78fr_1fr] lg:gap-7">
          <section
            className="relative overflow-hidden rounded-[2rem] border border-slate-950/20 p-8 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.9)] md:p-9 lg:min-h-[520px] lg:p-10"
            style={{
              background: 'linear-gradient(160deg, #111827 0%, #0f172a 52%, #164e63 100%)',
            }}
          >
            <div
              className="absolute inset-0 opacity-100"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 16% 18%, rgba(59,130,246,0.18), transparent 22%), radial-gradient(circle at 82% 24%, rgba(34,211,238,0.12), transparent 18%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: 'auto, auto, 38px 38px, 38px 38px',
              }}
            />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="max-w-xl">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-sky-50">
                  <Sparkles className="h-4 w-4" /> MODERN ACCOUNT ACCESS
                </div>
                <h1 className="max-w-sm text-4xl font-bold leading-[1.04] text-white md:text-[2.55rem] xl:text-[2.9rem]">
                  Join BidPulse with a faster, cleaner signup flow.
                </h1>
                <p className="mt-5 max-w-md text-lg leading-8 text-slate-100">
                  Create your account with the essentials now. Profile verification details can be completed later, without slowing down onboarding.
                </p>

                <div className="mt-7 grid gap-4">
                  <FeaturePill
                    icon={ShieldCheck}
                    title="Security-first onboarding"
                    text="Email verification and human checks keep access trusted from the first step."
                  />
                  <FeaturePill
                    icon={Fingerprint}
                    title="Reduced signup friction"
                    text="Only the fields needed to create the account are shown here."
                  />
                </div>
              </div>

              <div className="mt-7 rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">After Signup</p>
                    <p className="mt-2 max-w-md text-sm leading-7 text-slate-100">
                      Additional identity information will live in the profile section so users can get started immediately.
                    </p>
                  </div>
                  <BadgeCheck className="hidden h-10 w-10 shrink-0 text-sky-200 md:block" />
                </div>
                <p className="mt-4 text-sm text-slate-100">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-white hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-[40rem]">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-cyan-300/6 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_80px_-34px_rgba(15,23,42,0.35)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.05),_transparent_28%),radial-gradient(circle_at_left_bottom,_rgba(6,182,212,0.04),_transparent_24%)]" />

              <div className="relative z-10 p-7 md:p-8 lg:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-slate-600">
                      STEP 1 OF 2
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900">Create account</h2>
                    <p className="mt-3 max-w-md text-base leading-7 text-slate-600">
                      Set up access now. Verification and profile completion come after registration.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                </div>

                <form className="space-y-5" onSubmit={onSubmit}>
                  <InputRow
                    label="Name"
                    icon={User}
                    name="name"
                    type="text"
                    value={name}
                    onChange={onChange}
                    placeholder="Full name"
                    autoComplete="name"
                  />

                  <InputRow
                    label="Email"
                    icon={Mail}
                    name="email"
                    type="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Email address"
                    autoComplete="email"
                  />

                  <InputRow
                    label="Password"
                    icon={Lock}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={onChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    inputClassName="bg-slate-50"
                    rightControl={passwordButton(showPassword, () => setShowPassword((prev) => !prev), showPassword ? 'Hide password' : 'Show password')}
                  />

                  {hasTypedPassword && (
                    <div className="rounded-[1.6rem] border border-emerald-100 bg-[linear-gradient(180deg,_#f7fcf8_0%,_#effaf3_100%)] p-4 shadow-sm">
                      <p className={`mb-3 text-sm font-semibold ${isPasswordValid ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {isPasswordValid ? 'Password requirements met' : 'Password requirements'}
                      </p>
                      <div className="space-y-2">
                        {passwordRows.map((requirement) => {
                          const passed = passwordChecks[requirement.key];
                          return (
                            <div
                              key={requirement.key}
                              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                                passed ? 'bg-emerald-100 text-emerald-800' : 'border border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              {passed ? (
                                <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                              ) : (
                                <CircleAlert className="h-4 w-4 shrink-0 text-slate-400" />
                              )}
                              <span>{requirement.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <InputRow
                    label="Confirm Password"
                    icon={Lock}
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={onChange}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    inputClassName={
                      confirmPassword.length === 0
                        ? ''
                        : passwordsMatch
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-rose-300 bg-rose-50'
                    }
                    rightControl={passwordButton(
                      showConfirmPassword,
                      () => setShowConfirmPassword((prev) => !prev),
                      showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                    )}
                  />

                  {confirmPassword.length > 0 && (
                    <p className={`text-sm font-semibold ${passwordsMatch ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}

                  <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50/90 p-4">
                    <p className="text-sm font-semibold text-slate-800">Cloudflare Verification</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Complete the challenge before creating your account.
                    </p>
                    <TurnstileWidget
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      className="mt-4"
                      onVerify={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken('')}
                      onError={() => setTurnstileToken('')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-premium w-full rounded-2xl py-4 text-base disabled:opacity-70"
                  >
                    {isLoading ? 'Creating Account...' : <>Create Account <ArrowRight size={18} /></>}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500 lg:hidden">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-bid-purple hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Reveal>
    </div>
  );
};

export default Register;
