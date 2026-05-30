import React from 'react';

import Reveal from '../../../../components/ui/Reveal';
import { ListingRow, ListingsTable } from '../SellerDashboardWidgets';
import { getAuctionImage, handleAuctionImageError } from '../../../../utils/imageUrl';

const SellerListingsSection = ({ myAuctions, isLoading, onDelete, onSelectListing }) => (
  <Reveal delay={150}>
    <section className="premium-panel mb-8 overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 bg-slate-50/75 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">My Listings</h2>
      </div>

      <ListingsTable
        myAuctions={myAuctions}
        isLoading={isLoading}
        onDelete={onDelete}
        onSelectListing={(auction) => (
          <ListingRow
            key={auction._id}
            auction={auction}
            onDelete={onDelete}
            onSelectListing={onSelectListing}
            imageNode={
              <img
                src={getAuctionImage(auction.images)}
                alt={auction.title}
                onError={handleAuctionImageError}
                className="h-11 w-11 rounded-md border border-slate-200 object-cover"
              />
            }
          />
        )}
      />
    </section>
  </Reveal>
);

export default SellerListingsSection;
