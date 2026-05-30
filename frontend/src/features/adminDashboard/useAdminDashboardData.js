/**
 * Module: features/adminDashboard/useAdminDashboardData.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Admin Dashboard Data flow.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import axios from '../../utils/axiosConfig';

export const useAdminDashboardData = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) return;

    let mounted = true;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchData = async ({ initial = false } = {}) => {
      if (initial) setLoading(true);
      try {
        const [statsRes, auctionsRes] = await Promise.all([
          axios.get('/admin/stats', config),
          axios.get('/admin/auctions?limit=200', config),
        ]);

        if (!mounted) return;
        setStats(statsRes.data);
        setAuctions(auctionsRes.data.auctions || []);
        setError(null);
      } catch {
        if (!mounted) return;
        setError('Failed to connect to server. Please check backend connectivity and your admin session.');
      } finally {
        if (mounted && initial) setLoading(false);
      }
    };

    fetchData({ initial: true });
    const intervalId = window.setInterval(() => fetchData({ initial: false }), 45000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [user?.token]);

  const statusDistribution = useMemo(() => {
    const map = {};
    auctions.forEach((auction) => {
      map[auction.status] = (map[auction.status] || 0) + 1;
    });

    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8);
  }, [auctions]);

  const commissionTrend = useMemo(() => {
    const transactions = stats?.recentTransactions || [];
    const latest = [...transactions].reverse();
    return latest.map((item, index) => ({
      x: index + 1,
      y: Number((item.currentPrice * 0.05).toFixed(2)),
      label: item.title,
    }));
  }, [stats?.recentTransactions]);

  return {
    stats,
    loading,
    error,
    statusDistribution,
    commissionTrend,
  };
};
