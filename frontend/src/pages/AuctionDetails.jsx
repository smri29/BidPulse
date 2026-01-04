import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Clock, DollarSign, User, ArrowLeft, Edit, CheckCircle, Package, Truck, X } from 'lucide-react';
import { toast } from 'react-toastify';

// Initialize Socket outside component
const socket = io('http://localhost:5000'); // Ensure this matches your backend URL

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  
  // --- SHIPPING MODAL STATE ---
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
      name: user?.name || '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phone: ''
  });

  // 1. Initial Fetch
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`/auctions/${id}`);
        setAuction(res.data);
        setBidAmount(res.data.currentPrice + 10);
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching auction');
        setLoading(false);
      }
    };
    fetchAuction();

    socket.emit('joinAuction', id);

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
        `/auctions/${id}/bid`, 
        { amount: bidAmount }, 
        config
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bid failed');
    }
  };

  // --- PAYMENT HANDLER (Step 2: Submit Address & Pay) ---
  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      console.log("Requesting payment session with address...");
      
      // Send address along with checkout request
      const { data } = await axios.post(
        `/payment/create-checkout-session/${id}`, // Make sure this matches backend route
        { shippingAddress: shippingDetails }, 
        config
      );

      if (data.url) {
          console.log("Redirecting to Stripe:", data.url);
          window.location.href = data.url; 
      } else {
          console.error("No URL returned from backend:", data);
          toast.error("Payment Error: No redirect URL found.");
      }

    } catch (error) {
      console.error("Frontend Payment Error:", error);
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    }
  };

  // --- RELEASE FUNDS HANDLER ---
  const handleReleaseFunds = async () => {
    if(!window.confirm("Have you received the item? This will release funds to the seller.")) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`/payment/release/${id}`, {}, config);
      
      toast.success("Transaction Complete! Funds released.");
      setAuction({ ...auction, status: 'closed' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release funds');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!auction) return <div className="p-10 text-center">Not Found</div>;

  const isOwner = user && (auction.seller._id === user._id || auction.seller === user._id);
  const isSeller = user && user.role === 'seller';
  const isAdmin = user && user.role === 'admin';
  const canBid = user && !isOwner && !isSeller && !isAdmin;
  const isWinner = user && auction.winner === user._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
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
            {/* --- UPDATED STATUS LOGIC --- */}
            
            {/* 1. Transaction Closed */}
            {auction.status === 'closed' ? (
                <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                    <h3 className="text-xl font-bold">Transaction Complete</h3>
                    <p className="text-gray-300 text-sm">This auction has been successfully finalized.</p>
                </div>

            /* 2. Paid & Held in Escrow */
            ) : auction.status === 'paid_held_in_escrow' ? (
                isWinner ? (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                        <Package className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="text-lg font-bold text-blue-800 mb-1">Payment Secure</h3>
                        <p className="text-blue-600 text-sm mb-4">
                            Your payment is held in escrow. Only release funds after you have received the item.
                        </p>
                        <button 
                            onClick={handleReleaseFunds}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition w-full"
                        >
                            Confirm Receipt & Release Funds
                        </button>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                        <h3 className="text-lg font-bold text-blue-800">Item Sold & Paid</h3>
                        <p className="text-blue-600">Pending delivery confirmation.</p>
                    </div>
                )

            /* 3. Completed (Waiting for Payment) */
            ) : auction.status === 'completed' ? (
                isWinner ? (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                          <h3 className="text-xl font-bold text-green-800 mb-2">🎉 You Won!</h3>
                          {/* CLICKING THIS OPENS THE SHIPPING MODAL */}
                          <button 
                            onClick={() => setIsShippingModalOpen(true)}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition w-full flex items-center justify-center gap-2"
                          >
                            <Truck size={20} /> Proceed to Shipping
                          </button>
                    </div>
                ) : (
                    <div className="bg-gray-100 text-gray-500 p-4 rounded-lg text-center font-medium">
                        Auction Ended. Winner: {auction.bids[auction.bids.length-1]?.bidder?.name}
                    </div>
                )

            /* 4. Active Bidding */
            ) : canBid ? (
              <form onSubmit={handlePlaceBid} className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" min={auction.currentPrice + 1} required />
                </div>
                <button type="submit" className="bg-bid-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Place Bid
                </button>
              </form>

            /* 5. Owner View */
            ) : isOwner ? (
               <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center font-medium">This is your auction.</div>
            ) : (
                <div className="text-center"><Link to="/login" className="text-bid-purple font-bold">Log in</Link> to bid.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- SHIPPING & PAYMENT MODAL --- */}
      {isShippingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900">Shipping Details</h3>
                      <button onClick={() => setIsShippingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <form onSubmit={handlePayment} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input 
                              type="text" 
                              required 
                              className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple"
                              value={shippingDetails.name}
                              onChange={(e) => setShippingDetails({...shippingDetails, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                          <input 
                              type="text" 
                              required 
                              className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple"
                              placeholder="123 Main St, Apt 4B"
                              value={shippingDetails.address}
                              onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                              <input 
                                  type="text" 
                                  required 
                                  className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple"
                                  value={shippingDetails.city}
                                  onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                              <input 
                                  type="text" 
                                  required 
                                  className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple"
                                  value={shippingDetails.postalCode}
                                  onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input 
                              type="tel" 
                              required 
                              className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple"
                              value={shippingDetails.phone}
                              onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                          />
                      </div>

                      <div className="pt-4">
                          <button 
                            type="submit" 
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                             <DollarSign size={18} /> Pay & Confirm Order
                          </button>
                          <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                              <Lock size={12} /> Secure Payment via Stripe
                          </p>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AuctionDetails;