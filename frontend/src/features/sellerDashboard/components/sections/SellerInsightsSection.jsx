/**
 * Module: features/sellerDashboard/components/sections/SellerInsightsSection.jsx
 * Purpose: Presents the Seller Insights Section UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Clock3, DollarSign, Gavel, TrendingUp, Users } from 'lucide-react';

import Reveal from '../../../../components/ui/Reveal';
import {
  InsightValue,
  KpiCard,
  LineChart,
  MiniMetric,
  StatusBars,
} from '../SellerDashboardWidgets';

const SellerInsightsSection = ({
  metrics,
  bidTrend,
  statusDistribution,
  listingInsights,
  selectedListingId,
  onSelectListing,
}) => (
  <>
    <Reveal delay={60}>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Released Earnings" value={metrics.releasedEarnings} prefix="$" icon={<DollarSign size={16} />} tone="emerald" />
        <KpiCard label="In Pipeline (95%)" value={metrics.pipelineEarnings} prefix="$" icon={<TrendingUp size={16} />} tone="indigo" />
        <KpiCard label="Total Registrations" value={metrics.totalRegistrations} icon={<Users size={16} />} tone="blue" isCount />
        <KpiCard label="Total Bids" value={metrics.totalBids} icon={<Gavel size={16} />} tone="amber" isCount />
      </section>
    </Reveal>

    <Reveal delay={90}>
      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="premium-panel rounded-2xl p-5 xl:col-span-2">
          <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BarChart3 size={17} /> Offer Trend Across Listings
          </h2>
          <LineChart points={bidTrend} />
        </div>

        <div className="premium-panel rounded-2xl p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Listing Status Distribution</h2>
          <StatusBars items={statusDistribution} />
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <MiniMetric label="Total Listings" value={metrics.totalListings} />
            <MiniMetric label="Live Listings" value={metrics.liveListings} />
            <MiniMetric label="Highest Current Offer" value={`$${metrics.topBid.toLocaleString()}`} />
            <MiniMetric label="Commission Rate" value="5%" />
          </div>
        </div>
      </section>
    </Reveal>

    <Reveal delay={120}>
      <section className="premium-panel mb-8 rounded-2xl p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Top Listing Insights</h2>
        {listingInsights.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listingInsights.map((listing, index) => (
              <motion.button
                key={listing._id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -2 }}
                onClick={() => onSelectListing(listing._id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedListingId === listing._id
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="truncate font-semibold text-slate-900">{listing.title}</p>
                <p className="mt-1 text-xs uppercase text-slate-500">{listing.status.replaceAll('_', ' ')}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <InsightValue label="Registered" value={listing.registrationCount} />
                  <InsightValue label="Offers" value={listing.bidCount} />
                  <InsightValue label="Offer Intensity" value={listing.intensity} />
                  <InsightValue label="Current" value={`$${listing.currentPrice}`} />
                </div>
                {listing.lastBid ? (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-600">
                    <Clock3 size={12} /> Last offer: ${listing.lastBid.amount}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">No offers yet</p>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No listing insights available yet.</p>
        )}
      </section>
    </Reveal>
  </>
);

export default SellerInsightsSection;
