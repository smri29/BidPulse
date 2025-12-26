import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Shield, Users, DollarSign, Briefcase, Activity, TrendingUp 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add Error State

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Ensure port is correct (usually 5000 for backend)
        const { data } = await axios.get('http://localhost:5000/api/admin/stats', config);
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("Admin Stats Error:", err);
        setError("Failed to load admin stats. Ensure backend is running and Admin Routes are registered.");
        setLoading(false);
      }
    };
    
    if (user) fetchStats();
  }, [user]);

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;
  
  // --- SAFETY CHECK ---
  if (error) return (
    <div className="p-10 text-center text-red-600 bg-red-50 m-10 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg">Error</h3>
        <p>{error}</p>
    </div>
  );
  if (!stats) return <div className="p-10 text-center">No data available.</div>;
  // --------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 rounded-lg">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500">Platform overview and financial control.</p>
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
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-500" /> Recent Completed Deals
          </h2>
          <div className="space-y-4">
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((deal) => (
                <div key={deal._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold text-gray-800">{deal.title}</p>
                    <p className="text-xs text-gray-500">Winner: {deal.winner}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${(deal.currentPrice * 0.08).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Commission</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No completed transactions yet.</p>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-gray-900 text-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-6">Platform Liquidity</h2>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">Total Volume Processed</div>
                    <div className="text-3xl font-bold">${(stats.totalVolume || 0).toLocaleString()}</div>
                </div>
                <div className="border-t border-gray-700 pt-4">
                     <div className="flex justify-between text-sm text-gray-400 mb-1">Total Payouts to Sellers</div>
                    <div className="text-2xl font-bold text-gray-300">${(stats.totalPayouts || 0).toLocaleString()}</div>
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
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
    }
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}

export default AdminDashboard;