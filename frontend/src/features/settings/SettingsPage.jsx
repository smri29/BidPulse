import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DownloadCloud, Save, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';
import { deleteAccount, updateProfile } from '../../redux/authSlice';
import Reveal from '../../components/ui/Reveal';
import { SETTINGS_TABS } from './settingsTabs';

const Toggle = ({ label, desc, defaultChecked = true }) => (
  <motion.div whileHover={{ x: 2 }} className="flex items-start justify-between border-b border-gray-50 py-3 last:border-0">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
    <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 rounded border-gray-300 text-bid-purple" />
  </motion.div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handlePasswordChange = (event) => setPasswords({ ...passwords, [event.target.name]: event.target.value });
  const handleSavePassword = (event) => {
    event.preventDefault();
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
      .catch((error) => toast.error(error));
  };
  const handleExportData = async () => {
    try {
      const response = await axios.get('/auth/export-data', { headers: { Authorization: `Bearer ${user.token}` }, responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `AuctionPulse-data-${user._id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Your data export is downloading.');
    } catch {
      toast.error('Failed to export your data');
    }
  };
  const handleDeleteAccount = () => {
    if (window.confirm('ARE YOU SURE? This action cannot be undone. Download your data first if needed.')) {
      dispatch(deleteAccount()).unwrap().then(() => { toast.success('Account deleted. We are sorry to see you go.'); navigate('/'); }).catch((error) => toast.error(error || 'Failed to delete account'));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal><h1 className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-900"><Shield className="text-bid-purple" /> Account Settings</h1></Reveal>
      <div className="flex flex-col gap-8 md:flex-row">
        <Reveal className="w-full flex-shrink-0 md:w-64">
          <div className="premium-panel overflow-hidden rounded-xl">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <motion.button key={tab.id} whileHover={{ x: 2 }} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-3 px-6 py-4 text-left text-sm font-medium transition ${active ? tab.id === 'danger' ? 'border-l-4 border-red-500 bg-red-50 text-red-600' : 'border-l-4 border-bid-purple bg-blue-50 text-bid-purple' : 'text-gray-600 hover:bg-gray-50'}`} type="button">
                  <Icon size={18} /> {tab.label}
                </motion.button>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={80} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {activeTab === 'security' && (
                <div className="premium-panel rounded-xl p-8">
                  <h2 className="mb-6 text-lg font-bold text-gray-900">Change Password</h2>
                  <form className="space-y-6" onSubmit={handleSavePassword}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div><label className="mb-1 block text-sm font-medium text-gray-700">New Password</label><input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full rounded-lg border border-gray-300 p-2" required minLength={6} /></div>
                      <div><label className="mb-1 block text-sm font-medium text-gray-700">Confirm New Password</label><input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className="w-full rounded-lg border border-gray-300 p-2" required /></div>
                    </div>
                    <div className="pt-4"><button type="submit" className="btn-premium flex items-center gap-2 px-5 py-2 text-sm"><Save size={16} /> Update Password</button></div>
                  </form>
                </div>
              )}
              {activeTab === 'notifications' && (
                <div className="premium-panel rounded-xl p-8">
                  <h2 className="mb-6 text-lg font-bold text-gray-900">Email Preferences</h2>
                  <div className="space-y-4">
                    <Toggle label="Auction Outbid Alerts" desc="Get notified immediately when someone outbids you." />
                    <Toggle label="Auction Won" desc="Receive an email when you win an item." />
                    <Toggle label="Payment Receipts" desc="Get a copy of payment receipts via email." />
                    <Toggle label="Marketing Emails" desc="Receive news and special offers." defaultChecked={false} />
                  </div>
                </div>
              )}
              {activeTab === 'danger' && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-8">
                  <h2 className="mb-2 text-lg font-bold text-red-700">Delete Account</h2>
                  <p className="mb-6 text-sm text-red-600">Before deleting your account, export your complete data archive as ZIP.</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleExportData} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2 font-medium text-red-700 transition hover:bg-red-100" type="button"><DownloadCloud size={16} /> Download My Data (ZIP)</button>
                    <button onClick={handleDeleteAccount} className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700" type="button">Permanently Delete Account</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
};

export default SettingsPage;
