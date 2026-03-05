import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeAlert, Calendar, CheckCircle, Mail, MapPin, Save, Send, Smartphone, Upload, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { COUNTRIES } from '../constants/countries';
import { getMyActivity, reset, sendVerificationOtp, updateProfile, uploadAvatar, verifyEmailOtp } from '../redux/authSlice';

const initialSocials = {
  facebook: '',
  instagram: '',
  x: '',
  threads: '',
  youtube: '',
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, activity, isError, message, isSuccess } = useSelector((state) => state.auth);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xl font-semibold text-gray-700">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Mail size={14} /> {user.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Smartphone size={14} /> {user.mobile || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50">
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
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
                >
                  <Save size={14} /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        {uploadingAvatar && <p className="text-xs text-gray-500 mt-3">Uploading avatar...</p>}
      </section>

      {!user.emailVerified && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <BadgeAlert size={16} /> Verify your email to unlock bidding and listing
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700"
            >
              <Send size={14} /> {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
            <form onSubmit={handleVerifyOtp} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                maxLength={6}
                placeholder="Enter OTP"
                className="w-full sm:w-44 rounded-lg border border-amber-300 px-3 py-2 text-sm"
              />
              <button disabled={isLoading || otp.trim().length < 4} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-70">{isLoading ? 'Verifying...' : 'Verify'}</button>
            </form>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Account Details</h2>
          {isEditing ? (
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInput}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Mobile Number"
                />
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInput}
                  className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInput}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Specific address (street, apartment, landmark)"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleSocialInput}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Facebook URL"
                />
                <input
                  name="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleSocialInput}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Instagram URL"
                />
                <input
                  name="x"
                  value={formData.socialLinks.x}
                  onChange={handleSocialInput}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="X URL"
                />
                <input
                  name="threads"
                  value={formData.socialLinks.threads}
                  onChange={handleSocialInput}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Threads URL"
                />
              </div>
              <input
                name="youtube"
                value={formData.socialLinks.youtube}
                onChange={handleSocialInput}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="YouTube URL"
              />
            </form>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info label="Role" value={user.role} icon={<User size={15} />} />
                <Info
                  label="Joined"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  icon={<Calendar size={15} />}
                />
                <Info label="Country" value={user.location || 'Not set'} icon={<MapPin size={15} />} />
                <Info label="Mobile" value={user.mobile || 'Not set'} icon={<Smartphone size={15} />} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Address</p>
                <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {user.address || 'No address added'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">ID Verification</p>
                <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {user.idType ? user.idType.toUpperCase() : 'N/A'} | ID: {user.idNumber || 'Not available'}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Verification Status</h3>
            <div className="flex items-center gap-2 text-sm">
              {user.emailVerified ? (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Email verified</span>
                </>
              ) : (
                <>
                  <BadgeAlert size={16} className="text-amber-600" />
                  <span className="text-amber-700 font-medium">Email not verified</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Snapshot</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Listed" value={stats.totalListed} />
              <Metric label="Placed Bids" value={stats.totalPlacedBids} />
              <Metric label="Wins" value={stats.totalWins} />
              <Metric label="Losses" value={stats.totalLosses} />
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bid Activity</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activity?.history?.placedBids?.length ? (
            activity.history.placedBids.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Status: {item.status}</p>
                </div>
                <p className="font-semibold text-gray-900">${item.currentPrice}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No activity yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm text-gray-900 font-medium mt-1 flex items-center gap-2">
      {icon}
      {value}
    </p>
  </div>
);

const Metric = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-900">{value}</p>
  </div>
);

export default Profile;
