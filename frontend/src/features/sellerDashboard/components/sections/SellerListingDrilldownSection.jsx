import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

import Reveal from '../../../../components/ui/Reveal';
import { getAuctionImage, handleAuctionImageError } from '../../../../utils/imageUrl';

const SellerListingDrilldownSection = ({ selectedListing }) => (
  <Reveal delay={180}>
    <section className="premium-panel rounded-2xl p-5">
      <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Trophy size={17} /> Listing Drill-down
      </h2>
      {selectedListing ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 lg:col-span-1">
            <img
              src={getAuctionImage(selectedListing.images)}
              alt={selectedListing.title}
              onError={handleAuctionImageError}
              className="mb-3 h-44 w-full rounded-lg border border-slate-200 object-cover"
            />
            <p className="font-semibold text-slate-900">{selectedListing.title}</p>
            <p className="mt-1 text-sm text-slate-600">{selectedListing.description}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p><b>Status:</b> {selectedListing.status.replaceAll('_', ' ')}</p>
              <p><b>Current Price:</b> ${selectedListing.currentPrice}</p>
              <p><b>Registered:</b> {selectedListing.registrations?.length || 0}</p>
              <p><b>Total Bids:</b> {selectedListing.bids?.length || 0}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 lg:col-span-2">
            <h3 className="mb-3 font-semibold text-slate-900">Offer Timeline</h3>
            {selectedListing.bids?.length ? (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {[...selectedListing.bids].reverse().map((bid, index) => (
                  <motion.div
                    key={`${bid.time}-${index}`}
                    whileHover={{ x: 2 }}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{bid.bidder?.name || 'Participant'}</p>
                      <p className="text-xs text-slate-500">{new Date(bid.time).toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">${bid.amount}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No offers on this listing yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Select a listing from insights or the table to view detailed auction analytics.</p>
      )}
    </section>
  </Reveal>
);

export default SellerListingDrilldownSection;
