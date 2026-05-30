/**
 * Module: features/adminDashboard/components/AdminDashboardWidgets.jsx
 * Purpose: Presents the Admin Dashboard Widgets UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import AnimatedNumber from '../../../components/ui/AnimatedNumber';

export const QuickControl = ({ title, to }) => (
  <motion.div whileHover={{ y: -2 }}>
    <Link to={to} className="premium-panel flex items-center justify-between rounded-xl p-4 transition">
      <span className="font-semibold text-slate-900">{title}</span>
      <ArrowRight size={16} className="text-slate-400" />
    </Link>
  </motion.div>
);

export const StatCard = ({ icon, label, value, color, prefix = '' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    green: 'bg-green-50 text-green-600 ring-green-100',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="premium-panel flex items-center gap-4 rounded-xl p-6">
      <div className={`rounded-xl p-4 ring-1 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {prefix}
          <AnimatedNumber value={value || 0} className="inline" />
        </p>
      </div>
    </motion.div>
  );
};

export const LineChart = ({ points }) => {
  if (!points.length) {
    return <div className="text-sm text-slate-500">Not enough transaction data for trend chart.</div>;
  }

  const width = 600;
  const height = 220;
  const pad = 24;
  const maxY = Math.max(...points.map((point) => point.y), 1);

  const mapped = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(points.length - 1, 1);
    const y = height - pad - (point.y / maxY) * (height - pad * 2);
    return { ...point, x, y };
  });

  const path = mapped.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[520px]">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" rx="12" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" />
        {mapped.map((point) => (
          <g key={point.x}>
            <circle cx={point.x} cy={point.y} r="4" fill="#1d4ed8" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const StatusBars = ({ items }) => {
  if (!items.length) {
    return <div className="text-sm text-slate-500">No listing data.</div>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.status}>
          <div className="mb-1 flex justify-between text-xs text-slate-600">
            <span className="uppercase">{item.status.replaceAll('_', ' ')}</span>
            <span>{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-2 bg-gradient-to-r from-cyan-500 to-blue-600"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
