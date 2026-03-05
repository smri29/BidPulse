import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosConfig';
import { Shield, Mail, Calendar, Activity, CheckCircle2, History, Package } from 'lucide-react';

const AdminProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [statsRes, auctionsRes] = await Promise.all([
        axios.get('/admin/stats', config),
        axios.get('/admin/auctions?limit=12', config),
      ]);
      setStats(statsRes.data);
      setAuctions(auctionsRes.data.auctions || []);
    };

    if (user?.token) loadData();
  }, [user?.token]);

  const historyItems = useMemo(() => {
    const tx = (stats?.recentTransactions || []).map((item) => ({
      id: `tx-${item._id}`,
      type: 'Closed sale',
      title: item.title,
      meta: `$${item.currentPrice}`,
      at: item.createdAt,
    }));

    const list = auctions.slice(0, 6).map((item) => ({
      id: `list-${item._id}`,
      type: 'Listing event',
      title: item.title,
      meta: item.status,
      at: item.createdAt,
    }));

    return [...tx, ...list].sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [stats?.recentTransactions, auctions]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white px-8 py-7">
          <h1 className="text-2xl font-bold">Admin Profile & Platform History</h1>
          <p className="text-sm text-white/80 mt-1">Full admin identity panel with recent control-center timeline.</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Info label="Admin Name" value={user?.name || 'Super Admin'} icon={<Shield size={16} className="text-indigo-600" />} />
            <Info label="Admin Email" value={user?.email || 'Not set'} icon={<Mail size={16} className="text-indigo-600" />} />
            <Info label="Role" value={user?.role || 'admin'} icon={<CheckCircle2 size={16} className="text-indigo-600" />} />
            <Info label="Session Started" value={new Date().toLocaleString()} icon={<Calendar size={16} className="text-indigo-600" />} />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Activity size={18} className="text-indigo-600" /> Current Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
            <Stat title="Users" value={stats?.totalUsers ?? '-'} />
            <Stat title="Listings" value={stats?.totalAuctions ?? '-'} />
            <Stat title="In Delivery" value={stats ? `$${(stats.fundsInEscrow || 0).toLocaleString()}` : '-'} />
            <Stat title="Revenue" value={stats ? `$${(stats.totalCommission || 0).toLocaleString()}` : '-'} />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <History size={18} className="text-indigo-600" /> Platform History
          </h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {historyItems.length ? (
              <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
                {historyItems.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3 bg-white hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                        <Package size={14} className="text-indigo-600" /> {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 uppercase">{item.meta}</p>
                      <p className="text-xs text-gray-500">{new Date(item.at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-sm text-gray-500">No history entries yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{label}</p>
    <p className="font-semibold text-gray-900 flex items-center gap-2">{icon} {value}</p>
  </div>
);

const Stat = ({ title, value }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-white">
    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default AdminProfile;
