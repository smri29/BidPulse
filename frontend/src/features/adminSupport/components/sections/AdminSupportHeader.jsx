/**
 * Module: features/adminSupport/components/sections/AdminSupportHeader.jsx
 * Purpose: Presents the Admin Support Header UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Headphones, MailCheck, MessageCircle, Send, ShieldAlert, Ticket } from 'lucide-react';

import Reveal from '../../../../components/ui/Reveal';
import { MetricCard } from '../AdminSupportWidgets';

const AdminSupportHeader = ({ ticketMetrics, sendTestEmail }) => (
  <Reveal>
    <section className="premium-panel mb-6 rounded-2xl p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <Headphones className="text-bid-purple" /> Support Operations
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Track incoming tickets, respond faster in live support, and keep communication tools healthy from one calmer admin workspace.
          </p>
        </div>
        <button onClick={sendTestEmail} className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold" type="button">
          <MailCheck size={16} /> Send Test Email
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Tickets" value={ticketMetrics.total} icon={<Ticket size={15} />} tone="blue" />
        <MetricCard label="Open" value={ticketMetrics.open} icon={<ShieldAlert size={15} />} tone="amber" />
        <MetricCard label="In Progress" value={ticketMetrics.inProgress} icon={<MessageCircle size={15} />} tone="indigo" />
        <MetricCard label="Resolved" value={ticketMetrics.resolved} icon={<MailCheck size={15} />} tone="emerald" />
        <MetricCard label="Live Messages" value={ticketMetrics.liveMessages} icon={<Send size={15} />} tone="slate" />
      </div>
    </section>
  </Reveal>
);

export default AdminSupportHeader;
