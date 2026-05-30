import React from 'react';

import Reveal from '../../../components/ui/Reveal';
import { MetricCard } from './AdminAuctionsWidgets';

const AdminAuctionsHeader = ({ auctionMetrics }) => (
  <Reveal>
    <section className="premium-panel mb-6 rounded-2xl p-6">
      <h1 className="text-3xl font-bold text-slate-900">Listing Verification Control</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Review listing quality, manage approval windows, and monitor auction launch readiness from one streamlined workspace.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total" value={auctionMetrics.total} tone="blue" />
        <MetricCard label="Pending" value={auctionMetrics.pending} tone="amber" />
        <MetricCard label="Live" value={auctionMetrics.live} tone="emerald" />
        <MetricCard label="Disapproved" value={auctionMetrics.disapproved} tone="red" />
        <MetricCard label="Visible" value={auctionMetrics.visible} tone="slate" />
      </div>
    </section>
  </Reveal>
);

export default AdminAuctionsHeader;
