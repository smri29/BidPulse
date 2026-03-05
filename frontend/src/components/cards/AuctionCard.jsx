import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Star, Users } from 'lucide-react';
import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';

const AuctionCard = ({ auction, watched = false, onToggleWatch, onRegister, userId }) => {
  const statusLabelMap = {
    pending_verification: 'Under Review',
    future: 'Future',
    ongoing: 'Live',
    completed: 'Winner Pending Payment',
    paid_shipping_pending: 'Paid - Shipping by RiZBiD',
    paid_held_in_escrow: 'Paid in Escrow',
    closed: 'Closed',
    no_registrations: 'No Registrations',
    withdrawn: 'Withdrawn',
    disapproved: 'Disapproved',
  };

  const isFuture = auction.status === 'future';
  const isSeller = String(auction.seller?._id || auction.seller) === String(userId);
  const alreadyRegistered = auction.registrations?.some((entry) => String(entry.bidder) === String(userId));

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group animate-fade-up">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={getAuctionImage(auction.images)}
          alt={auction.title}
          onError={handleAuctionImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-bid-purple uppercase tracking-wide">
          {auction.category}
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-gray-900 text-white">
          {statusLabelMap[auction.status] || auction.status}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onToggleWatch) onToggleWatch(auction._id);
          }}
          className={`absolute bottom-3 right-3 p-2 rounded-full border shadow-sm transition ${
            watched
              ? 'bg-yellow-300 text-yellow-900 border-yellow-400'
              : 'bg-white/90 text-gray-600 border-white hover:bg-white'
          }`}
          title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={14} fill={watched ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{auction.title}</h3>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-bid-purple font-bold text-lg">
            <DollarSign size={18} strokeWidth={3} />
            {auction.currentPrice}
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg inline-flex items-center gap-1">
            <Clock size={12} />
            {new Date(auction.registrationEndAt || auction.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-4 inline-flex items-center gap-1">
          <Users size={12} />
          Registered: {auction.registrations?.length || 0}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/auction/${auction._id}`}
            className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-bid-purple transition-colors"
          >
            Details
          </Link>

          {isFuture ? (
            <button
              disabled={!onRegister || !userId || isSeller || alreadyRegistered}
              onClick={() => onRegister?.(auction._id)}
              className="w-full text-center bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {alreadyRegistered ? 'Registered' : 'Register'}
            </button>
          ) : (
            <Link
              to={`/auction/${auction._id}`}
              className="block w-full text-center bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200"
            >
              Open
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
