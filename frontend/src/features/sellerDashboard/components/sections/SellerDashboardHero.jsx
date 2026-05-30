/**
 * Module: features/sellerDashboard/components/sections/SellerDashboardHero.jsx
 * Purpose: Presents the Seller Dashboard Hero UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Download, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import Reveal from '../../../../components/ui/Reveal';

const SellerDashboardHero = ({
  onExportBidHistory,
  onExportEarnings,
  onExportSummary,
}) => (
  <Reveal>
    <section className="premium-panel mb-8 rounded-2xl p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track listing lifecycle, auction momentum, and payout performance in one view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExportBidHistory} className="btn-soft px-4 py-2.5 text-sm text-blue-700" type="button">
            <Download size={16} /> Offer History CSV
          </button>
          <button onClick={onExportEarnings} className="btn-soft px-4 py-2.5 text-sm text-indigo-700" type="button">
            <Download size={16} /> Earnings CSV
          </button>
          <button onClick={onExportSummary} className="btn-secondary px-4 py-2.5 text-sm" type="button">
            <FileText size={16} /> Summary PDF
          </button>
          <Link to="/create-auction" className="btn-premium px-4 py-2.5 text-sm">
            <Plus size={18} /> Submit Product
          </Link>
        </div>
      </div>
    </section>
  </Reveal>
);

export default SellerDashboardHero;
