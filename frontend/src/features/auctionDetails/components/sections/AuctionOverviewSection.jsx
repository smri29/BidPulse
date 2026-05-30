import React from 'react';
import { Clock, DollarSign, Users } from 'lucide-react';

const AuctionOverviewSection = ({
  auction,
  myRegistration,
  registrationClosed,
  registrationCountdown,
  roomActivationActive,
  roomActivationCountdown,
  turnCountdown,
}) => (
  <>
    <h1 className="mb-4 text-3xl font-bold text-gray-900">{auction.title}</h1>
    <p className="mb-4 leading-relaxed text-gray-600">{auction.description}</p>

    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="mb-1 text-xs text-gray-500">Current Highest Offer</div>
        <div className="flex items-center text-3xl font-bold text-bid-purple">
          <DollarSign size={24} strokeWidth={3} />
          {auction.currentPrice}
        </div>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        {auction.status === 'future' && !registrationClosed ? (
          <>
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <Clock size={14} /> Registration Closes In
            </div>
            <div className="text-lg font-bold text-gray-900">{registrationCountdown}</div>
          </>
        ) : auction.status === 'future' && roomActivationActive ? (
          <>
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <Clock size={14} /> Open Auction Window
            </div>
            <div className="text-lg font-bold text-gray-900">{roomActivationCountdown}</div>
          </>
        ) : auction.status === 'ongoing' ? (
          <>
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <Clock size={14} /> Turn Timer
            </div>
            <div className="text-lg font-bold text-gray-900">{turnCountdown}</div>
          </>
        ) : auction.status === 'future' ? (
          <>
            <div className="mb-1 text-xs text-gray-500">Status</div>
            <div className="text-lg font-bold text-gray-900">Awaiting Room Opening</div>
          </>
        ) : (
          <>
            <div className="mb-1 text-xs text-gray-500">Status</div>
            <div className="text-lg font-bold uppercase text-gray-900">{auction.status.replaceAll('_', ' ')}</div>
          </>
        )}
      </div>
    </div>

    <div className="mb-6 space-y-2 text-sm text-gray-700">
      <p className="inline-flex items-center gap-1">
        <Users size={14} /> Registrations: {auction.registrations?.length || 0}
      </p>
      {myRegistration && <p>Your registration number: #{myRegistration.sequence}</p>}
      {auction.status === 'ongoing' && (
        <p>Active participants: {auction.activeBidders?.map((bidder) => bidder.name).join(' vs ') || 'TBD'}</p>
      )}
      {auction.status === 'disapproved' && auction.verificationNote ? (
        <p className="text-red-700"><b>Disapproval Reason:</b> {auction.verificationNote}</p>
      ) : null}
    </div>
  </>
);

export default AuctionOverviewSection;
