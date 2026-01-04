import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllAuctions, deleteAuction } from '../../redux/auctionSlice';
import { Trash2, Plus, Pencil, Eye, DollarSign, Lock } from 'lucide-react';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    dispatch(getAllAuctions());
  }, [dispatch]);

  // Filter only THIS seller's auctions
  const myAuctions = auctions.filter((a) => a.seller._id === user._id || a.seller === user._id);

  // --- EARNINGS LOGIC ---
  // 1. Released Earnings (Status: 'closed') -> 92% of price (We keep 8%)
  const totalEarnings = myAuctions
    .filter(a => a.status === 'closed')
    .reduce((acc, item) => acc + (item.currentPrice * 0.92), 0);

  // 2. Pending Earnings (Status: 'paid_held_in_escrow') -> 92% of price
  const potentialEarnings = myAuctions
    .filter(a => a.status === 'paid_held_in_escrow')
    .reduce((acc, item) => acc + (item.currentPrice * 0.92), 0);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      dispatch(deleteAuction(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link to="/create-auction" 
          className="flex items-center gap-2 bg-bid-green text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition shadow-sm font-medium">
          <Plus size={20} /> Create New Listing
        </Link>
      </div>

      {/* --- NEW EARNINGS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Realized Earnings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
                <DollarSign size={18} />
                <span className="text-sm">Total Earnings (Released)</span>
            </div>
            <h3 className="text-3xl font-bold text-green-600">${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>

        {/* Card 2: Escrow Pending */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
             <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Lock size={18} />
                <span className="text-sm">Pending in Escrow</span>
            </div>
            <h3 className="text-3xl font-bold text-blue-600">${potentialEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs text-blue-400 mt-1">Available after buyer confirms receipt</p>
        </div>

        {/* Card 3: Stripe Link */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-sm text-white flex flex-col justify-between">
            <div>
                <p className="text-gray-300 text-sm">Payout Method</p>
                <h3 className="text-xl font-bold">Stripe Connected</h3>
            </div>
            <a 
              href="https://dashboard.stripe.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white text-center py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition"
            >
              View Stripe Dashboard
            </a>
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-800">My Listings</h2>
        </div>
        
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading your inventory...</div>
        ) : myAuctions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Current Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ends In</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myAuctions.map((auction) => (
                  <tr key={auction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img 
                           src={auction.images[0] || 'https://via.placeholder.com/150'} 
                           alt={auction.title}
                           className="h-full w-full object-cover"
                          />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{auction.title}</div>
                      <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                        {auction.description}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-green-600">
                      ${auction.currentPrice}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        auction.status === 'active' ? 'bg-green-100 text-green-800' : 
                        auction.status === 'closed' ? 'bg-gray-800 text-white' :
                        auction.status === 'paid_held_in_escrow' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {auction.status === 'paid_held_in_escrow' ? 'Escrow' : auction.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {new Date(auction.endTime).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link to={`/edit-auction/${auction._id}`} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                          <Pencil size={18} />
                        </Link>
                        
                        <Link to={`/auction/${auction._id}`} className="text-gray-400 hover:text-bid-purple transition" title="View Public Page">
                           <Eye size={18} />
                        </Link>

                        <button onClick={() => handleDelete(auction._id)} className="text-red-400 hover:text-red-600 transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="mx-auto h-12 w-12 text-gray-300 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
               <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products listed</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new auction.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;