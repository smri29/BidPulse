/**
 * Module: features/profile/components/ProfileVerificationModal.jsx
 * Purpose: Presents the Profile Verification Modal dialog and keeps related UI inputs grouped in one place.
 */
import React from 'react';
import { User, X } from 'lucide-react';

import { COUNTRIES } from '../../../constants/countries';
import ProfileField from './ProfileField';

const ProfileVerificationModal = ({
  isLoading,
  step,
  otpCountdownText,
  otp,
  onOtpChange,
  verificationForm,
  onChange,
  avatarPreview,
  onAvatarChange,
  onClose,
  onSubmit,
  onVerifyOtp,
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
    <div className="premium-panel relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-7">
      <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800" type="button">
        <X size={16} />
      </button>

      {step === 'form' && (
        <>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Profile Verification</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Complete your verification details</h2>
            <p className="mt-2 text-sm text-slate-600">
              Provide your identity details, upload your profile picture, then choose OTP or verification link delivery to your primary email.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileField label="Date of Birth" required>
                <input type="date" name="dob" value={verificationForm.dob} onChange={onChange} max={new Date().toISOString().slice(0, 10)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </ProfileField>
              <ProfileField label="Country" required>
                <select name="country" value={verificationForm.country} onChange={onChange} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="Primary Contact" required>
                <input type="text" name="primaryContact" value={verificationForm.primaryContact} onChange={onChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Primary phone number" />
              </ProfileField>
              <ProfileField label="Emergency Contact">
                <input type="text" name="emergencyContact" value={verificationForm.emergencyContact} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Optional backup contact" />
              </ProfileField>
            </div>

            <ProfileField label="NID / Passport Number" required>
              <input type="text" name="idNumber" value={verificationForm.idNumber} onChange={onChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Government-issued ID number" />
            </ProfileField>

            <ProfileField label="Profile Picture" required>
              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Verification preview" className="h-full w-full object-cover" />
                  ) : (
                    <User size={28} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={onAvatarChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:font-semibold file:text-sky-700 hover:file:bg-sky-200" />
                  <p className="mt-2 text-xs text-slate-500">Upload a clear face photo. This becomes your verified profile picture.</p>
                </div>
              </div>
            </ProfileField>

            <ProfileField label="Verification Method" required>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border p-4 ${verificationForm.verificationMethod === 'otp' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                  <input type="radio" name="verificationMethod" value="otp" checked={verificationForm.verificationMethod === 'otp'} onChange={onChange} className="sr-only" />
                  <p className="text-sm font-semibold text-slate-900">OTP Verification</p>
                  <p className="mt-1 text-xs text-slate-600">We will send a 6-digit code to your primary email. Code expires in 10 minutes.</p>
                </label>
                <label className={`cursor-pointer rounded-2xl border p-4 ${verificationForm.verificationMethod === 'link' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                  <input type="radio" name="verificationMethod" value="link" checked={verificationForm.verificationMethod === 'link'} onChange={onChange} className="sr-only" />
                  <p className="text-sm font-semibold text-slate-900">Verification Link</p>
                  <p className="mt-1 text-xs text-slate-600">We will send a secure email link to your primary email. Link expires in 5 minutes.</p>
                </label>
              </div>
            </ProfileField>

            <div className="flex justify-end">
              <button disabled={isLoading} className="btn-premium px-5 py-2.5 text-sm disabled:opacity-70" type="submit">
                {isLoading ? 'Submitting...' : 'Send Verification'}
              </button>
            </div>
          </form>
        </>
      )}

      {step === 'otp' && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">OTP Sent</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Enter your verification code</h2>
          <p className="mt-2 text-sm text-slate-600">
            Check your email for the 6-digit OTP. It expires in 10 minutes.
            <span className="ml-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
              {otpCountdownText}
            </span>
          </p>

          <form onSubmit={onVerifyOtp} className="mt-6 space-y-4">
            <input value={otp} onChange={(event) => onOtpChange(event.target.value)} maxLength={6} placeholder="Enter OTP" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-lg tracking-[0.4em]" />
            <div className="flex justify-end">
              <button disabled={isLoading || otp.trim().length < 6} className="btn-premium px-5 py-2.5 text-sm disabled:opacity-70" type="submit">
                {isLoading ? 'Verifying...' : 'Verify Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'link' && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Verification Link Sent</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Check your email</h2>
          <p className="mt-2 text-sm text-slate-600">
            We sent a secure verification link to your primary email. Open that link within 5 minutes to complete profile verification.
          </p>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn-soft px-5 py-2.5 text-sm text-slate-700" type="button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ProfileVerificationModal;
