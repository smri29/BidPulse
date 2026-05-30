/**
 * Module: features/adminUsers/AdminUsersPage.jsx
 * Purpose: Renders the Admin Users Page screen by composing smaller feature-specific sections.
 */
import React from 'react';
import { AlertCircle, Ban, CheckCircle, Eye, Shield, User, Users } from 'lucide-react';

import Reveal from '../../components/ui/Reveal';
import { useAdminUsersData } from './useAdminUsersData';
import {
  MetricCard,
  UserCard,
  UsersTable,
} from './components/AdminUsersWidgets';
import UserHistoryModal, { UserHistoryLoadingOverlay } from './components/UserHistoryModal';

const AdminUsersPage = () => {
  const {
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
  } = useAdminUsersData();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-bid-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-red-600">
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel mb-6 rounded-2xl p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
                <Users className="text-bid-purple" /> User Management
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Review user roles, investigate activity history, and enforce account policy from one cleaner control view.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total Users" value={userMetrics.total} icon={<User size={15} />} tone="blue" />
            <MetricCard label="Active" value={userMetrics.active} icon={<CheckCircle size={15} />} tone="emerald" />
            <MetricCard label="Banned" value={userMetrics.banned} icon={<Ban size={15} />} tone="amber" />
            <MetricCard label="Admins" value={userMetrics.admins} icon={<Shield size={15} />} tone="purple" />
            <MetricCard label="Visible" value={userMetrics.filtered} icon={<Eye size={15} />} tone="slate" />
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="premium-panel overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200 bg-slate-50/80 p-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.8fr)_220px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                placeholder="Search by user name or email"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:hidden">
            {filteredUsers.map((item) => (
              <UserCard
                key={item._id}
                user={item}
                onViewHistory={handleViewHistory}
                onBanUser={handleBanUser}
                onDeleteUser={handleDeleteUser}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <UsersTable
              filteredUsers={filteredUsers}
              onViewHistory={handleViewHistory}
              onBanUser={handleBanUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No users matched the current search and filter settings.
            </div>
          )}
        </section>
      </Reveal>

      <UserHistoryModal report={selectedUserReport} onClose={() => setSelectedUserReport(null)} />
      <UserHistoryLoadingOverlay isVisible={isReportLoading} />
    </div>
  );
};

export default AdminUsersPage;
