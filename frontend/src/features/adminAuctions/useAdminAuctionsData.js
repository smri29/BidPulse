import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';
import { REGISTRATION_DAY_OPTIONS } from './constants';

export const useAdminAuctionsData = () => {
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
    } catch {
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
    const query = search.trim().toLowerCase();
    return auctions.filter((auction) => {
      const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
      const matchesSearch =
        !query ||
        auction.title?.toLowerCase().includes(query) ||
        auction.category?.toLowerCase().includes(query) ||
        auction.seller?.email?.toLowerCase().includes(query) ||
        auction.seller?.name?.toLowerCase().includes(query);
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
      setAuctions((prev) => prev.filter((item) => item._id !== auctionId));
      toast.success('Listing removed');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const openDetails = async (auctionId) => {
    try {
      const { data } = await axios.get(`/auctions/${auctionId}`);
      setSelectedAuction(data);
      const hours = Number(data.registrationWindowHours) || 24;
      const testMinutes = hours < 1 ? String(Math.round(hours * 60)) : '';
      const days = Math.round(hours / 24);
      setRegistrationWindowDays(String(REGISTRATION_DAY_OPTIONS.includes(days) ? days : 1));
      setRegistrationTestMinutes(testMinutes === '2' || testMinutes === '5' ? testMinutes : '');
      setCustomEndAt('');
      setDisapproveReason('');
    } catch {
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
      toast.success('Listing approved and moved to upcoming auctions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Disapproval failed');
    }
  };

  return {
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered,
    auctionMetrics,
    selectedAuction,
    setSelectedAuction,
    registrationWindowDays,
    setRegistrationWindowDays,
    registrationTestMinutes,
    setRegistrationTestMinutes,
    customEndAt,
    setCustomEndAt,
    disapproveReason,
    setDisapproveReason,
    handleDeleteAuction,
    openDetails,
    handleApprove,
    handleDisapprove,
  };
};
