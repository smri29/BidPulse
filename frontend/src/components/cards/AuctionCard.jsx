import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign } from 'lucide-react';

const AuctionCard = ({ auction }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={auction.images[0] || 'https://via.placeholder.com/400x300'} 
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-bid-purple uppercase tracking-wide">
          {auction.category}
        </div>
        <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
             auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {auction.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
            {auction.title}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-bid-purple font-bold text-lg">
            <DollarSign size={18} strokeWidth={3} />
            {auction.currentPrice}
          </div>
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
            <Clock size={14} className="mr-1" />
            {new Date(auction.endTime).toLocaleDateString()}
          </div>
        </div>

        <Link 
          to={`/auction/${auction._id}`}
          className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-bid-purple transition-colors"
        >
          View Auction
        </Link>
      </div>
    </div>
  );
};

export default AuctionCard;