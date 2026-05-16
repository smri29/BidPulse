import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  DollarSign,
  Briefcase,
  Activity,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

// Admin dashboard summarizes the platform through metrics, recent transactions, and listing-state distribution.
const AdminDashboard = () => {
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
      } catch (_err) {
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
    auctions.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });

    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [auctions]);

  const commissionTrend = useMemo(() => {
    const tx = stats?.recentTransactions || [];
    const latest = [...tx].reverse();
    return latest.map((item, index) => ({
      x: index + 1,
      y: Number((item.currentPrice * 0.05).toFixed(2)),
      label: item.title,
    }));
  }, [stats?.recentTransactions]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-bid-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-red-600">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="font-bold text-lg">Dashboard Error</h3>
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-10 text-center text-slate-500">No admin data available.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <section className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        </section>
      </Reveal>

      <Reveal delay={50}>
        <section className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers || 0} color="blue" />
          <StatCard icon={<Briefcase />} label="Total Listings" value={stats.totalAuctions || 0} color="purple" />
          <StatCard icon={<Activity />} label="Paid, In Delivery" value={stats.fundsInEscrow || 0} prefix="$" color="orange" />
          <StatCard icon={<DollarSign />} label="Net Revenue (5%)" value={stats.totalCommission || 0} prefix="$" color="green" />
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="grid grid-cols-1 gap-6 mb-8 xl:grid-cols-3">
          <div className="premium-panel rounded-2xl p-6 xl:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <TrendingUp size={20} className="text-slate-500" /> Commission Trend (Recent)
            </h2>
            <LineChart points={commissionTrend} />
          </div>

          <div className="premium-panel rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 size={20} className="text-slate-500" /> Listing Status Mix
            </h2>
            <StatusBars items={statusDistribution} />
          </div>
        </section>
      </Reveal>

      <Reveal delay={110}>
        <section className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
          <div className="premium-panel rounded-2xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <TrendingUp size={20} className="text-slate-500" /> Recent Transactions
            </h2>
            <div className="space-y-4">
              {stats.recentTransactions?.length ? (
                stats.recentTransactions.map((deal, index) => (
                  <motion.div
                    key={deal._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{deal.title}</p>
                      <p className="mt-1 text-xs text-slate-500">Closed {new Date(deal.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">+${(deal.currentPrice * 0.05).toFixed(2)}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Commission</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">No completed transactions yet.</p>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-lg">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-red-600 opacity-20 blur-xl" />
            <h2 className="mb-8 flex items-center gap-2 text-lg font-semibold">
              <Activity size={20} className="text-red-500" /> Platform Liquidity
            </h2>
            <div className="relative z-10 space-y-8">
              <div>
                <div className="mb-1 flex justify-between text-sm text-slate-400">Total Volume Processed</div>
                <div className="text-4xl font-bold tracking-tight">
                  $<AnimatedNumber value={stats.totalVolume || 0} className="inline" />
                </div>
              </div>
              <div className="border-t border-slate-700 pt-6">
                <div className="mb-1 flex justify-between text-sm text-slate-400">Total Payouts to Sellers</div>
                <div className="text-2xl font-bold text-slate-200">
                  $<AnimatedNumber value={stats.totalPayouts || 0} className="inline" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={140}>
        <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickControl title="Manage Users" to="/admin/users" />
          <QuickControl title="Manage Listings" to="/admin/auctions" />
          <QuickControl title="Support Desk" to="/admin/support" />
        </section>
      </Reveal>
    </div>
  );
};

const QuickControl = ({ title, to }) => (
  <motion.div whileHover={{ y: -2 }}>
    <Link to={to} className="premium-panel flex items-center justify-between rounded-xl p-4 transition">
      <span className="font-semibold text-slate-900">{title}</span>
      <ArrowRight size={16} className="text-slate-400" />
    </Link>
  </motion.div>
);

const StatCard = ({ icon, label, value, color, prefix = '' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    green: 'bg-green-50 text-green-600 ring-green-100',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="premium-panel flex items-center gap-4 rounded-xl p-6">
      <div className={`rounded-xl p-4 ring-1 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {prefix}
          <AnimatedNumber value={value || 0} className="inline" />
        </p>
      </div>
    </motion.div>
  );
};

const LineChart = ({ points }) => {
  if (!points.length) {
    return <div className="text-sm text-slate-500">Not enough transaction data for trend chart.</div>;
  }

  const width = 600;
  const height = 220;
  const pad = 24;
  const maxY = Math.max(...points.map((p) => p.y), 1);

  const mapped = points.map((p, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(points.length - 1, 1);
    const y = height - pad - (p.y / maxY) * (height - pad * 2);
    return { ...p, x, y };
  });

  const path = mapped.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[520px]">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" rx="12" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" />
        {mapped.map((p) => (
          <g key={p.x}>
            <circle cx={p.x} cy={p.y} r="4" fill="#1d4ed8" />
          </g>
        ))}
      </svg>
    </div>
  );
};

const StatusBars = ({ items }) => {
  if (!items.length) {
    return <div className="text-sm text-slate-500">No listing data.</div>;
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.status}>
          <div className="mb-1 flex justify-between text-xs text-slate-600">
            <span className="uppercase">{item.status.replaceAll('_', ' ')}</span>
            <span>{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-2 bg-gradient-to-r from-cyan-500 to-blue-600"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
