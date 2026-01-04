import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { 
  Shield, Users, DollarSign, Briefcase, Activity, TrendingUp, AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Assuming backend runs on port 5000
        const { data } = await axios.get('/admin/stats', config);
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("Admin Stats Error:", err);
        setError("Failed to connect to the server. Please check if the backend is running.");
        setLoading(false);
      }
    };
    
    if (user) fetchStats();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-10 flex flex-col items-center justify-center text-red-600">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="font-bold text-lg">Dashboard Error</h3>
        <p>{error}</p>
    </div>
  );

  if (!stats) return <div className="p-10 text-center">No data available.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-100 rounded-xl shadow-sm border border-red-200">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm">System overview and financial control center.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers || 0} color="blue" />
        <StatCard icon={<Briefcase />} label="Total Auctions" value={stats.totalAuctions || 0} color="purple" />
        <StatCard icon={<Activity />} label="Funds in Escrow" value={`$${(stats.fundsInEscrow || 0).toLocaleString()}`} color="orange" />
        <StatCard icon={<DollarSign />} label="Net Revenue (8%)" value={`$${(stats.totalCommission || 0).toLocaleString()}`} color="green" />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-500" /> Recent Transactions
          </h2>
          <div className="space-y-4">
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((deal) => (
                <div key={deal._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Winner: {deal.winner || "Unknown"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${(deal.currentPrice * 0.08).toFixed(2)}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Commission</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No completed transactions yet.</p>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-slate-900 text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-red-600 rounded-full opacity-20 blur-xl"></div>
            
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
    </div>
  );
};

// Helper Component for Cards
const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100",
        orange: "bg-orange-50 text-orange-600 ring-orange-100",
        green: "bg-green-50 text-green-600 ring-green-100",
    }
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-4 rounded-xl ring-1 ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}

export default AdminDashboard;