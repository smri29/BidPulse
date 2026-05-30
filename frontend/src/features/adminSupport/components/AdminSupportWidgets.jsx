/**
 * Module: features/adminSupport/components/AdminSupportWidgets.jsx
 * Purpose: Presents the Admin Support Widgets UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';

import AnimatedNumber from '../../../components/ui/AnimatedNumber';

export const MetricCard = ({ label, value, icon, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">{icon}{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900"><AnimatedNumber value={value || 0} className="inline" /></p>
    </motion.div>
  );
};

export const TicketStatusBadge = ({ status }) => {
  const toneMap = {
    open: 'border-amber-200 bg-amber-50 text-amber-700',
    in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
    resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneMap[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{status.replaceAll('_', ' ')}</span>;
};
