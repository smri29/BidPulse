import React from 'react';
import { ArrowRight, Check, CircleAlert, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import TurnstileWidget from '../../../components/ui/TurnstileWidget';
import { PASSWORD_REQUIREMENTS } from '../passwordRules';

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

const RegisterForm = ({
  name,
  email,
  password,
  confirmPassword,
  onChange,
  onSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  hasTypedPassword,
  passwordChecks,
  isPasswordValid,
  passwordsMatch,
  turnstileRef,
  turnstileSiteKey,
  setTurnstileToken,
}) => {
  const passwordButton = (visible, onClick, label) => (
    <div className="absolute inset-y-0 right-0 flex w-14 items-center justify-center">
      <button type="button" onClick={onClick} aria-label={label} className="text-slate-400 hover:text-slate-700">
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign up with the essentials now, then complete deeper profile details later from your account area.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <InputRow
          label="Full Name"
          icon={User}
          name="name"
          type="text"
          value={name}
          onChange={onChange}
          placeholder="Your full name"
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
              {PASSWORD_REQUIREMENTS.map((requirement) => {
                const passed = passwordChecks[requirement.key];
                return (
                  <div
                    key={requirement.key}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                      passed ? 'bg-emerald-100 text-emerald-800' : 'border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {passed ? <Check className="h-4 w-4 shrink-0 text-emerald-700" /> : <CircleAlert className="h-4 w-4 shrink-0 text-slate-400" />}
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
          rightControl={passwordButton(showConfirmPassword, () => setShowConfirmPassword((prev) => !prev), showConfirmPassword ? 'Hide confirm password' : 'Show confirm password')}
        />

        {confirmPassword.length > 0 && (
          <p className={`text-sm font-semibold ${passwordsMatch ? 'text-emerald-700' : 'text-rose-600'}`}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </p>
        )}

        <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50/90 p-4">
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

        <button type="submit" disabled={isLoading} className="btn-premium w-full rounded-2xl py-4 text-base disabled:opacity-70">
          {isLoading ? 'Creating Account...' : <>Create Account <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500 lg:hidden">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-bid-purple hover:underline">
          Sign in
        </Link>
      </div>
    </section>
  );
};

export default RegisterForm;
