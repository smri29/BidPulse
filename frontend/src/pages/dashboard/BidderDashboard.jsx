import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAuctions } from '../../redux/auctionSlice';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, AlertCircle, DollarSign, ExternalLink } from 'lucide-react';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const BidderDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    dispatch(getAllAuctions());
  }, [dispatch]);

  // --- FILTERING LOGIC ---
  // 1. Won Auctions (Status is NOT active, and I am the winner)
  const wonAuctions = auctions.filter(
    (a) => a.winner === user._id && a.status !== 'active'
  );

  // 2. Active Bids (Status IS active, and I have placed at least one bid)
  const activeBids = auctions.filter(
    (a) => a.status === 'active' && a.bids.some((b) => b.bidder === user._id)
  );

  // --- HANDLER: RELEASE FUNDS (Directly from Dashboard) ---
  const handleReleaseFunds = async (auctionId) => {
    if (!window.confirm("Confirm you received this item? Funds will be released to seller.")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`/payment/release/${auctionId}`, {}, config);
      toast.success("Funds Released! Transaction Closed.");
      dispatch(getAllAuctions()); // Refresh UI
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release funds');
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bidding Dashboard</h1>

      {/* SECTION 1: WINS & ACTION ITEMS */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-bid-purple" /> My Winnings & Purchases
        </h2>
        
        {wonAuctions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Item</th>
                    <th className="p-4 font-semibold text-gray-600">Winning Bid</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600">Action Needed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wonAuctions.map((auction) => (
                    <tr key={auction._id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={auction.images[0] || 'https://via.placeholder.com/50'} 
                            alt={auction.title} 
                            className="w-12 h-12 rounded object-cover border"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{auction.title}</p>
                            <p className="text-xs text-gray-500">Ended: {new Date(auction.endTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-bid-purple">${auction.currentPrice}</td>
                      <td className="p-4">
                        {auction.status === 'completed' && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Unpaid</span>
                        )}
                        {auction.status === 'paid_held_in_escrow' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">In Escrow</span>
                        )}
                        {auction.status === 'closed' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Delivered</span>
                        )}
                      </td>
                      <td className="p-4">
                        {auction.status === 'completed' ? (
                          <Link 
                            to={`/auction/${auction._id}`} 
                            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700"
                          >
                            <DollarSign size={14} /> Pay Now
                          </Link>
                        ) : auction.status === 'paid_held_in_escrow' ? (
                          <button 
                            onClick={() => handleReleaseFunds(auction._id)}
                            className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700"
                          >
                            <CheckCircle size={14} /> Confirm Receipt
                          </button>
                        ) : (
                          <Link to={`/auction/${auction._id}`} className="text-gray-400 hover:text-bid-purple text-sm flex items-center gap-1">
                             View Details <ExternalLink size={12}/>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300 text-gray-500">
            You haven't won any auctions yet.
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE BIDS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="text-bid-purple" /> Active Bids
        </h2>

        {activeBids.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {activeBids.map((auction) => {
               const isWinning = auction.winner === user._id;
               return (
                 <div key={auction._id} className={`bg-white rounded-xl shadow-sm border p-5 ${isWinning ? 'border-green-200 ring-1 ring-green-100' : 'border-red-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{auction.title}</h3>
                      {isWinning ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Winning</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Outbid</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-500">Current Price:</span>
                      <span className="font-bold text-lg">${auction.currentPrice}</span>
                    </div>

                    <Link 
                      to={`/auction/${auction._id}`}
                      className={`block w-full text-center py-2 rounded-lg font-bold text-sm transition ${
                        isWinning 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-bid-purple text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isWinning ? 'View Auction' : 'Bid Again'}
                    </Link>
                 </div>
               );
             })}
           </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300 text-gray-500">
            You don't have any active bids. <Link to="/" className="text-bid-purple font-bold">Start exploring!</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidderDashboard;