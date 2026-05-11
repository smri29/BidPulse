import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  BadgeAlert,
  Calendar,
  CheckCircle,
  Clock3,
  Link2,
  IdCard,
  Mail,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Smartphone,
  User,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { COUNTRIES } from '../constants/countries';
import {
  getMyActivity,
  startProfileVerification,
  updateProfile,
  uploadAvatar,
  verifyProfileOtp,
} from '../redux/authSlice';
import Reveal from '../components/ui/Reveal';
import AnimatedNumber from '../components/ui/AnimatedNumber';

const initialVerificationForm = {
  dob: '',
  country: '',
  primaryContact: '',
  emergencyContact: '',
  idNumber: '',
  verificationMethod: 'otp',
};

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, activity } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
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
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    cityState: '',
    postalCode: '',
    gender: '',
    occupation: '',
    preferredDeliveryAddress: '',
    secondaryEmail: '',
    medicalNotes: '',
    socialProfiles: [],
  });

  useEffect(() => {
    if (!user?.token) return;
    dispatch(getMyActivity());
  }, [dispatch, user?.token]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      address: user.address || '',
      emergencyContact: user.emergencyContact || '',
      bloodGroup: user.bloodGroup || '',
      cityState: user.cityState || '',
      postalCode: user.postalCode || '',
      gender: user.gender || '',
      occupation: user.occupation || '',
      preferredDeliveryAddress: user.preferredDeliveryAddress || '',
      secondaryEmail: user.secondaryEmail || '',
      medicalNotes: user.medicalNotes || '',
      socialProfiles: Array.isArray(user.socialProfiles) ? user.socialProfiles : [],
    });
    setVerificationForm({
      dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
      country: user.location && user.location !== 'Not set' ? user.location : '',
      primaryContact: user.mobile || '',
      emergencyContact: user.emergencyContact || '',
      idNumber: user.idNumber || '',
      verificationMethod: 'otp',
    });
  }, [user]);

  useEffect(() => {
    if (!verificationCooldownEndsAt) {
      setVerificationCountdown(0);
      return undefined;
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.ceil((verificationCooldownEndsAt - Date.now()) / 1000));
      setVerificationCountdown(remainingSeconds);
      if (remainingSeconds === 0) {
        setVerificationCooldownEndsAt(null);
      }
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

    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setOtpCountdown(remainingSeconds);
      if (remainingSeconds === 0) {
        setOtpExpiresAt(null);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [otpExpiresAt]);

  const stats = useMemo(
    () => activity?.stats || { totalListed: 0, totalPlacedBids: 0, totalWins: 0, totalLosses: 0 },
    [activity?.stats]
  );

  const isVerificationCooldownActive = verificationCountdown > 0;
  const isVerificationBusy = isStartingVerification || isVerifyingOtp;

  const verificationAvatarPreview = useMemo(() => {
    if (verificationAvatarFile) {
      return URL.createObjectURL(verificationAvatarFile);
    }
    return user?.avatarUrl || '';
  }, [verificationAvatarFile, user?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (verificationAvatarFile && verificationAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(verificationAvatarPreview);
      }
    };
  }, [verificationAvatarFile, verificationAvatarPreview]);

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  const handleInput = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialInput = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: prev.socialProfiles.map((profile, profileIndex) =>
        profileIndex === index ? { ...profile, [key]: value } : profile
      ),
    }));
  };

  const handleAddSocialProfile = () => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: [...prev.socialProfiles, { name: '', link: '' }],
    }));
  };

  const handleRemoveSocialProfile = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: prev.socialProfiles.filter((_, profileIndex) => profileIndex !== index),
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        toast.success('Profile updated', { toastId: 'profile-updated' });
        setIsEditing(false);
      })
      .catch((error) => toast.error(error || 'Failed to update profile', { toastId: `profile-update-${error || 'failed'}` }));
  };

  const openVerificationModal = () => {
    setVerificationStep('form');
    setOtp('');
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
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setVerificationAvatarFile(file);
  };

  const handleStartVerification = (event) => {
    event.preventDefault();
    setIsStartingVerification(true);

    const payload = new FormData();
    payload.append('dob', verificationForm.dob);
    payload.append('country', verificationForm.country);
    payload.append('primaryContact', verificationForm.primaryContact);
    payload.append('emergencyContact', verificationForm.emergencyContact);
    payload.append('idNumber', verificationForm.idNumber);
    payload.append('verificationMethod', verificationForm.verificationMethod);
    if (verificationAvatarFile) {
      payload.append('avatar', verificationAvatarFile);
    }

    dispatch(startProfileVerification(payload))
      .unwrap()
      .then((response) => {
        toast.success(response.message || 'Verification request created');
        setVerificationCooldownEndsAt(Date.now() + 60 * 1000);
        setVerificationCooldownLabel(response.verificationMethod === 'link' ? 'Link Sent' : 'Awaiting Verification');
        setIsVerificationModalOpen(true);
        if (response.verificationMethod === 'otp') {
          const expiresInSeconds = Number(response.otpExpiresInSeconds || 10 * 60);
          setOtpExpiresAt(Date.now() + expiresInSeconds * 1000);
          setVerificationStep('otp');
          return;
        }
        setVerificationStep('link');
      })
      .catch((error) => {
        toast.error(error || 'Unable to start profile verification');
      })
      .finally(() => {
        setIsStartingVerification(false);
      });
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
        setVerificationAvatarFile(null);
        setOtp('');
        setOtpExpiresAt(null);
      })
      .catch((error) => toast.error(error || 'Unable to verify OTP'))
      .finally(() => {
        setIsVerifyingOtp(false);
      });
  };

  const verificationCountdownText = formatCountdown(verificationCountdown);
  const otpCountdownText = formatCountdown(otpCountdown);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel mb-6 rounded-2xl p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.04 }} className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-xl font-semibold text-gray-700">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </motion.div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} /> {user.email}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck size={14} /> {user.emailVerified ? 'Profile verified' : 'Verification required'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!user.emailVerified && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openVerificationModal}
                    disabled={isVerificationCooldownActive}
                    className="btn-premium inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-70"
                    type="button"
                  >
                    <ShieldCheck size={14} /> {isVerificationCooldownActive ? verificationCooldownLabel : 'Verify'}
                  </button>
                  {isVerificationCooldownActive && (
                    <span className="text-sm font-semibold text-amber-700">{verificationCountdownText}</span>
                  )}
                </div>
              )}
              <label className="btn-soft inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-slate-700">
                <User size={14} /> {isUploadingAvatar ? 'Uploading...' : 'Edit Profile Picture'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setIsUploadingAvatar(true);
                    dispatch(uploadAvatar(file))
                      .unwrap()
                      .then(() => toast.success('Profile picture updated', { toastId: 'profile-photo-updated' }))
                      .catch((error) => toast.error(error || 'Failed to update profile picture'))
                      .finally(() => {
                        setIsUploadingAvatar(false);
                        event.target.value = '';
                      });
                  }}
                />
              </label>
            </div>
          </div>
        </section>
      </Reveal>

      {!user.emailVerified && (
        <Reveal delay={60}>
          <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <BadgeAlert size={16} /> Verify your profile before joining auctions or creating listings
                </p>
                <p className="text-sm text-amber-700">
                  Complete your identity details, then verify through OTP or email link sent to your primary email address.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openVerificationModal}
                  disabled={isVerificationCooldownActive}
                  className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                >
                  {isVerificationCooldownActive ? verificationCooldownLabel : 'Start Verification'}
                </button>
                {isVerificationCooldownActive && (
                  <span className="text-sm font-semibold text-amber-700">{verificationCountdownText}</span>
                )}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal delay={90} className="lg:col-span-2">
          <section className="premium-panel rounded-2xl p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-premium inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-70"
                    type="button"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-soft px-4 py-2 text-sm text-slate-700"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-soft px-4 py-2 text-sm text-slate-700"
                  type="button"
                >
                  Edit Profile
                </button>
              )}
            </div>
            {isEditing ? (
              <form className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Basic Information</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Full Name">
                      <input type="text" name="name" value={formData.name} onChange={handleInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Full Name" />
                    </Field>
                    <Field label="Email Address">
                      <input type="text" value={user.email} disabled className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500" />
                    </Field>
                    <Field label="Emergency Contact">
                      <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Add or update emergency contact" />
                    </Field>
                    <Field label="Blood Group">
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInput} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <option value="">Select blood group</option>
                        {BLOOD_GROUP_OPTIONS.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Gender">
                      <select name="gender" value={formData.gender} onChange={handleInput} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Occupation">
                      <input type="text" name="occupation" value={formData.occupation} onChange={handleInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Occupation" />
                    </Field>
                    <Field label="Secondary Email">
                      <input type="email" name="secondaryEmail" value={formData.secondaryEmail} onChange={handleInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Secondary email address" />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Address</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="City / State">
                      <input type="text" name="cityState" value={formData.cityState} onChange={handleInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="City / State" />
                    </Field>
                    <Field label="Postal Code">
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Postal code" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Specific Address">
                      <textarea name="address" value={formData.address} onChange={handleInput} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Street, apartment, landmark, or delivery notes" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Preferred Delivery Address">
                      <textarea name="preferredDeliveryAddress" value={formData.preferredDeliveryAddress} onChange={handleInput} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Preferred delivery address for orders" />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Social Profiles</p>
                    <button onClick={handleAddSocialProfile} className="btn-soft inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-700" type="button">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.socialProfiles.length > 0 ? (
                      formData.socialProfiles.map((profile, index) => (
                        <div key={`${index}-${profile.name}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
                            <Field label="Name">
                              <input
                                value={profile.name}
                                onChange={(event) => handleSocialInput(index, 'name', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="Platform name"
                              />
                            </Field>
                            <Field label="Link">
                              <input
                                value={profile.link}
                                onChange={(event) => handleSocialInput(index, 'link', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="Profile URL"
                              />
                            </Field>
                            <button onClick={() => handleRemoveSocialProfile(index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50" type="button">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No social profiles added yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Health Notes</p>
                  <Field label="Medical Notes / Allergies">
                    <textarea name="medicalNotes" value={formData.medicalNotes} onChange={handleInput} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Any important medical notes or allergies" />
                  </Field>
                </div>
              </form>
            ) : user.emailVerified ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Info label="Date of Birth" value={formatDate(user.dob)} icon={<Calendar size={15} />} />
                  <Info label="Country" value={user.location || 'Not set'} icon={<MapPin size={15} />} />
                  <Info label="Primary Contact" value={user.mobile || 'Not set'} icon={<Smartphone size={15} />} />
                  <Info label="Emergency Contact" value={user.emergencyContact || 'Not provided'} icon={<Users size={15} />} />
                  <Info label="Blood Group" value={user.bloodGroup || 'Not provided'} icon={<BadgeAlert size={15} />} />
                  <Info label="City / State" value={user.cityState || 'Not provided'} icon={<MapPin size={15} />} />
                  <Info label="Postal Code" value={user.postalCode || 'Not provided'} icon={<IdCard size={15} />} />
                  <Info label="Gender" value={user.gender || 'Not provided'} icon={<User size={15} />} />
                  <Info label="Occupation" value={user.occupation || 'Not provided'} icon={<BadgeAlert size={15} />} />
                  <Info label="Secondary Email" value={user.secondaryEmail || 'Not provided'} icon={<Mail size={15} />} />
                  <Info label="NID / Passport Number" value={user.idNumber || 'Not set'} icon={<IdCard size={15} />} />
                  <Info label="Verified On" value={formatDateTime(user.profileVerifiedAt || user.createdAt)} icon={<Clock3 size={15} />} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Address</p>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.address || 'No address added'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Preferred Delivery Address</p>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.preferredDeliveryAddress || 'No preferred delivery address added'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Medical Notes / Allergies</p>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.medicalNotes || 'No medical notes added'}</p>
                </div>
                <div>
                  <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">Social Profiles</p>
                  {Array.isArray(user.socialProfiles) && user.socialProfiles.length > 0 ? (
                    <div className="space-y-3">
                      {user.socialProfiles.map((profile, index) => (
                        <div key={`${profile.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{profile.name || 'Unnamed profile'}</p>
                            <p className="mt-1 break-all text-sm text-slate-600">{profile.link || 'No link added'}</p>
                          </div>
                          <Link2 size={16} className="shrink-0 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">No social profiles added.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <ShieldCheck className="mx-auto mb-3 text-slate-400" size={28} />
                <p className="text-sm font-semibold text-slate-800">Your profile verification is pending</p>
                <p className="mt-2 text-sm text-slate-600">
                  Complete your identity details to unlock auction participation and selling on AuctionPulse.
                </p>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="space-y-4">
            <motion.div whileHover={{ y: -2 }} className="premium-panel rounded-2xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Verification Status</h3>
              <div className="flex items-center gap-2 text-sm">
                {user.emailVerified ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">Profile verified and auction-ready</span>
                  </>
                ) : (
                  <>
                    <BadgeAlert size={16} className="text-amber-600" />
                    <span className="font-medium text-amber-700">Profile verification required</span>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="premium-panel rounded-2xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Activity Snapshot</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Listed" value={stats.totalListed} />
                <Metric label="Offers Placed" value={stats.totalPlacedBids} />
                <Metric label="Wins" value={stats.totalWins} />
                <Metric label="Losses" value={stats.totalLosses} />
              </div>
            </motion.div>
          </section>
        </Reveal>
      </div>

      <Reveal delay={140} className="mt-6">
        <section className="premium-panel rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Auction Activity</h2>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {activity?.history?.placedBids?.length ? (
              activity.history.placedBids.map((item) => (
                <motion.div key={item._id} whileHover={{ x: 2 }} className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">Status: {item.status}</p>
                  </div>
                  <p className="font-semibold text-gray-900">${item.currentPrice}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No activity yet.</p>
            )}
          </div>
        </section>
      </Reveal>

      {isVerificationModalOpen && (
        <VerificationModal
          isLoading={isVerificationBusy}
          step={verificationStep}
          otpCountdownText={otpCountdownText}
          otp={otp}
          onOtpChange={setOtp}
          verificationForm={verificationForm}
          onChange={handleVerificationFormChange}
          avatarPreview={verificationAvatarPreview}
          onAvatarChange={handleVerificationAvatarChange}
          onClose={closeVerificationModal}
          onSubmit={handleStartVerification}
          onVerifyOtp={handleVerifyOtp}
        />
      )}
    </div>
  );
};

const VerificationModal = ({
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
              <Field label="Date of Birth" required>
                <input type="date" name="dob" value={verificationForm.dob} onChange={onChange} max={new Date().toISOString().slice(0, 10)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </Field>
              <Field label="Country" required>
                <select name="country" value={verificationForm.country} onChange={onChange} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Primary Contact" required>
                <input type="text" name="primaryContact" value={verificationForm.primaryContact} onChange={onChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Primary phone number" />
              </Field>
              <Field label="Emergency Contact">
                <input type="text" name="emergencyContact" value={verificationForm.emergencyContact} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Optional backup contact" />
              </Field>
            </div>

            <Field label="NID / Passport Number" required>
              <input type="text" name="idNumber" value={verificationForm.idNumber} onChange={onChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Government-issued ID number" />
            </Field>

            <Field label="Profile Picture" required>
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
            </Field>

            <Field label="Verification Method" required>
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
            </Field>

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

const Field = ({ label, required = false, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required ? ' *' : ''}
    </span>
    {children}
  </label>
);

const Info = ({ label, value, icon }) => (
  <motion.div whileHover={{ y: -2 }} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
      {icon}
      {value}
    </p>
  </motion.div>
);

const Metric = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <AnimatedNumber value={value} className="text-lg font-semibold text-gray-900" />
  </div>
);

const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
};

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default Profile;
