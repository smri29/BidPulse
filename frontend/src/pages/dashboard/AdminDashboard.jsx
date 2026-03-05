import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  DollarSign,
  Briefcase,
  Activity,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [statsRes, auctionsRes] = await Promise.all([
          axios.get('/admin/stats', config),
          axios.get('/admin/auctions?limit=200', config),
        ]);
        setStats(statsRes.data);
        setAuctions(auctionsRes.data.auctions || []);
      } catch (_err) {
        setError('Failed to connect to the server. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-red-600">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="font-bold text-lg">Dashboard Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) return <div className="p-10 text-center">No data available.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-100 rounded-xl shadow-sm border border-red-200">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm">System overview and financial control center.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers || 0} color="blue" />
        <StatCard icon={<Briefcase />} label="Total Listings" value={stats.totalAuctions || 0} color="purple" />
        <StatCard icon={<Activity />} label="Paid, In Delivery" value={`$${(stats.fundsInEscrow || 0).toLocaleString()}`} color="orange" />
        <StatCard icon={<DollarSign />} label="Net Revenue (5%)" value={`$${(stats.totalCommission || 0).toLocaleString()}`} color="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-500" /> Commission Trend (Recent)
          </h2>
          <LineChart points={commissionTrend} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-gray-500" /> Listing Status Mix
          </h2>
          <StatusBars items={statusDistribution} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-500" /> Recent Transactions
          </h2>
          <div className="space-y-4">
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((deal) => (
                <div key={deal._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Closed {new Date(deal.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${(deal.currentPrice * 0.05).toFixed(2)}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Commission</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No completed transactions yet.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-red-600 rounded-full opacity-20 blur-xl" />
          <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
            <Activity size={20} className="text-red-500" /> Platform Liquidity
          </h2>
          <div className="space-y-8 relative z-10">
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-1">Total Volume Processed</div>
              <div className="text-4xl font-bold tracking-tight">${(stats.totalVolume || 0).toLocaleString()}</div>
            </div>
            <div className="border-t border-slate-700 pt-6">
              <div className="flex justify-between text-sm text-slate-400 mb-1">Total Payouts to Sellers</div>
              <div className="text-2xl font-bold text-slate-300">${(stats.totalPayouts || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickControl title="Manage Users" to="/admin/users" />
        <QuickControl title="Manage Listings" to="/admin/auctions" />
        <QuickControl title="Support Desk" to="/admin/support" />
      </div>
    </div>
  );
};

const QuickControl = ({ title, to }) => (
  <Link to={to} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition flex items-center justify-between">
    <span className="font-semibold text-gray-900">{title}</span>
    <ArrowRight size={16} className="text-gray-400" />
  </Link>
);

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    green: 'bg-green-50 text-green-600 ring-green-100',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ring-1 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const LineChart = ({ points }) => {
  if (!points.length) return <div className="text-sm text-gray-500">Not enough transaction data for trend chart.</div>;

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
  if (!items.length) return <div className="text-sm text-gray-500">No listing data.</div>;
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.status}>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span className="uppercase">{item.status.replaceAll('_', ' ')}</span>
            <span>{item.count}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
