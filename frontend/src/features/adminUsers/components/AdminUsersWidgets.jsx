/**
 * Module: features/adminUsers/components/AdminUsersWidgets.jsx
 * Purpose: Presents the Admin Users Widgets UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';
import { Ban, CheckCircle, Mail, Shield, Unlock } from 'lucide-react';

import AnimatedNumber from '../../../components/ui/AnimatedNumber';

export const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
      role === 'admin'
        ? 'border-red-200 bg-red-100 text-red-800'
        : 'border-emerald-200 bg-emerald-100 text-emerald-800'
    }`}
  >
    {role}
  </span>
);

export const StatusBadge = ({ isBanned }) =>
  isBanned ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
      <Ban size={13} /> Suspended
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      <CheckCircle size={13} /> Active
    </span>
  );

export const ActionButton = ({ children, onClick, title, tone }) => {
  const toneClassMap = {
    soft: 'btn-soft text-blue-700',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
    danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={`rounded-xl p-2 transition ${toneClassMap[tone] || toneClassMap.soft}`}
      title={title}
      type="button"
    >
      {children}
    </motion.button>
  );
};

export const MetricCard = ({ title, value, icon, tone, prefix = '', label }) => {
  const cardLabel = title || label;
  const tones = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {cardLabel}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {prefix}
        <AnimatedNumber value={value || 0} className="inline" />
      </p>
    </motion.div>
  );
};

export const HistoryPanel = ({ title, tone, items, empty, dateField }) => {
  const toneClasses = tone === 'green' ? 'text-emerald-700' : 'text-blue-700';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className={`mb-3 font-bold ${toneClasses}`}>{title}</h3>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {items.length ? (
          items.map((item) => (
            <motion.div key={item._id} whileHover={{ x: 2 }} className="rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs uppercase text-slate-500">{item.status.replaceAll('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${item.currentPrice}</p>
                  <p className="text-[11px] text-slate-500">{new Date(item[dateField] || item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-sm italic text-slate-400">{empty}</p>
        )}
      </div>
    </div>
  );
};

export const UserCard = ({
  user,
  onViewHistory,
  onBanUser,
  onDeleteUser,
}) => (
  <div
    className={`rounded-2xl border p-4 shadow-sm ${user.isBanned ? 'border-red-200 bg-red-50/70' : 'border-slate-200 bg-white'}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>
      <RoleBadge role={user.role} />
    </div>

    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <span className="font-medium text-slate-500">Status</span>
      <StatusBadge isBanned={user.isBanned} />
    </div>

    <p className="mt-3 truncate text-[11px] text-slate-400">ID: {user._id}</p>

    <div className="mt-4 flex flex-wrap gap-2">
      {user.role !== 'admin' ? (
        <>
          <ActionButton onClick={() => onViewHistory(user._id)} tone="soft" title="View Activity Log">
            View
          </ActionButton>
          <ActionButton
            onClick={() => onBanUser(user._id)}
            tone={user.isBanned ? 'success' : 'warning'}
            title={user.isBanned ? 'Unban User' : 'Ban User'}
          >
            {user.isBanned ? <Unlock size={16} /> : <Ban size={16} />}
          </ActionButton>
          <ActionButton onClick={() => onDeleteUser(user._id)} tone="danger" title="Delete User">
            Delete
          </ActionButton>
        </>
      ) : (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          Protected account
        </span>
      )}
    </div>
  </div>
);

export const UsersTable = ({
  filteredUsers,
  onViewHistory,
  onBanUser,
  onDeleteUser,
}) => (
  <table className="w-full text-left text-sm">
    <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
      <tr>
        <th className="p-4">Account</th>
        <th className="p-4">Role</th>
        <th className="p-4">Email</th>
        <th className="p-4">Status</th>
        <th className="p-4 text-center">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 bg-white">
      {filteredUsers.map((user) => (
        <tr key={user._id} className={`${user.isBanned ? 'bg-red-50/60' : 'hover:bg-slate-50/70'}`}>
          <td className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900">{user.name}</div>
                <div className="truncate font-mono text-xs text-slate-400">ID: {user._id}</div>
              </div>
            </div>
          </td>
          <td className="p-4"><RoleBadge role={user.role} /></td>
          <td className="p-4 text-slate-600">
            <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {user.email}</div>
          </td>
          <td className="p-4"><StatusBadge isBanned={user.isBanned} /></td>
          <td className="p-4 text-center">
            {user.role !== 'admin' ? (
              <div className="flex justify-center gap-2">
                <ActionButton onClick={() => onViewHistory(user._id)} tone="soft" title="View Activity Log">View</ActionButton>
                <ActionButton
                  onClick={() => onBanUser(user._id)}
                  tone={user.isBanned ? 'success' : 'warning'}
                  title={user.isBanned ? 'Unban User' : 'Ban User'}
                >
                  {user.isBanned ? <Unlock size={18} /> : <Ban size={18} />}
                </ActionButton>
                <ActionButton onClick={() => onDeleteUser(user._id)} tone="danger" title="Delete User">Delete</ActionButton>
              </div>
            ) : (
              <span className="select-none text-xs text-slate-300">Protected</span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
