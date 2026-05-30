/**
 * Module: features/adminUsers/components/UserHistoryModal.jsx
 * Purpose: Contains the state, effects, and event handlers that drive the User History Modal flow.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { CalendarClock, DollarSign, Package, ShoppingBag, X } from 'lucide-react';

import {
  HistoryPanel,
  MetricCard,
} from './AdminUsersWidgets';

const UserHistoryModal = ({ report, onClose }) => {
  if (!report || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl premium-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-6 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{report.profile.name} - Activity Report</h2>
            <p className="text-sm text-slate-500">{report.profile.email}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100" type="button">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <MetricCard title="Total Earned" value={report.stats.totalEarned} icon={<DollarSign size={16} />} tone="emerald" prefix="$" />
            <MetricCard title="Total Spent" value={report.stats.totalSpent} icon={<ShoppingBag size={16} />} tone="blue" prefix="$" />
            <MetricCard title="Items Listed" value={report.stats.itemsListed} icon={<Package size={16} />} tone="purple" />
            <MetricCard title="Items Won" value={report.stats.itemsWon} icon={<CalendarClock size={16} />} tone="amber" />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
              <h3 className="mb-3 font-bold text-slate-900">Profile Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-900">{report.profile.name}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{report.profile.email}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="font-medium text-slate-900">{report.profile.role}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Joined</dt><dd className="font-medium text-slate-900">{new Date(report.profile.createdAt).toLocaleDateString()}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Location</dt><dd className="font-medium text-slate-900">{report.profile.location || 'N/A'}</dd></div>
              </dl>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
              <HistoryPanel title="Selling History" tone="green" items={report.history.sales} empty="No selling history" dateField="createdAt" />
              <HistoryPanel title="Purchase History" tone="blue" items={report.history.purchases} empty="No purchase history" dateField="registrationEndAt" />
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const UserHistoryLoadingOverlay = ({ isVisible }) => {
  if (!isVisible || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/35">
      <div className="rounded-full bg-white p-4 shadow-lg">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-bid-purple" />
      </div>
    </div>,
    document.body
  );
};

export default UserHistoryModal;
