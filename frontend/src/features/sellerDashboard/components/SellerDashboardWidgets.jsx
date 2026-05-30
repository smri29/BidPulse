/**
 * Module: features/sellerDashboard/components/SellerDashboardWidgets.jsx
 * Purpose: Presents the Seller Dashboard Widgets UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import AnimatedNumber from '../../../components/ui/AnimatedNumber';

export const KpiCard = ({ label, value, prefix = '', icon, tone = 'emerald', isCount = false }) => {
  const safeValue = Number(value || 0);
  const displayValue = isCount ? safeValue : Math.round(safeValue);
  const toneMap = {
    emerald: 'text-emerald-700',
    indigo: 'text-indigo-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="premium-panel rounded-xl p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <div className={`mt-2 text-2xl font-bold ${toneMap[tone] || toneMap.emerald}`}>
        {prefix}
        <AnimatedNumber value={displayValue} className="inline" />
      </div>
    </motion.div>
  );
};

export const StatusBadge = ({ status }) => {
  const styleMap = {
    pending_verification: 'bg-amber-100 text-amber-700',
    future: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-indigo-100 text-indigo-700',
    paid_shipping_pending: 'bg-sky-100 text-sky-700',
    paid_held_in_escrow: 'bg-sky-100 text-sky-700',
    closed: 'bg-slate-800 text-white',
    no_registrations: 'bg-orange-100 text-orange-700',
    withdrawn: 'bg-gray-200 text-gray-700',
    disapproved: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styleMap[status] || styleMap.withdrawn}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
};

export const MiniMetric = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
    <p className="text-[11px] uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export const InsightValue = ({ label, value }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
    <p className="text-[10px] uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-xs font-semibold text-slate-900">{value}</p>
  </div>
);

export const LineChart = ({ points }) => {
  if (!points.length) {
    return <p className="text-sm text-slate-500">No listing trend data available yet.</p>;
  }

  const width = 720;
  const height = 220;
  const pad = 24;
  const maxY = Math.max(...points.map((point) => point.bidCount), 1);
  const mapped = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(points.length - 1, 1);
    const y = height - pad - (point.bidCount / maxY) * (height - pad * 2);
    return { ...point, x, y };
  });
  const path = mapped.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px]">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" rx="12" />
        <path d={path} fill="none" stroke="#059669" strokeWidth="3" />
        {mapped.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r="4" fill="#047857" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const StatusBars = ({ items }) => {
  if (!items.length) {
    return <p className="text-sm text-slate-500">No listing status data yet.</p>;
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
              className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListingsTable = ({
  myAuctions,
  isLoading,
  onSelectListing,
  onDelete,
}) => {
  if (isLoading) {
    return <div className="p-10 text-center text-slate-500">Loading your listings...</div>;
  }

  if (!myAuctions.length) {
    return <div className="p-14 text-center text-slate-500">No listings yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="border-b border-slate-100 bg-slate-50">
          <tr>
            <th className="px-6 py-3.5">Item</th>
            <th className="px-6 py-3.5">Price</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5">Registered</th>
            <th className="px-6 py-3.5">Offers</th>
            <th className="px-6 py-3.5">Winner</th>
            <th className="px-6 py-3.5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{myAuctions.map((auction) => onSelectListing(auction))}</tbody>
      </table>
    </div>
  );
};

export const ListingRow = ({ auction, onSelectListing, onDelete, imageNode }) => (
  <tr className="hover:bg-slate-50/60">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        {imageNode}
        <div>
          <p className="font-semibold text-slate-900">{auction.title}</p>
          <p className="text-xs text-slate-500">{auction.category}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 font-semibold text-emerald-700">${auction.startingPrice} / ${auction.currentPrice}</td>
    <td className="px-6 py-4"><StatusBadge status={auction.status} /></td>
    <td className="px-6 py-4">{auction.registrations?.length || 0}</td>
    <td className="px-6 py-4">{auction.bids?.length || 0}</td>
    <td className="px-6 py-4">{auction.winner?.name || (auction.winner ? 'Winner selected' : 'N/A')}</td>
    <td className="px-6 py-4 text-center">
      <div className="inline-flex gap-2">
        <button
          onClick={() => onSelectListing(auction._id)}
          className="btn-soft inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700"
          type="button"
        >
          Analytics
        </button>
        <Link to={`/auction/${auction._id}`} className="btn-secondary px-3 py-1.5 text-xs">Details</Link>
        <button
          onClick={() => onDelete(auction._id)}
          className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
          type="button"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);
