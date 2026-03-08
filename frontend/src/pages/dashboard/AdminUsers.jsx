import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Ban,
  CalendarClock,
  CheckCircle,
  DollarSign,
  Eye,
  Mail,
  Package,
  ShoppingBag,
  Shield,
  Trash2,
  Unlock,
  User,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [selectedUserReport, setSelectedUserReport] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/admin/users', config);
      setUsers(data.users || []);
      setLoading(false);
    } catch (_error) {
      setError('Failed to load users. Please check backend connectivity.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user?.token]);

  useEffect(() => {
    const shouldLockScroll = Boolean(selectedUserReport || isReportLoading);
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUserReport, isReportLoading]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, search]);

  const userMetrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter((item) => item.role === 'admin').length;
    const banned = users.filter((item) => item.isBanned).length;
    const active = total - banned;

    return {
      total,
      admins,
      banned,
      active,
      filtered: filteredUsers.length,
    };
  }, [filteredUsers.length, users]);

  const handleViewHistory = async (userId) => {
    setIsReportLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/admin/users/${userId}/history`, config);
      setSelectedUserReport(data);
    } catch (_err) {
      toast.error('Failed to fetch user history');
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/admin/users/ban/${userId}`, {}, config);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBanned: !u.isBanned } : u)));
      toast.info('User status updated');
    } catch (_error) {
      toast.error('Failed to update ban status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/admin/users/${userId}`, config);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User removed successfully');
    } catch (_error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-bid-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 flex flex-col items-center gap-2">
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
                <Users className="text-bid-purple" /> User Management
              </h1>
              <p className="mt-1 text-sm text-slate-600">Monitor account health, investigate user activity, and enforce platform policy.</p>
            </div>
            <div className="w-full lg:w-80">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                placeholder="Search user name or email"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total Users" value={userMetrics.total} icon={<User size={15} />} tone="blue" />
            <MetricCard label="Active" value={userMetrics.active} icon={<CheckCircle size={15} />} tone="emerald" />
            <MetricCard label="Banned" value={userMetrics.banned} icon={<Ban size={15} />} tone="amber" />
            <MetricCard label="Admins" value={userMetrics.admins} icon={<Shield size={15} />} tone="purple" />
            <MetricCard label="Visible" value={userMetrics.filtered} icon={<Eye size={15} />} tone="slate" />
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="premium-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className={`${u.isBanned ? 'bg-red-50/60' : 'hover:bg-slate-50/70'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900 text-base">{u.name}</div>
                        {u.isBanned && (
                          <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">BANNED</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">ID: {u._id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {u.email}</div>
                    </td>
                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs"><Ban size={14} /> Suspended</span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle size={14} /> Active</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {u.role !== 'admin' ? (
                        <div className="flex justify-center gap-2">
                          <motion.button whileHover={{ y: -1 }} onClick={() => handleViewHistory(u._id)} className="btn-soft p-2 text-blue-700" title="View Activity Log" type="button">
                            <Eye size={18} />
                          </motion.button>
                          <motion.button whileHover={{ y: -1 }} onClick={() => handleBanUser(u._id)} className={`p-2 rounded-lg transition text-white ${u.isBanned ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`} title={u.isBanned ? 'Unban' : 'Ban'} type="button">
                            {u.isBanned ? <Unlock size={18} /> : <Ban size={18} />}
                          </motion.button>
                          <motion.button whileHover={{ y: -1 }} onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition" title="Delete" type="button">
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 select-none">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {selectedUserReport && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto premium-panel rounded-2xl overflow-hidden">
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedUserReport.profile.name} - Activity Report</h2>
                <p className="text-sm text-slate-500">{selectedUserReport.profile.email}</p>
              </div>
              <button onClick={() => setSelectedUserReport(null)} className="p-2 hover:bg-slate-100 rounded-full" type="button">
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <MetricCard title="Total Earned" value={selectedUserReport.stats.totalEarned} icon={<DollarSign size={16} />} tone="emerald" prefix="$" />
                <MetricCard title="Total Spent" value={selectedUserReport.stats.totalSpent} icon={<ShoppingBag size={16} />} tone="blue" prefix="$" />
                <MetricCard title="Items Listed" value={selectedUserReport.stats.itemsListed} icon={<Package size={16} />} tone="purple" />
                <MetricCard title="Items Won" value={selectedUserReport.stats.itemsWon} icon={<CalendarClock size={16} />} tone="amber" />
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <h3 className="font-bold text-slate-900 mb-3">Profile Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-900">{selectedUserReport.profile.name}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{selectedUserReport.profile.email}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="font-medium text-slate-900">{selectedUserReport.profile.role}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Joined</dt><dd className="font-medium text-slate-900">{new Date(selectedUserReport.profile.createdAt).toLocaleDateString()}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Location</dt><dd className="font-medium text-slate-900">{selectedUserReport.profile.location || 'N/A'}</dd></div>
                  </dl>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <HistoryPanel
                    title="Selling History"
                    tone="green"
                    items={selectedUserReport.history.sales}
                    empty="No selling history"
                    dateField="createdAt"
                  />
                  <HistoryPanel
                    title="Purchase History"
                    tone="blue"
                    items={selectedUserReport.history.purchases}
                    empty="No purchase history"
                    dateField="registrationEndAt"
                  />
                </div>
              </section>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isReportLoading && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/35">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-bid-purple" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon, tone, prefix = '', label }) => {
  const cardLabel = title || label;
  const tones = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`p-4 rounded-xl border ${tones[tone] || tones.slate}`}>
      <p className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {cardLabel}
      </p>
      <p className="text-2xl font-bold text-slate-900 mt-1">
        {prefix}
        <AnimatedNumber value={value || 0} className="inline" />
      </p>
    </motion.div>
  );
};

const HistoryPanel = ({ title, tone, items, empty, dateField }) => {
  const toneClasses = tone === 'green' ? 'text-emerald-700' : 'text-blue-700';

  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <h3 className={`font-bold mb-3 ${toneClasses}`}>{title}</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {items.length ? (
          items.map((item) => (
            <motion.div key={item._id} whileHover={{ x: 2 }} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 uppercase mt-1">{item.status.replaceAll('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">${item.currentPrice}</p>
                  <p className="text-[11px] text-slate-500">{new Date(item[dateField] || item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-slate-400 italic">{empty}</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
