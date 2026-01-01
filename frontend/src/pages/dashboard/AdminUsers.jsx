import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Trash2, Shield, User, Mail, AlertCircle } from 'lucide-react';
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
      // Make sure the port (5000) matches your backend
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
    if (window.confirm('Are you sure? This will permanently delete the user.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
        toast.success('User removed');
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Users...</div>;
  
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
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">ID: {u._id}</div>
                      </td>
                      <td className="p-4">
                        {u.role === 'admin' ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                            <Shield size={10} /> Admin
                          </span>
                        ) : u.role === 'seller' ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                            Seller
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                            Bidder
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex items-center gap-2 text-gray-600">
                        <Mail size={14} /> {u.email}
                      </td>
                      <td className="p-4 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-500">No users found in database.</td>
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