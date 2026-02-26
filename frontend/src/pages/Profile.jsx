import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Calendar,
  FileText,
  MapPin,
  CheckCircle,
  Save,
  X,
  Smartphone,
  BadgeAlert,
  Send,
  History,
  Trophy,
  Gavel,
  Globe,
  Upload,
} from 'lucide-react';
import {
  updateProfile,
  getMyActivity,
  sendVerificationOtp,
  verifyEmailOtp,
  reset,
  uploadAvatar,
  setEmojiAvatar,
} from '../redux/authSlice';
import { toast } from 'react-toastify';

const LOCATIONS = [
  'New York, USA',
  'California, USA',
  'Texas, USA',
  'Florida, USA',
  'London, UK',
  'Dubai, UAE',
  'Toronto, Canada',
  'Sydney, Australia',
  'Dhaka, Bangladesh',
  'Custom',
];

const EMOJI_SET = ['??', '??', '??', '??', '??', '??', '???', '??', '??', '?'];

const Profile = () => {
  const { user, isLoading, activity, isError, message, isSuccess } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [otp, setOtp] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    location: user?.location || '',
    socialLinks: {
      facebook: user?.socialLinks?.facebook || '',
      instagram: user?.socialLinks?.instagram || '',
      x: user?.socialLinks?.x || '',
      threads: user?.socialLinks?.threads || '',
      youtube: user?.socialLinks?.youtube || '',
    },
  });

  useEffect(() => {
    if (user?.token) {
      dispatch(getMyActivity());
    }
  }, [dispatch, user?.token]);

  useEffect(() => {
    if (isError && message) toast.error(message);
    if (isSuccess && message) toast.success(message);
    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  const stats = activity?.stats || { totalPlacedBids: 0, totalWins: 0, totalLosses: 0, feedbackScore: 0 };

  const reputationLevel = useMemo(() => {
    if (stats.feedbackScore >= 85) return 'Elite';
    if (stats.feedbackScore >= 70) return 'Trusted';
    if (stats.feedbackScore >= 50) return 'Growing';
    return 'New';
  }, [stats.feedbackScore]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSocialChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      location: formData.location === 'Custom' ? customLocation || user.location : formData.location,
    };

    dispatch(updateProfile(payload))
      .unwrap()
      .then(() => {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      })
      .catch((err) => toast.error(err || 'Failed to update profile'));
  };

  const handleSendOtp = () => {
    dispatch(sendVerificationOtp())
      .unwrap()
      .then((res) => toast.success(res.message || 'OTP sent'))
      .catch((err) => toast.error(err));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    dispatch(verifyEmailOtp(otp))
      .unwrap()
      .then(() => {
        toast.success('Email verified successfully');
        setOtp('');
      })
      .catch((err) => toast.error(err));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white overflow-hidden mb-6 animate-fade-up">
        <div className="h-36 bg-gradient-to-r from-bid-purple via-blue-600 to-emerald-500"></div>
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-12 left-8">
            <div className="h-24 w-24 bg-white rounded-full p-1 shadow-lg">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                  {user.avatarEmoji || user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="mt-14 ml-32 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {user.name}
                {user.emailVerified ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <BadgeAlert size={12} /> Unverified
                  </span>
                )}
              </h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail size={14} /> {user.email}</p>
              <p className="text-gray-500 flex items-center gap-2 mt-1"><Smartphone size={14} /> {user.mobile || 'Not set'}</p>
            </div>

            <div className="flex gap-2 items-start">
              {isEditing ? (
                <>
                  <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"><Save size={16} /> Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"><X size={16} /> Cancel</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Edit Profile</button>
              )}
            </div>
          </div>

          <div className="mt-4 ml-0 md:ml-32">
            <div className="text-xs text-gray-500 mb-2">Avatar</div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm cursor-pointer hover:bg-gray-50">
                <Upload size={14} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingAvatar(true);
                    dispatch(uploadAvatar(file))
                      .unwrap()
                      .then(() => toast.success('Profile photo updated'))
                      .catch((err) => toast.error(err))
                      .finally(() => setUploadingAvatar(false));
                  }}
                />
              </label>

              <div className="flex items-center gap-1 flex-wrap">
                {EMOJI_SET.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() =>
                      dispatch(setEmojiAvatar(emoji))
                        .unwrap()
                        .then(() => toast.success('Emoji avatar updated'))
                        .catch((err) => toast.error(err))
                    }
                    className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {uploadingAvatar && <span className="text-xs text-gray-500">Uploading...</span>}
            </div>
          </div>

          {!user.emailVerified && (
            <div className="mt-6 ml-0 md:ml-32 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-pulse-glow">
              <h3 className="font-bold text-amber-800 mb-2">Verify your email to unlock bidding and listing</h3>
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <button onClick={handleSendOtp} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                  <Send size={14} /> Send OTP
                </button>
                <form onSubmit={handleVerifyOtp} className="flex gap-2 items-center">
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="Enter 6-digit OTP" className="rounded-lg border border-amber-300 px-3 py-2 text-sm" />
                  <button className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-semibold">Verify</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Profile Details</h2>
            {isEditing ? (
              <div className="space-y-4">
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Full Name" />
                <input type="text" value={user.email} disabled className="w-full rounded-lg border border-gray-200 bg-gray-100 text-gray-500 px-3 py-2" />
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Mobile" />

                <select name="location" value={formData.location} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                  <option value="">Select location</option>
                  {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                {formData.location === 'Custom' && (
                  <input value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Enter custom location" />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="facebook" value={formData.socialLinks.facebook} onChange={handleSocialChange} placeholder="Facebook URL" className="rounded-lg border border-gray-300 px-3 py-2" />
                  <input name="instagram" value={formData.socialLinks.instagram} onChange={handleSocialChange} placeholder="Instagram URL" className="rounded-lg border border-gray-300 px-3 py-2" />
                  <input name="x" value={formData.socialLinks.x} onChange={handleSocialChange} placeholder="X URL" className="rounded-lg border border-gray-300 px-3 py-2" />
                  <input name="threads" value={formData.socialLinks.threads} onChange={handleSocialChange} placeholder="Threads URL" className="rounded-lg border border-gray-300 px-3 py-2" />
                  <input name="youtube" value={formData.socialLinks.youtube} onChange={handleSocialChange} placeholder="YouTube URL" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Info icon={<User size={16} className="text-bid-purple" />} label="Role" value={user.role} />
                  <Info icon={<Calendar size={16} className="text-bid-purple" />} label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} />
                  <Info icon={<MapPin size={16} className="text-bid-purple" />} label="Location" value={user.location || 'Not set'} />
                  <Info icon={<Smartphone size={16} className="text-bid-purple" />} label="Mobile" value={user.mobile || 'Not set'} />
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <label className="text-xs text-gray-400 uppercase font-semibold">ID Verification</label>
                  <div className="mt-2 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <FileText className="text-gray-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user.idType ? user.idType.toUpperCase() : 'N/A'} Provided</p>
                      <p className="text-xs text-gray-500">ID: {user.idNumber || 'Not Available'}</p>
                    </div>
                    <div className="ml-auto text-green-600"><CheckCircle size={20} /></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Social Links</label>
                  <div className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(user.socialLinks || {}).map(([k, v]) => (
                      <p key={k}><span className="font-semibold capitalize">{k}:</span> {v || 'Not added'}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><History size={18} className="text-bid-purple" /> Activity History</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Stat label="Placed Bids" value={stats.totalPlacedBids} />
              <Stat label="Wins" value={stats.totalWins} />
              <Stat label="Losses" value={stats.totalLosses} />
              <Stat label="Listed" value={activity?.stats?.totalListed || 0} />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {activity?.history?.placedBids?.length ? (
                activity.history.placedBids.map((item) => (
                  <div key={item._id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">Status: {item.status}</p>
                    </div>
                    <p className="font-bold text-bid-purple">${item.currentPrice}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No activity yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Reputation</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Feedback Score</span><span className="font-bold text-green-600">{stats.feedbackScore}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, stats.feedbackScore)}%` }}></div></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Reputation Tier</span><span className="font-bold text-gray-900">{reputationLevel}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Gavel size={16} className="text-bid-purple" /> Quick Snapshot</h3>
            <p className="text-sm text-gray-600 mb-2">Verified accounts can place bids and list auctions.</p>
            <p className="text-sm text-gray-600 mb-2">Email is immutable for account security.</p>
            <p className="text-sm text-gray-600">Update your location and social links to improve profile trust.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Globe size={16} className="text-indigo-500" /> Public Identity</h3>
            <p className="text-xs text-gray-500">Your activity and credibility grow with transparent, verified participation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon, label, value }) => (
  <div>
    <label className="text-xs text-gray-400 uppercase font-semibold">{label}</label>
    <p className="text-gray-900 font-medium capitalize flex items-center gap-2">{icon} {value}</p>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default Profile;
