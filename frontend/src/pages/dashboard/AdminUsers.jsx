import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Trash2, Shield, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
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

  // Delete User Handler
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure? This will permanently delete the user and their data.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      {/* Name & ID */}
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-base">{u.name}</div>
                        <div className="text-xs text-gray-400 font-mono">ID: {u._id}</div>
                        {u.idType && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 mt-1 inline-block">
                                {u.idType.toUpperCase()}
                            </span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        {u.role === 'admin' ? (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 border border-red-200">
                            <Shield size={12} /> Admin
                          </span>
                        ) : u.role === 'seller' ? (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
                            Legacy Seller
                          </span>
                        ) : u.role === 'bidder' ? (
                           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                            Legacy Bidder
                          </span>
                        ) : (
                          // Unified 'user' role
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex w-fit items-center gap-1">
                             <CheckCircle size={12} /> Standard User
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-2">
                             <Mail size={14} className="text-gray-400" /> {u.email}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        {u.role !== 'admin' ? (
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition duration-200"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                           <span className="text-xs text-gray-300 select-none">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-500">
                          <p>No users found in database.</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;