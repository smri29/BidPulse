import React from 'react';

const AuctionHistorySection = ({ auction }) => (
  <div className="mb-6">
    <h3 className="mb-2 font-semibold text-gray-900">Offer History</h3>
    <div className="max-h-44 space-y-2 overflow-y-auto pr-2">
      {auction.bids?.length > 0 ? (
        [...auction.bids].reverse().map((bid, index) => (
          <div key={index} className="flex justify-between rounded bg-gray-50 p-2 text-sm text-gray-600">
            <span>{bid.bidder?.name || 'Participant'}</span>
            <span className="font-bold">${bid.amount}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">No offers yet.</p>
      )}
    </div>
  </div>
);

export default AuctionHistorySection;
