/**
 * Module: features/adminAuctions/components/AdminAuctionsWidgets.jsx
 * Purpose: Presents the Admin Auctions Widgets UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';

import AnimatedNumber from '../../../components/ui/AnimatedNumber';

export const MetricCard = ({ label, value, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        <AnimatedNumber value={value || 0} className="inline" />
      </p>
    </motion.div>
  );
};

export const ActionButton = ({ children, onClick, tone = 'soft' }) => {
  const toneClassMap = {
    soft: 'btn-soft text-slate-700',
    danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition ${toneClassMap[tone] || toneClassMap.soft}`}
      type="button"
    >
      {children}
    </motion.button>
  );
};

export const StatusBadge = ({ status }) => {
  const styleMap = {
    pending_verification: 'bg-amber-100 text-amber-700',
    disapproved: 'bg-red-100 text-red-700',
    future: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-indigo-100 text-indigo-700',
    closed: 'bg-slate-800 text-white',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styleMap[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
};
