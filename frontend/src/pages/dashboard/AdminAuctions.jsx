import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { AlertCircle, Search, Trash2, CheckCircle, XCircle, Eye, CalendarClock } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';

const REGISTRATION_DAY_OPTIONS = [1, 5, 8, 10, 15, 20];

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
    if (selectedAuction) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAuction]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auctions.filter((a) => {
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
      const { data } = await axios.get(`/auctions/${auctionId}`);
      setSelectedAuction(data);
      const hours = Number(data.registrationWindowHours) || 24;
      const days = Math.round(hours / 24);
      setRegistrationWindowDays(String(REGISTRATION_DAY_OPTIONS.includes(days) ? days : 1));
      setRegistrationTestMinutes(hours < 1 ? '5' : '');
      setCustomEndAt('');
      setDisapproveReason('');
    } catch (_error) {
      toast.error('Failed to load listing details');
    }
  };

  const handleApprove = async () => {
    if (!selectedAuction) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        registrationWindowDays: registrationTestMinutes ? undefined : Number(registrationWindowDays),
        registrationWindowMinutes: registrationTestMinutes ? Number(registrationTestMinutes) : undefined,
        registrationEndAt: customEndAt || undefined,
      };
      const { data } = await axios.put(`/admin/auctions/${selectedAuction._id}/approve`, payload, config);
      setAuctions((prev) => prev.map((item) => (item._id === selectedAuction._id ? { ...item, ...data } : item)));
      setSelectedAuction((prev) => ({ ...prev, ...data }));
      toast.success('Listing approved and moved to Future Bids');
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listing Verification Control</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, seller..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4">Listing</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((auction) => (
                <tr key={auction._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{auction.title}</div>
                    <div className="text-xs text-gray-400">{auction.category}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-800">{auction.seller?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{auction.seller?.email || '-'}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">${auction.currentPrice}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold">
                      {auction.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openDetails(auction._id)}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition"
                      >
                        <Eye size={14} /> Details
                      </button>
                      <button
                        onClick={() => handleDeleteAuction(auction._id)}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAuction && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1000] bg-black/55 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Listing Details</h3>
              <button onClick={() => setSelectedAuction(null)} className="text-gray-500 hover:text-gray-900">Close</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={getAuctionImage(selectedAuction.images)}
                    alt={selectedAuction.title}
                    onError={handleAuctionImageError}
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">{selectedAuction.title}</p>
                  <p className="text-sm text-gray-600">{selectedAuction.description}</p>
                  <p className="text-sm text-gray-700"><b>Category:</b> {selectedAuction.category}</p>
                  <p className="text-sm text-gray-700"><b>Seller:</b> {selectedAuction.seller?.name} ({selectedAuction.seller?.email})</p>
                  <p className="text-sm text-gray-700"><b>Starting Price:</b> ${selectedAuction.startingPrice}</p>
                  <p className="text-sm text-gray-700"><b>Status:</b> {selectedAuction.status}</p>
                  {selectedAuction.verificationNote ? (
                    <p className="text-sm text-red-700"><b>Verification Note:</b> {selectedAuction.verificationNote}</p>
                  ) : null}
                </div>
              </div>

              {(selectedAuction.status === 'pending_verification' || selectedAuction.status === 'disapproved') && (
                <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800 inline-flex items-center gap-2">
                    <CalendarClock size={14} /> Registration Setup (for Approval)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={registrationTestMinutes ? 'test' : registrationWindowDays}
                      onChange={(e) => {
                        if (e.target.value === 'test') {
                          setRegistrationTestMinutes('5');
                          return;
                        }
                        setRegistrationTestMinutes('');
                        setRegistrationWindowDays(e.target.value);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="test">5 minutes (test mode)</option>
                      {REGISTRATION_DAY_OPTIONS.map((days) => (
                        <option key={days} value={days}>{days} day{days > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={customEndAt}
                      onChange={(e) => setCustomEndAt(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Optional custom end time"
                    />
                  </div>
                  <p className="text-xs text-gray-500">If custom end time is set, it overrides the selected day count.</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  </div>
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
                  <button
                    onClick={handleDisapprove}
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
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

export default AdminAuctions;
