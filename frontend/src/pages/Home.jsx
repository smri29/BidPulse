import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllAuctions } from '../redux/auctionSlice';
import AuctionCard from '../components/cards/AuctionCard';
import { Loader } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    dispatch(getAllAuctions());
  }, [dispatch]);

  // Filter: Show only 'active' auctions on the Home Page
  // (Since the backend now sends all statuses)
  const activeAuctions = auctions.filter(a => a.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Discover Exclusive Deals
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Bid on premium items in real-time. From vintage cars to rare electronics, 
          find your next treasure on BidPulse.
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-bid-purple" size={48} />
        </div>
      ) : (
        <>
          {/* Active Auctions Grid */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Auctions</h2>
          
          {activeAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No live auctions at the moment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;