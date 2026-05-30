import React from 'react';
import { Search, Ticket } from 'lucide-react';

import { TicketStatusBadge } from '../AdminSupportWidgets';

const AdminSupportTicketsPanel = ({
  ticketFilter,
  setTicketFilter,
  ticketSearch,
  setTicketSearch,
  filteredTickets,
  updateTicketStatus,
}) => (
  <div className="premium-panel overflow-hidden rounded-2xl">
    <div className="border-b border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Ticket size={18} className="text-bid-purple" /> Support Tickets
          </h2>
          <p className="mt-1 text-xs text-slate-500">Review every request, then move it from open to resolved with a cleaner ticket queue.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={ticketSearch} onChange={(event) => setTicketSearch(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm" placeholder="Search subject, user, or message" />
          </div>
          <select value={ticketFilter} onChange={(event) => setTicketFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
    </div>

    <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto bg-white">
      {filteredTickets.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center p-8 text-center text-sm text-slate-500">
          No support tickets matched the current search and status filter.
        </div>
      ) : (
        filteredTickets.map((ticket) => (
          <div key={ticket._id} className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{ticket.subject}</p>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{ticket.name}</span>
                  <span>{ticket.email}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{ticket.message}</p>
              </div>
              <div className="flex flex-col gap-2 xl:w-44">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Update Status</label>
                <select value={ticket.status} onChange={(event) => updateTicketStatus(ticket._id, event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default AdminSupportTicketsPanel;
