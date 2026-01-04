import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { Trash2, Shield, User, Mail, AlertCircle, CheckCircle, Ban, Unlock, Eye, X, DollarSign, ShoppingBag, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- REPORT MODAL STATE ---
  const [selectedUserReport, setSelectedUserReport] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/admin/users', config);
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("User Fetch Error:", error);
      setError('Failed to load users. Please check the backend connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user) fetchUsers();
  }, [user]);

  // --- VIEW HISTORY HANDLER ---
  const handleViewHistory = async (userId) => {
      setIsReportLoading(true);
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`/admin/users/${userId}/history`, config);
          setSelectedUserReport(data);
          setIsReportLoading(false);
      } catch (err) {
          toast.error("Failed to fetch user history");
          setIsReportLoading(false);
      }
  };

  // --- BAN USER HANDLER ---
  const handleBanUser = async (userId) => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/admin/users/ban/${userId}`, {}, config);
        
        setUsers(users.map(u => {
            if (u._id === userId) {
                const newStatus = !u.isBanned;
                toast.info(newStatus ? `User Banned` : `User Active`);
                return { ...u, isBanned: newStatus };
            }
            return u;
        }));
    } catch (error) {
        toast.error('Failed to update ban status');
    }
  };

  // --- DELETE USER HANDLER ---
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure? This will permanently delete the user and their data.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/admin/users/${userId}`, config);
        toast.success('User removed successfully');
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) return (
      <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bid-purple"></div>
      </div>
  );
  
  if (error) return (
      <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2">
          <AlertCircle size={40} />
          <p>{error}</p>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User className="text-bid-purple" /> User Management
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className={`transition ${u.isBanned ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  {/* Name & ID */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-900 text-base">{u.name}</div>
                        {u.isBanned && <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">BANNED</span>}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">ID: {u._id}</div>
                  </td>

                  {/* Role Badge */}
                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Admin</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">User</span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {u.email}</div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {u.isBanned ? (
                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs"><Ban size={14} /> Suspended</span>
                    ) : (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle size={14} /> Active</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    {u.role !== 'admin' ? (
                      <div className="flex justify-center gap-2">
                          {/* VIEW HISTORY BUTTON */}
                          <button 
                            onClick={() => handleViewHistory(u._id)}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"
                            title="View Activity Log"
                          >
                             <Eye size={18} />
                          </button>

                          {/* BAN BUTTON */}
                          <button 
                            onClick={() => handleBanUser(u._id)}
                            className={`p-2 rounded-lg transition text-white ${u.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-400 hover:bg-orange-500'}`}
                            title={u.isBanned ? "Unban" : "Ban"}
                          >
                            {u.isBanned ? <Unlock size={18} /> : <Ban size={18} />}
                          </button>

                          {/* DELETE BUTTON */}
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition border border-red-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                      </div>
                    ) : (
                       <span className="text-xs text-gray-300 select-none">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REPORT MODAL --- */}
      {selectedUserReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                      <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedUserReport.profile.name}'s Report</h2>
                          <p className="text-sm text-gray-500">{selectedUserReport.profile.email}</p>
                      </div>
                      <button onClick={() => setSelectedUserReport(null)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X size={24} className="text-gray-500" />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-8">
                      {/* 1. Key Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                              <p className="text-green-600 text-sm font-bold flex items-center gap-2"><DollarSign size={16}/> Total Earned</p>
                              <p className="text-2xl font-bold text-gray-900">${selectedUserReport.stats.totalEarned.toLocaleString()}</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                              <p className="text-blue-600 text-sm font-bold flex items-center gap-2"><ShoppingBag size={16}/> Total Spent</p>
                              <p className="text-2xl font-bold text-gray-900">${selectedUserReport.stats.totalSpent.toLocaleString()}</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                              <p className="text-purple-600 text-sm font-bold flex items-center gap-2"><Package size={16}/> Items Sold</p>
                              <p className="text-2xl font-bold text-gray-900">{selectedUserReport.stats.itemsListed}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 2. Selling History */}
                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Selling History
                              </h3>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {selectedUserReport.history.sales.length > 0 ? (
                                      selectedUserReport.history.sales.map(item => (
                                          <div key={item._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border border-gray-100 text-sm">
                                              <span className="font-medium text-gray-700 truncate max-w-[150px]">{item.title}</span>
                                              <div className="text-right">
                                                  <span className="block font-bold text-green-600">${item.currentPrice}</span>
                                                  <span className="text-[10px] text-gray-400 uppercase">{item.status}</span>
                                              </div>
                                          </div>
                                      ))
                                  ) : <p className="text-gray-400 text-sm italic">No items listed.</p>}
                              </div>
                          </div>

                          {/* 3. Buying History */}
                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Purchase History
                              </h3>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {selectedUserReport.history.purchases.length > 0 ? (
                                      selectedUserReport.history.purchases.map(item => (
                                          <div key={item._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border border-gray-100 text-sm">
                                              <span className="font-medium text-gray-700 truncate max-w-[150px]">{item.title}</span>
                                              <div className="text-right">
                                                  <span className="block font-bold text-blue-600">${item.currentPrice}</span>
                                                  <span className="text-[10px] text-gray-400 uppercase">{new Date(item.endTime).toLocaleDateString()}</span>
                                              </div>
                                          </div>
                                      ))
                                  ) : <p className="text-gray-400 text-sm italic">No items purchased.</p>}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Loading Overlay for Report */}
      {isReportLoading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
               <div className="bg-white p-4 rounded-full shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bid-purple"></div>
               </div>
          </div>
      )}
    </div>
  );
};

export default AdminUsers;