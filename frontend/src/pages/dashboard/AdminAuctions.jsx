import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { AlertCircle, Search, Trash2, Gavel } from 'lucide-react';

const AdminAuctions = () => {
  const { user } = useSelector((state) => state.auth);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAuctions = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/admin/auctions?limit=200', config);
      setAuctions(data.auctions || []);
    } catch (err) {
      setError('Failed to load auctions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchAuctions();
  }, [user?.token]);

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
    if (!window.confirm('Delete this auction permanently?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/admin/auctions/${auctionId}`, config);
      setAuctions((prev) => prev.filter((a) => a._id !== auctionId));
      toast.success('Auction removed');
    } catch (err) {
      toast.error('Failed to delete auction');
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
      <div className="flex items-center gap-3 mb-6">
        <Gavel className="text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Auction Control</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, seller..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paid_held_in_escrow">Paid Held in Escrow</option>
          <option value="closed">Closed</option>
          <option value="unsold">Unsold</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4">Auction</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
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
                    <button
                      onClick={() => handleDeleteAuction(auction._id)}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuctions;
