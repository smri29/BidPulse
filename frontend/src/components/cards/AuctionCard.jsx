import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Star, Users } from 'lucide-react';
import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';

const AuctionCard = ({ auction, watched = false, onToggleWatch, onRegister, userId }) => {
  const statusLabelMap = {
    pending_verification: 'Under Review',
    future: 'Future',
    ongoing: 'Live',
    completed: 'Winner Pending Payment',
    paid_shipping_pending: 'Paid - Shipping by AuctionPulse',
    paid_held_in_escrow: 'Paid in Escrow',
    closed: 'Closed',
    no_registrations: 'No Registrations',
    withdrawn: 'Withdrawn',
    disapproved: 'Disapproved',
  };

  const isFuture = auction.status === 'future';
  const isSeller = String(auction.seller?._id || auction.seller) === String(userId);
  const alreadyRegistered = auction.registrations?.some((entry) => String(entry.bidder) === String(userId));
  const [timeNow, setTimeNow] = useState(Date.now());

  useEffect(() => {
    if (!isFuture) return undefined;
    const timer = window.setInterval(() => setTimeNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isFuture]);

  const registrationCountdown = useMemo(() => {
    if (!isFuture || !auction.registrationEndAt) return '';

    const remainingMs = Math.max(new Date(auction.registrationEndAt).getTime() - timeNow, 0);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }, [auction.registrationEndAt, isFuture, timeNow]);

  return (
    <div className="surface-card hover-lift group overflow-hidden rounded-2xl">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={getAuctionImage(auction.images)}
          alt={auction.title}
          onError={handleAuctionImageError}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-md border border-white/30 bg-white/80 px-2 py-1 text-xs font-bold uppercase tracking-wide text-bid-purple backdrop-blur">
          {auction.category}
        </div>

        <div className="absolute right-3 top-3 rounded-md bg-slate-900 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {statusLabelMap[auction.status] || auction.status}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (onToggleWatch) onToggleWatch(auction._id);
          }}
          className={`absolute bottom-3 right-3 rounded-full border p-2 shadow-sm ${
            watched
              ? 'border-amber-300 bg-amber-200 text-amber-900'
              : 'border-white bg-white/90 text-slate-600 hover:bg-white'
          }`}
          title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          type="button"
        >
          <Star size={14} fill={watched ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="truncate text-lg font-bold text-slate-900">{auction.title}</h3>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center text-lg font-extrabold text-bid-purple">
            <DollarSign size={18} strokeWidth={3} />
            {auction.currentPrice}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-xs text-slate-600">
            <div className="inline-flex items-center gap-1">
              <Clock size={12} />
              {new Date(auction.registrationEndAt || auction.createdAt).toLocaleDateString()}
            </div>
            {isFuture && registrationCountdown ? (
              <div className="mt-1 font-semibold text-blue-700">Ends in {registrationCountdown}</div>
            ) : null}
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-xs text-slate-600">
          <Users size={12} /> Registered: {auction.registrations?.length || 0}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to={`/auction/${auction._id}`} className="btn-secondary w-full py-2 text-sm">
            Details
          </Link>

          {isFuture ? (
            <button
              disabled={!onRegister || !userId || isSeller || alreadyRegistered}
              onClick={() => onRegister?.(auction._id)}
              className="btn-premium w-full py-2 text-sm disabled:opacity-55"
              type="button"
            >
              {alreadyRegistered ? 'Registered' : 'Register'}
            </button>
          ) : (
            <Link to={`/auction/${auction._id}`} className="btn-soft w-full py-2 text-sm text-slate-700">
              Open
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
