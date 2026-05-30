import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';

export const useAdminUsersData = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserReport, setSelectedUserReport] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/admin/users', config);
      setUsers(data.users || []);
      setLoading(false);
    } catch {
      setError('Failed to load users. Please check backend connectivity.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user?.token]);

  useEffect(() => {
    const shouldLockScroll = Boolean(selectedUserReport || isReportLoading);
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUserReport, isReportLoading]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((item) => {
      const matchesQuery = !query || item.name?.toLowerCase().includes(query) || item.email?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !item.isBanned) ||
        (statusFilter === 'banned' && item.isBanned);
      return matchesQuery && matchesStatus;
    });
  }, [search, statusFilter, users]);

  const userMetrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter((item) => item.role === 'admin').length;
    const banned = users.filter((item) => item.isBanned).length;
    const active = total - banned;

    return {
      total,
      admins,
      banned,
      active,
      filtered: filteredUsers.length,
    };
  }, [filteredUsers.length, users]);

  const handleViewHistory = async (userId) => {
    setIsReportLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/admin/users/${userId}/history`, config);
      setSelectedUserReport(data);
    } catch {
      toast.error('Failed to fetch user history');
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/admin/users/ban/${userId}`, {}, config);
      setUsers((prev) => prev.map((item) => (item._id === userId ? { ...item, isBanned: !item.isBanned } : item)));
      toast.info('User status updated');
    } catch {
      toast.error('Failed to update ban status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/admin/users/${userId}`, config);
      setUsers((prev) => prev.filter((item) => item._id !== userId));
      toast.success('User removed successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return {
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredUsers,
    userMetrics,
    selectedUserReport,
    setSelectedUserReport,
    isReportLoading,
    handleViewHistory,
    handleBanUser,
    handleDeleteUser,
  };
};
