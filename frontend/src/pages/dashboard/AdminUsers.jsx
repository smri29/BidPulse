import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import {
  Trash2,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  Ban,
  Unlock,
  Eye,
  X,
  DollarSign,
  ShoppingBag,
  Package,
  CalendarClock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

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
      setError('Failed to load users. Please check the backend connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    const shouldLockScroll = Boolean(selectedUserReport || isReportLoading);
    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUserReport, isReportLoading]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, search]);

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bid-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="text-bid-purple" /> User Management
        </h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Search user name or email"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className={`${u.isBanned ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-gray-900 text-base">{u.name}</div>
                      {u.isBanned && (
                        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">BANNED</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">ID: {u._id}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {u.email}</div>
                  </td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="flex items-center gap-1 text-red-600 font-bold text-xs"><Ban size={14} /> Suspended</span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle size={14} /> Active</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {u.role !== 'admin' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleViewHistory(u._id)} className="bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition" title="View Activity Log">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleBanUser(u._id)} className={`p-2 rounded-lg transition text-white ${u.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-400 hover:bg-orange-500'}`} title={u.isBanned ? 'Unban' : 'Ban'}>
                          {u.isBanned ? <Unlock size={18} /> : <Ban size={18} />}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition border border-red-200" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 select-none">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUserReport && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedUserReport.profile.name} - Activity Report</h2>
                <p className="text-sm text-gray-500">{selectedUserReport.profile.email}</p>
              </div>
              <button onClick={() => setSelectedUserReport(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Earned" value={`$${selectedUserReport.stats.totalEarned.toLocaleString()}`} icon={<DollarSign size={16} className="text-emerald-600" />} tone="emerald" />
                <MetricCard title="Total Spent" value={`$${selectedUserReport.stats.totalSpent.toLocaleString()}`} icon={<ShoppingBag size={16} className="text-blue-600" />} tone="blue" />
                <MetricCard title="Items Listed" value={selectedUserReport.stats.itemsListed} icon={<Package size={16} className="text-purple-600" />} tone="purple" />
                <MetricCard title="Items Won" value={selectedUserReport.stats.itemsWon} icon={<CalendarClock size={16} className="text-amber-600" />} tone="amber" />
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-3">Profile Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{selectedUserReport.profile.name}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900">{selectedUserReport.profile.email}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="font-medium text-gray-900">{selectedUserReport.profile.role}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Joined</dt><dd className="font-medium text-gray-900">{new Date(selectedUserReport.profile.createdAt).toLocaleDateString()}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Location</dt><dd className="font-medium text-gray-900">{selectedUserReport.profile.location || 'N/A'}</dd></div>
                  </dl>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bid-purple" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon, tone }) => {
  const tones = {
    emerald: 'bg-emerald-50 border-emerald-100',
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100',
  };

  return (
    <div className={`p-4 rounded-xl border ${tones[tone] || 'bg-gray-50 border-gray-100'}`}>
      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">{icon}{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

const HistoryPanel = ({ title, tone, items, empty, dateField }) => {
  const toneClasses = tone === 'green' ? 'text-green-700' : 'text-blue-700';

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <h3 className={`font-bold mb-3 ${toneClasses}`}>{title}</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {items.length ? (
          items.map((item) => (
            <div key={item._id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">{item.status.replaceAll('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">${item.currentPrice}</p>
                  <p className="text-[11px] text-gray-500">{new Date(item[dateField] || item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">{empty}</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
