/**
 * Module: features/profile/hooks/useProfileVerificationFlow.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Profile Verification Flow flow.
 */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import {
  startProfileVerification,
  uploadAvatar,
  verifyProfileOtp,
} from '../../../redux/authSlice';
import { initialVerificationForm } from '../constants';
import {
  clearVerificationUiState,
  readVerificationUiState,
  writeVerificationUiState,
} from '../verificationStorage';
import { createVerificationFormFromUser } from '../utils/profileForms';

export const useProfileVerificationFlow = (user) => {
  const dispatch = useDispatch();
  // Modal visibility and timers are kept locally because they represent
  // short-lived UI workflow state rather than backend-authored profile data.
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCooldownEndsAt, setVerificationCooldownEndsAt] = useState(null);
  const [verificationCooldownLabel, setVerificationCooldownLabel] = useState('Awaiting Verification');
  const [verificationCountdown, setVerificationCountdown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [verificationStep, setVerificationStep] = useState('form');
  const [isStartingVerification, setIsStartingVerification] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationForm, setVerificationForm] = useState(initialVerificationForm);
  const [verificationAvatarFile, setVerificationAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Seed the verification form from the current user so the user edits
    // fewer fields manually when retrying verification.
    setVerificationForm(createVerificationFormFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Restore any in-progress verification flow after refresh so countdowns
    // and step state survive while the user checks email.
    const storedState = readVerificationUiState(user);
    if (!storedState) return;

    const now = Date.now();
    const nextCooldownEndsAt =
      Number.isFinite(storedState.cooldownEndsAt) && storedState.cooldownEndsAt > now
        ? storedState.cooldownEndsAt
        : null;
    const nextOtpExpiresAt =
      Number.isFinite(storedState.otpExpiresAt) && storedState.otpExpiresAt > now
        ? storedState.otpExpiresAt
        : null;

    if (!nextCooldownEndsAt && !nextOtpExpiresAt) {
      clearVerificationUiState(user);
      return;
    }

    if (nextCooldownEndsAt) {
      setVerificationCooldownEndsAt(nextCooldownEndsAt);
      setVerificationCooldownLabel(storedState.cooldownLabel || 'Awaiting Verification');
    }
    if (nextOtpExpiresAt) setOtpExpiresAt(nextOtpExpiresAt);

    if (storedState.step === 'otp' && nextOtpExpiresAt) {
      setVerificationStep('otp');
      setIsVerificationModalOpen(Boolean(storedState.modalOpen));
      return;
    }

    if (storedState.step === 'link' && nextCooldownEndsAt) {
      setVerificationStep('link');
      setIsVerificationModalOpen(Boolean(storedState.modalOpen));
    }
  }, [user?._id, user?.id, user?.email]);

  useEffect(() => {
    if (!user?.emailVerified) return;
    // Once verification succeeds, clear every transient step so the flow
    // cannot reopen in an outdated state.
    setIsVerificationModalOpen(false);
    setVerificationStep('form');
    setVerificationCooldownEndsAt(null);
    setOtpExpiresAt(null);
    setOtp('');
    clearVerificationUiState(user);
  }, [user?.emailVerified]);

  useEffect(() => {
    if (!verificationCooldownEndsAt) {
      setVerificationCountdown(0);
      return undefined;
    }
    // Countdown ticks once per second so buttons and helper labels stay in sync
    // with the current lockout window.
    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.ceil((verificationCooldownEndsAt - Date.now()) / 1000));
      setVerificationCountdown(remainingSeconds);
      if (remainingSeconds === 0) setVerificationCooldownEndsAt(null);
    };
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [verificationCooldownEndsAt]);

  useEffect(() => {
    if (!otpExpiresAt) {
      setOtpCountdown(0);
      return undefined;
    }
    // OTP countdown is tracked separately because the cooldown window and
    // the code-expiry window are related but not identical.
    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setOtpCountdown(remainingSeconds);
      if (remainingSeconds === 0) setOtpExpiresAt(null);
    };
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (!user) return;
    const hasCooldown = Number.isFinite(verificationCooldownEndsAt) && verificationCooldownEndsAt > Date.now();
    const hasOtpExpiry = Number.isFinite(otpExpiresAt) && otpExpiresAt > Date.now();
    const hasPendingStep = verificationStep === 'otp' || verificationStep === 'link';

    if (!hasCooldown && !hasOtpExpiry && !hasPendingStep) {
      clearVerificationUiState(user);
      return;
    }

    // Persist the current verification UI state so the user can safely refresh
    // while waiting for email or entering the OTP code.
    writeVerificationUiState(user, {
      cooldownEndsAt: hasCooldown ? verificationCooldownEndsAt : null,
      cooldownLabel: verificationCooldownLabel,
      otpExpiresAt: hasOtpExpiry ? otpExpiresAt : null,
      step: verificationStep,
      modalOpen: isVerificationModalOpen,
    });
  }, [
    user?._id,
    user?.id,
    user?.email,
    verificationCooldownEndsAt,
    verificationCooldownLabel,
    otpExpiresAt,
    verificationStep,
    isVerificationModalOpen,
  ]);

  const verificationAvatarPreview = useMemo(() => {
    // Local file previews use object URLs until the backend confirms the upload.
    if (verificationAvatarFile) return URL.createObjectURL(verificationAvatarFile);
    return user?.avatarUrl || '';
  }, [verificationAvatarFile, user?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (verificationAvatarFile && verificationAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(verificationAvatarPreview);
      }
    };
  }, [verificationAvatarFile, verificationAvatarPreview]);

  const isVerificationCooldownActive = verificationCountdown > 0;
  const isVerificationBusy = isStartingVerification || isVerifyingOtp;

  const openVerificationModal = () => {
    // Reopen the most relevant step instead of always forcing the user back to
    // the start of the workflow.
    if (isVerificationCooldownActive && verificationCooldownLabel === 'Link Sent') {
      setVerificationStep('link');
    } else if (otpExpiresAt && otpCountdown > 0) {
      setVerificationStep('otp');
    } else {
      setVerificationStep('form');
      setOtp('');
    }
    setIsVerificationModalOpen(true);
  };

  const closeVerificationModal = () => {
    if (isVerificationBusy) return;
    setIsVerificationModalOpen(false);
    setVerificationStep('form');
    setOtp('');
    setOtpExpiresAt(null);
  };

  const handleVerificationFormChange = (event) => {
    const { name, value } = event.target;
    setVerificationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerificationAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Client-side file-type validation gives faster feedback before upload.
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setVerificationAvatarFile(file);
  };

  const handleStartVerification = (event) => {
    event.preventDefault();
    setIsStartingVerification(true);
    // Multipart form data is required because the request can include both
    // text identity fields and an uploaded profile image.
    const payload = new FormData();
    payload.append('dob', verificationForm.dob);
    payload.append('country', verificationForm.country);
    payload.append('primaryContact', verificationForm.primaryContact);
    payload.append('emergencyContact', verificationForm.emergencyContact);
    payload.append('idNumber', verificationForm.idNumber);
    payload.append('verificationMethod', verificationForm.verificationMethod);
    if (verificationAvatarFile) payload.append('avatar', verificationAvatarFile);

    dispatch(startProfileVerification(payload))
      .unwrap()
      .then((response) => {
        toast.success(response.message || 'Verification request created');
        // A short resend cooldown prevents accidental duplicate verification
        // requests while the user waits for the OTP or email link.
        setVerificationCooldownEndsAt(Date.now() + 60 * 1000);
        setVerificationCooldownLabel(
          response.verificationMethod === 'link' ? 'Link Sent' : 'Awaiting Verification'
        );
        setIsVerificationModalOpen(true);
        if (response.verificationMethod === 'otp') {
          const expiresInSeconds = Number(response.otpExpiresInSeconds || 10 * 60);
          setOtpExpiresAt(Date.now() + expiresInSeconds * 1000);
          setVerificationStep('otp');
          return;
        }
        setVerificationStep('link');
      })
      .catch((error) => toast.error(error || 'Unable to start profile verification'))
      .finally(() => setIsStartingVerification(false));
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    setIsVerifyingOtp(true);
    dispatch(verifyProfileOtp(otp))
      .unwrap()
      .then((response) => {
        toast.success(response.message || 'Profile verified successfully');
        setIsVerificationModalOpen(false);
        setVerificationStep('form');
        setVerificationCooldownEndsAt(null);
        setVerificationAvatarFile(null);
        setOtp('');
        setOtpExpiresAt(null);
        clearVerificationUiState(user);
      })
      .catch((error) => toast.error(error || 'Unable to verify OTP'))
      .finally(() => setIsVerifyingOtp(false));
  };

  const handleAvatarUpload = (file, onFinally) => {
    if (!file) return;
    // Profile picture updates are separate from verification submission so the
    // account avatar can change without restarting the verification flow.
    setIsUploadingAvatar(true);
    dispatch(uploadAvatar(file))
      .unwrap()
      .then(() => toast.success('Profile picture updated', { toastId: 'profile-photo-updated' }))
      .catch((error) => toast.error(error || 'Failed to update profile picture'))
      .finally(() => {
        setIsUploadingAvatar(false);
        if (onFinally) onFinally();
      });
  };

  return {
    isVerificationModalOpen,
    verificationCooldownLabel,
    verificationCountdown,
    otpCountdown,
    verificationStep,
    otp,
    setOtp,
    verificationForm,
    verificationAvatarPreview,
    isUploadingAvatar,
    isVerificationCooldownActive,
    isVerificationBusy,
    openVerificationModal,
    closeVerificationModal,
    handleVerificationFormChange,
    handleVerificationAvatarChange,
    handleStartVerification,
    handleVerifyOtp,
    handleAvatarUpload,
  };
};
