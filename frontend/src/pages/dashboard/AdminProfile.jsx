import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosConfig';
import { Shield, Mail, Calendar, Activity, CheckCircle2 } from 'lucide-react';

const AdminProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const { data } = await axios.get('/admin/stats', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStats(data);
    };

    if (user?.token) loadStats();
  }, [user?.token]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white shadow-sm p-8 animate-fade-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Shield size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-sm text-gray-500">Control-center identity and platform responsibility summary</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Info label="Admin Name" value={user?.name || 'Super Admin'} icon={<Shield size={16} className="text-red-500" />} />
          <Info label="Admin Email" value={user?.email || 'Not set'} icon={<Mail size={16} className="text-red-500" />} />
          <Info label="Role" value={user?.role || 'admin'} icon={<CheckCircle2 size={16} className="text-red-500" />} />
          <Info label="Session Started" value={new Date().toLocaleString()} icon={<Calendar size={16} className="text-red-500" />} />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Activity size={18} className="text-red-500" /> Live Platform Snapshot
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat title="Users" value={stats?.totalUsers ?? '-'} />
          <Stat title="Auctions" value={stats?.totalAuctions ?? '-'} />
          <Stat title="Escrow Funds" value={stats ? `$${(stats.fundsInEscrow || 0).toLocaleString()}` : '-'} />
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{label}</p>
    <p className="font-semibold text-gray-900 flex items-center gap-2">{icon} {value}</p>
  </div>
);

const Stat = ({ title, value }) => (
  <div className="p-4 rounded-xl border border-gray-100 bg-white">
    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default AdminProfile;
