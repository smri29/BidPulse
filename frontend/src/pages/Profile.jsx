import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { BadgeAlert, Calendar, CheckCircle, Mail, MapPin, Save, Send, Smartphone, Upload, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { COUNTRIES } from '../constants/countries';
import {
  getMyActivity,
  reset,
  sendVerificationOtp,
  updateProfile,
  uploadAvatar,
  verifyEmailOtp,
} from '../redux/authSlice';
import Reveal from '../components/ui/Reveal';
import AnimatedNumber from '../components/ui/AnimatedNumber';

const initialSocials = {
  facebook: '',
  instagram: '',
  x: '',
  threads: '',
  youtube: '',
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, activity, isError, isSuccess } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [otp, setOtp] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    location: '',
    address: '',
    socialLinks: initialSocials,
  });

  useEffect(() => {
    if (!user?.token) return;
    dispatch(getMyActivity());
  }, [dispatch, user?.token]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      mobile: user.mobile || '',
      location: user.location || '',
      address: user.address || '',
      socialLinks: {
        ...initialSocials,
        ...(user.socialLinks || {}),
      },
    });
  }, [user]);

  useEffect(() => {
    if (isError || isSuccess) {
      dispatch(reset());
    }
  }, [dispatch, isError, isSuccess]);

  const stats = useMemo(
    () => activity?.stats || { totalListed: 0, totalPlacedBids: 0, totalWins: 0, totalLosses: 0 },
    [activity?.stats]
  );

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  const handleInput = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialInput = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
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

  const handleSendOtp = () => {
    dispatch(sendVerificationOtp())
      .unwrap()
      .then((res) => toast.success(res.message || 'OTP sent', { toastId: 'otp-sent' }))
      .catch((error) => toast.error(error, { toastId: `otp-send-${error}` }));
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    dispatch(verifyEmailOtp(otp))
      .unwrap()
      .then(() => {
        toast.success('Email verified successfully', { toastId: 'otp-verified' });
        setOtp('');
      })
      .catch((error) => toast.error(error, { toastId: `otp-verify-${error}` }));
  };

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
                  <Smartphone size={14} /> {user.mobile || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="btn-soft inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700">
                <Upload size={14} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploadingAvatar(true);
                    dispatch(uploadAvatar(file))
                      .unwrap()
                      .then(() => toast.success('Profile photo updated'))
                      .catch((error) => toast.error(error))
                      .finally(() => setUploadingAvatar(false));
                  }}
                />
              </label>
              {isEditing ? (
                <>
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
                </>
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
          </div>
          {uploadingAvatar && <p className="mt-3 text-xs text-gray-500">Uploading avatar...</p>}
        </section>
      </Reveal>

      {!user.emailVerified && (
        <Reveal delay={60}>
          <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <BadgeAlert size={16} /> Verify your email to unlock bidding and listing
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                type="button"
              >
                <Send size={14} /> {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
              <form onSubmit={handleVerifyOtp} className="flex w-full items-center gap-2 sm:w-auto">
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  maxLength={6}
                  placeholder="Enter OTP"
                  className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm sm:w-44"
                />
                <button disabled={isLoading || otp.trim().length < 4} className="btn-secondary px-4 py-2 text-sm disabled:opacity-70" type="submit">
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </div>
          </section>
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal delay={90} className="lg:col-span-2">
          <section className="premium-panel rounded-2xl p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Account Details</h2>
            {isEditing ? (
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input type="text" name="name" value={formData.name} onChange={handleInput} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Full Name" />
                  <input type="text" value={user.email} disabled className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleInput} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Mobile Number" />
                  <select name="location" value={formData.location} onChange={handleInput} className="rounded-lg border border-gray-300 bg-white px-3 py-2">
                    <option value="">Select Country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea name="address" value={formData.address} onChange={handleInput} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Specific address (street, apartment, landmark)" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input name="facebook" value={formData.socialLinks.facebook} onChange={handleSocialInput} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Facebook URL" />
                  <input name="instagram" value={formData.socialLinks.instagram} onChange={handleSocialInput} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Instagram URL" />
                  <input name="x" value={formData.socialLinks.x} onChange={handleSocialInput} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="X URL" />
                  <input name="threads" value={formData.socialLinks.threads} onChange={handleSocialInput} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Threads URL" />
                </div>
                <input name="youtube" value={formData.socialLinks.youtube} onChange={handleSocialInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="YouTube URL" />
              </form>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Info label="Role" value={user.role} icon={<User size={15} />} />
                  <Info label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} icon={<Calendar size={15} />} />
                  <Info label="Country" value={user.location || 'Not set'} icon={<MapPin size={15} />} />
                  <Info label="Mobile" value={user.mobile || 'Not set'} icon={<Smartphone size={15} />} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Address</p>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.address || 'No address added'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">ID Verification</p>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                    {user.idType ? user.idType.toUpperCase() : 'N/A'} | ID: {user.idNumber || 'Not available'}
                  </p>
                </div>
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
                    <span className="font-medium text-green-700">Email verified</span>
                  </>
                ) : (
                  <>
                    <BadgeAlert size={16} className="text-amber-600" />
                    <span className="font-medium text-amber-700">Email not verified</span>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="premium-panel rounded-2xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Activity Snapshot</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Listed" value={stats.totalListed} />
                <Metric label="Placed Bids" value={stats.totalPlacedBids} />
                <Metric label="Wins" value={stats.totalWins} />
                <Metric label="Losses" value={stats.totalLosses} />
              </div>
            </motion.div>
          </section>
        </Reveal>
      </div>

      <Reveal delay={140} className="mt-6">
        <section className="premium-panel rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Bid Activity</h2>
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
    </div>
  );
};

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

export default Profile;
