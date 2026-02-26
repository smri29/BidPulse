import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, Trash2, Shield, Save, DownloadCloud } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { updateProfile, deleteAccount } from '../redux/authSlice';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    dispatch(updateProfile({ password: passwords.newPassword }))
      .unwrap()
      .then(() => {
        toast.success('Password updated successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch((err) => toast.error(err));
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get('/auth/export-data', {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob',
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `bidpulse-data-${user._id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success('Your data export is downloading.');
    } catch (error) {
      toast.error('Failed to export your data');
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm('ARE YOU SURE? This action cannot be undone. Download your data first if needed.')
    ) {
      dispatch(deleteAccount())
        .unwrap()
        .then(() => {
          toast.success('Account deleted. We are sorry to see you go.');
          navigate('/');
        })
        .catch((err) => toast.error(err || 'Failed to delete account'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Shield className="text-bid-purple" /> Account Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setActiveTab('security')} className={`w-full text-left px-6 py-4 text-sm font-medium flex items-center gap-3 transition ${activeTab === 'security' ? 'bg-purple-50 text-bid-purple border-l-4 border-bid-purple' : 'text-gray-600 hover:bg-gray-50'}`}><Lock size={18} /> Login & Security</button>
            <button onClick={() => setActiveTab('notifications')} className={`w-full text-left px-6 py-4 text-sm font-medium flex items-center gap-3 transition ${activeTab === 'notifications' ? 'bg-purple-50 text-bid-purple border-l-4 border-bid-purple' : 'text-gray-600 hover:bg-gray-50'}`}><Bell size={18} /> Notifications</button>
            <button onClick={() => setActiveTab('danger')} className={`w-full text-left px-6 py-4 text-sm font-medium flex items-center gap-3 transition ${activeTab === 'danger' ? 'bg-red-50 text-red-600 border-l-4 border-red-500' : 'text-gray-600 hover:bg-gray-50'}`}><Trash2 size={18} /> Delete Account</button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>
              <form className="space-y-6" onSubmit={handleSavePassword}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full rounded-lg border-gray-300 shadow-sm p-2 border" required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className="w-full rounded-lg border-gray-300 shadow-sm p-2 border" required />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="flex items-center gap-2 bg-bid-purple text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"><Save size={18} /> Update Password</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Email Preferences</h2>
              <div className="space-y-4">
                <Toggle label="Auction Outbid Alerts" desc="Get notified immediately when someone outbids you." />
                <Toggle label="Auction Won" desc="Receive an email when you win an item." />
                <Toggle label="Payment Receipts" desc="Get a copy of payment receipts via email." />
                <Toggle label="Marketing Emails" desc="Receive news and special offers." defaultChecked={false} />
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="bg-red-50 rounded-xl border border-red-100 p-8">
              <h2 className="text-lg font-bold text-red-700 mb-2">Delete Account</h2>
              <p className="text-red-600 text-sm mb-6">Before deleting your account, export your complete data archive as ZIP.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExportData} className="bg-white border border-red-200 text-red-700 px-5 py-2 rounded-lg hover:bg-red-100 transition font-medium inline-flex items-center gap-2"><DownloadCloud size={16} /> Download My Data (ZIP)</button>
                <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition font-medium">Permanently Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, desc, defaultChecked = true }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
    <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 text-bid-purple rounded border-gray-300" />
  </div>
);

export default Settings;
