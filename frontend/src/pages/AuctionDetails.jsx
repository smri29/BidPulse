import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { loadStripe } from '@stripe/stripe-js'; // <--- ADDED
import { Clock, DollarSign, User, ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

// Initialize Socket outside component
const socket = io('http://localhost:5000');

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');

  // 1. Initial Fetch
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auctions/${id}`);
        setAuction(res.data);
        setBidAmount(res.data.currentPrice + 10);
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching auction');
        setLoading(false);
      }
    };
    fetchAuction();

    // 2. Join the "Room"
    socket.emit('joinAuction', id);

    // 3. Listen for Real-Time Updates
    socket.on('bidUpdated', (updatedAuction) => {
      setAuction(updatedAuction);
      setBidAmount(updatedAuction.currentPrice + 10);
      toast.success(`New highest bid: $${updatedAuction.currentPrice}`);
    });

    return () => {
      socket.off('bidUpdated');
    };
  }, [id]);

  // --- BIDDING HANDLER ---
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login');

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.post(
        `http://localhost:5000/api/auctions/${id}/bid`, 
        { amount: bidAmount }, 
        config
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bid failed');
    }
  };

  // --- PAYMENT HANDLER (ADDED) ---
  const handlePayment = async () => {
    try {
      // REPLACE WITH YOUR STRIPE PUBLIC KEY
      const stripe = await loadStripe('pk_test_51RHfFMP4rKd5YSDMOiiMczlb2BYut9OlswloamALGAbBa4FUlc5VtIyQT25ctaridbK45k6JsUEUaTPKihQ6eqW100UI8agNnj'); 

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      // Call the backend to create a checkout session
      const { data } = await axios.post(
        `http://localhost:5000/api/payment/checkout/${id}`,
        {}, 
        config
      );

      // Redirect to Stripe
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!auction) return <div className="p-10 text-center">Not Found</div>;

  // --- LOGIC CHECKS ---
  const isOwner = user && (auction.seller._id === user._id || auction.seller === user._id);
  const isSeller = user && user.role === 'seller';
  const isAdmin = user && user.role === 'admin';
  const canBid = user && !isOwner && !isSeller && !isAdmin;

  // Check if current user is the winner
  const isWinner = user && auction.winner === user._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-bid-purple mb-6 transition">
        <ArrowLeft size={20} className="mr-1" /> Back to Auctions
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="h-96 lg:h-auto bg-gray-100 relative">
          <img 
            src={auction.images[0] || 'https://via.placeholder.com/600'} 
            alt={auction.title} 
            className="w-full h-full object-cover"
          />
           <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-bid-purple shadow-sm">
            {auction.category}
          </div>
        </div>

        {/* Right: Info */}
        <div className="p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>
              {isOwner && (
                <Link to={`/edit-auction/${auction._id}`} className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition">
                  <Edit size={16} /> Edit
                </Link>
              )}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{auction.description}</p>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-6">
              <div className="text-sm text-gray-500 mb-1">Current Highest Bid</div>
              <div className="text-4xl font-bold text-bid-purple flex items-center">
                <DollarSign size={32} strokeWidth={3} />
                {auction.currentPrice}
              </div>
            </div>

            {/* Bid History */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Recent Bids</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {auction.bids && auction.bids.length > 0 ? (
                        [...auction.bids].reverse().map((bid, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <span>{bid.bidder?.name || 'Anonymous'}</span>
                                <span className="font-bold">${bid.amount}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">No bids yet. Be the first!</p>
                    )}
                </div>
            </div>
          </div>

          <div className="mt-8">
            {/* PAYMENT LOGIC START */}
            {auction.status === 'completed' || auction.status === 'paid_held_in_escrow' ? (
                // If Paid
                auction.status === 'paid_held_in_escrow' ? (
                     <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                        <h3 className="text-lg font-bold text-blue-800">Item Sold & Paid</h3>
                        <p className="text-blue-600">This item has been paid for.</p>
                    </div>
                // If Completed but Not Paid (and User is Winner)
                ) : isWinner ? (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                         <h3 className="text-xl font-bold text-green-800 mb-2">🎉 You Won!</h3>
                         <p className="text-green-700 mb-4">
                            Congratulations! You won this item for <b>${auction.currentPrice}</b>.
                         </p>
                         <button 
                           onClick={handlePayment}
                           className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2 w-full mx-auto"
                         >
                           <DollarSign size={20} /> Pay Now via Stripe
                         </button>
                    </div>
                ) : (
                    // Completed but user is not winner
                    <div className="bg-gray-100 text-gray-500 p-4 rounded-lg text-center font-medium">
                        Auction Ended. Winner: {auction.bids[auction.bids.length-1]?.bidder?.name}
                    </div>
                )
            ) : canBid ? (
              // Active & Can Bid
              <form onSubmit={handlePlaceBid} className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-bid-purple focus:border-bid-purple"
                    min={auction.currentPrice + 1}
                    required
                  />
                </div>
                <button type="submit" className="bg-bid-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Place Bid
                </button>
              </form>
            ) : isOwner ? (
               <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center font-medium">This is your auction.</div>
            ) : (
                <div className="text-center"><Link to="/login" className="text-bid-purple font-bold">Log in</Link> to bid.</div>
            )}
            {/* PAYMENT LOGIC END */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;