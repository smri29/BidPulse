import React from 'react';
import { Search } from 'lucide-react';

import Reveal from '../../../components/ui/Reveal';

const AdminAuctionsFilters = ({ search, setSearch, statusFilter, setStatusFilter }) => (
  <Reveal delay={70}>
    <section className="premium-panel mb-6 overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 bg-slate-50/80 p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.7fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, category, or seller"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="disapproved">Disapproved</option>
            <option value="future">Future</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
    </section>
  </Reveal>
);

export default AdminAuctionsFilters;
