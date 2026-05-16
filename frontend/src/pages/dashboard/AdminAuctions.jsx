import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { AlertCircle, CalendarClock, CheckCircle, Eye, Search, Trash2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';
import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

const REGISTRATION_DAY_OPTIONS = [1, 5, 8, 10, 15, 20];

// Admin auctions page is the moderation workspace for approving, disapproving, or deleting listings.
const AdminAuctions = () => {
  const { user } = useSelector((state) => state.auth);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [registrationWindowDays, setRegistrationWindowDays] = useState('1');
  const [registrationTestMinutes, setRegistrationTestMinutes] = useState('');
  const [customEndAt, setCustomEndAt] = useState('');
  const [disapproveReason, setDisapproveReason] = useState('');

  const fetchAuctions = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/admin/auctions?limit=200', config);
      setAuctions(data.auctions || []);
    } catch (_err) {
      setError('Failed to load listings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchAuctions();
  }, [user?.token]);

  useEffect(() => {
    document.body.style.overflow = selectedAuction ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAuction]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auctions.filter((a) => {
      // Moderation filters are client-side for immediate repeated review after one fetch.
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesSearch =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.seller?.email?.toLowerCase().includes(q) ||
        a.seller?.name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [auctions, search, statusFilter]);

  const auctionMetrics = useMemo(() => {
    const pending = auctions.filter((item) => item.status === 'pending_verification').length;
    const disapproved = auctions.filter((item) => item.status === 'disapproved').length;
    const live = auctions.filter((item) => ['future', 'ongoing'].includes(item.status)).length;

    return {
      total: auctions.length,
      pending,
      disapproved,
      live,
      visible: filtered.length,
    };
  }, [auctions, filtered.length]);

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Delete this listing permanently?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/admin/auctions/${auctionId}`, config);
      setAuctions((prev) => prev.filter((a) => a._id !== auctionId));
      toast.success('Listing removed');
    } catch (_err) {
      toast.error('Failed to delete listing');
    }
  };

  const openDetails = async (auctionId) => {
    try {
      // Detailed auction data is loaded lazily into a modal for moderation decisions.
      const { data } = await axios.get(`/auctions/${auctionId}`);
      setSelectedAuction(data);
      const hours = Number(data.registrationWindowHours) || 24;
      // Very short test windows are stored as fractional hours, so convert them back to minutes for the form.
      const testMinutes = hours < 1 ? String(Math.round(hours * 60)) : '';
      const days = Math.round(hours / 24);
      setRegistrationWindowDays(String(REGISTRATION_DAY_OPTIONS.includes(days) ? days : 1));
      setRegistrationTestMinutes(testMinutes === '2' || testMinutes === '5' ? testMinutes : '');
      setCustomEndAt('');
      setDisapproveReason('');
    } catch (_error) {
      toast.error('Failed to load listing details');
    }
  };

  const handleApprove = async () => {
    if (!selectedAuction) return;
    try {
      // Admin can approve with either a relative window or a custom end-datetime override.
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        registrationWindowDays: registrationTestMinutes ? undefined : Number(registrationWindowDays),
        registrationWindowMinutes: registrationTestMinutes ? Number(registrationTestMinutes) : undefined,
        registrationEndAt: customEndAt || undefined,
      };
      const { data } = await axios.put(`/admin/auctions/${selectedAuction._id}/approve`, payload, config);
      setAuctions((prev) => prev.map((item) => (item._id === selectedAuction._id ? { ...item, ...data } : item)));
      setSelectedAuction((prev) => ({ ...prev, ...data }));
      toast.success('Listing approved and moved to upcoming auctions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleDisapprove = async () => {
    if (!selectedAuction) return;
    if (disapproveReason.trim().length < 5) {
      toast.error('Please provide a disapproval reason (min 5 chars).');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `/admin/auctions/${selectedAuction._id}/disapprove`,
        { reason: disapproveReason.trim() },
        config
      );
      setAuctions((prev) => prev.map((item) => (item._id === selectedAuction._id ? { ...item, ...data } : item)));
      setSelectedAuction((prev) => ({ ...prev, ...data }));
      toast.success('Listing disapproved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Disapproval failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 flex items-center justify-center gap-2">
        <AlertCircle size={20} /> {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Listing Verification Control</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Review listing quality, manage approval windows, and monitor auction launch readiness from one streamlined workspace.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total" value={auctionMetrics.total} tone="blue" />
            <MetricCard label="Pending" value={auctionMetrics.pending} tone="amber" />
            <MetricCard label="Live" value={auctionMetrics.live} tone="emerald" />
            <MetricCard label="Disapproved" value={auctionMetrics.disapproved} tone="red" />
            <MetricCard label="Visible" value={auctionMetrics.visible} tone="slate" />
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="premium-panel rounded-2xl overflow-hidden mb-6">
          <div className="border-b border-slate-200 bg-slate-50/80 p-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.7fr)_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, category, or seller"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="disapproved">Disapproved</option>
                <option value="future">Future</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={100}>
        <section className="premium-panel rounded-2xl overflow-hidden">
          <div className="grid gap-4 p-4 lg:hidden">
            {filtered.map((auction) => (
              <div key={auction._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <img
                    src={getAuctionImage(auction.images)}
                    alt={auction.title}
                    onError={handleAuctionImageError}
                    className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-2 font-bold text-slate-900">{auction.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{auction.category}</p>
                      </div>
                      <StatusBadge status={auction.status} />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-500">Seller:</span> {auction.seller?.name || 'Unknown'}</p>
                      <p><span className="font-medium text-slate-500">Email:</span> {auction.seller?.email || '-'}</p>
                      <p><span className="font-medium text-slate-500">Price:</span> <span className="font-semibold text-slate-900">${auction.currentPrice}</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <ActionButton onClick={() => openDetails(auction._id)} tone="soft">
                    <Eye size={16} /> Details
                  </ActionButton>
                  <ActionButton onClick={() => handleDeleteAuction(auction._id)} tone="danger">
                    <Trash2 size={16} /> Delete
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4">Listing</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((auction) => (
                  <tr key={auction._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAuctionImage(auction.images)}
                          alt={auction.title}
                          onError={handleAuctionImageError}
                          className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{auction.title}</div>
                          <div className="text-xs text-slate-400">{auction.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800">{auction.seller?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{auction.seller?.email || '-'}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-900">${auction.currentPrice}</td>
                    <td className="p-4">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex gap-2">
                        <ActionButton onClick={() => openDetails(auction._id)} tone="soft">
                          <Eye size={14} /> Details
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteAuction(auction._id)} tone="danger">
                          <Trash2 size={14} /> Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No listings matched the current search and status filter.
            </div>
          )}
        </section>
      </Reveal>

      {selectedAuction && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1000] bg-black/55 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto premium-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90">
              <h3 className="text-xl font-bold text-slate-900">Listing Details</h3>
              <button onClick={() => setSelectedAuction(null)} className="text-slate-500 hover:text-slate-900" type="button">Close</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <img
                    src={getAuctionImage(selectedAuction.images)}
                    alt={selectedAuction.title}
                    onError={handleAuctionImageError}
                    className="w-full h-64 object-cover rounded-xl border border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-slate-900">{selectedAuction.title}</p>
                  <p className="text-sm text-slate-600">{selectedAuction.description}</p>
                  <p className="text-sm text-slate-700"><b>Category:</b> {selectedAuction.category}</p>
                  <p className="text-sm text-slate-700"><b>Seller:</b> {selectedAuction.seller?.name} ({selectedAuction.seller?.email})</p>
                  <p className="text-sm text-slate-700"><b>Starting Price:</b> ${selectedAuction.startingPrice}</p>
                  <p className="text-sm text-slate-700"><b>Status:</b> {selectedAuction.status}</p>
                  {selectedAuction.verificationNote ? (
                    <p className="text-sm text-red-700"><b>Verification Note:</b> {selectedAuction.verificationNote}</p>
                  ) : null}
                </div>
              </div>

              {(selectedAuction.status === 'pending_verification' || selectedAuction.status === 'disapproved') && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-800 inline-flex items-center gap-2">
                    <CalendarClock size={14} /> Registration Setup (for Approval)
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <select
                      value={registrationTestMinutes ? `test-${registrationTestMinutes}` : registrationWindowDays}
                      onChange={(e) => {
                        if (e.target.value === 'test-2' || e.target.value === 'test-5') {
                          setRegistrationTestMinutes(e.target.value === 'test-2' ? '2' : '5');
                          return;
                        }
                        setRegistrationTestMinutes('');
                        setRegistrationWindowDays(e.target.value);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="test-2">2 minutes (test mode)</option>
                      <option value="test-5">5 minutes (test mode)</option>
                      {REGISTRATION_DAY_OPTIONS.map((days) => (
                        <option key={days} value={days}>{days} day{days > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={customEndAt}
                      onChange={(e) => setCustomEndAt(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Optional custom end time"
                    />
                  </div>
                  <p className="text-xs text-slate-500">If custom end time is set, it overrides the selected day count.</p>
                  <button onClick={handleApprove} className="btn-premium inline-flex items-center gap-2 px-4 py-2 text-sm" type="button">
                    <CheckCircle size={16} /> Approve
                  </button>
                </div>
              )}

              {(selectedAuction.status === 'pending_verification' || selectedAuction.status === 'disapproved') && (
                <div className="rounded-xl border border-red-200 p-4 space-y-3 bg-red-50">
                  <p className="text-sm font-semibold text-red-800">Disapprove Listing</p>
                  <textarea
                    value={disapproveReason}
                    onChange={(e) => setDisapproveReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-red-200 px-3 py-2"
                    placeholder="Reason for disapproval (required)"
                  />
                  <button onClick={handleDisapprove} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700" type="button">
                    <XCircle size={16} /> Disapprove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MetricCard = ({ label, value, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">
        <AnimatedNumber value={value || 0} className="inline" />
      </p>
    </motion.div>
  );
};

const ActionButton = ({ children, onClick, tone = 'soft' }) => {
  const toneClassMap = {
    soft: 'btn-soft text-slate-700',
    danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition ${toneClassMap[tone] || toneClassMap.soft}`}
      type="button"
    >
      {children}
    </motion.button>
  );
};

const StatusBadge = ({ status }) => {
  const styleMap = {
    pending_verification: 'bg-amber-100 text-amber-700',
    disapproved: 'bg-red-100 text-red-700',
    future: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-indigo-100 text-indigo-700',
    closed: 'bg-slate-800 text-white',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styleMap[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
};

export default AdminAuctions;
