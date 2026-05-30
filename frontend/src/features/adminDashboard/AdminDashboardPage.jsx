import React from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';

import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';
import {
  LineChart,
  QuickControl,
  StatCard,
  StatusBars,
} from './components/AdminDashboardWidgets';
import { useAdminDashboardData } from './useAdminDashboardData';

const AdminDashboardPage = () => {
  const { stats, loading, error, statusDistribution, commissionTrend } = useAdminDashboardData();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-bid-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-red-600">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-lg font-bold">Dashboard Error</h3>
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
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers || 0} color="blue" />
          <StatCard icon={<Briefcase />} label="Total Listings" value={stats.totalAuctions || 0} color="purple" />
          <StatCard icon={<Activity />} label="Paid, In Delivery" value={stats.fundsInEscrow || 0} prefix="$" color="orange" />
          <StatCard icon={<DollarSign />} label="Net Revenue (5%)" value={stats.totalCommission || 0} prefix="$" color="green" />
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
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
        <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
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

export default AdminDashboardPage;
