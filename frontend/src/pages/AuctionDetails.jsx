import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios, { socketUrl } from '../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Clock, DollarSign, ArrowLeft, Edit, CheckCircle, Package, Truck, X, Lock, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeNow, setTimeNow] = useState(Date.now());

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`/auctions/${id}`);
        setAuction(res.data);
        setBidAmount(res.data.currentPrice + 10);
      } catch (error) {
        toast.error('Error fetching auction');
      } finally {
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

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login');

    try {
      await axios.post(
        `/auctions/${id}/bid`,
        { amount: Number(bidAmount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bid failed');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `/payment/checkout/${id}`,
        { shippingAddress: shippingDetails },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (data.url) window.location.href = data.url;
      else toast.error('Payment Error: No redirect URL found.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    }
  };

  const handleReleaseFunds = async () => {
    if (!window.confirm('Have you received the item? This will release funds to the seller.')) return;

    try {
      await axios.post(`/payment/release/${id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Transaction Complete! Funds released.');
      setAuction((prev) => ({ ...prev, status: 'closed' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release funds');
    }
  };

  const remainingMs = useMemo(() => {
    if (!auction?.endTime) return 0;
    return Math.max(new Date(auction.endTime).getTime() - timeNow, 0);
  }, [auction?.endTime, timeNow]);

  const countdown = useMemo(() => {
    const totalSec = Math.floor(remainingMs / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  }, [remainingMs]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!auction) return <div className="p-10 text-center">Not Found</div>;

  const isOwner = user && (auction.seller._id === user._id || auction.seller === user._id);
  const isSeller = user && user.role === 'seller';
  const isAdmin = user && user.role === 'admin';
  const canBid = user && user.emailVerified && !isOwner && !isSeller && !isAdmin;
  const isWinner = user && auction.winner === user._id;
  const bidDensity = auction.bids?.length > 0 ? (auction.bids.length / Math.max((new Date() - new Date(auction.createdAt)) / 3600000, 1)).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-bid-purple mb-6 transition">
        <ArrowLeft size={20} className="mr-1" /> Back to Auctions
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="h-96 lg:h-auto bg-gray-100 relative">
          <img src={auction.images[0] || 'https://via.placeholder.com/600'} alt={auction.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-bid-purple shadow-sm">{auction.category}</div>
        </div>

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

            <p className="text-gray-600 mb-4 leading-relaxed">{auction.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs text-gray-500 mb-1">Current Highest Bid</div>
                <div className="text-3xl font-bold text-bid-purple flex items-center">
                  <DollarSign size={24} strokeWidth={3} />
                  {auction.currentPrice}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock size={14} /> Time Remaining</div>
                <div className="text-lg font-bold text-gray-900">{countdown}</div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 text-sm text-indigo-700 inline-flex items-center gap-2">
              <Activity size={16} /> Smart Signal: {bidDensity} bids/hour activity velocity
            </div>

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
            {auction.status === 'closed' ? (
              <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                <h3 className="text-xl font-bold">Transaction Complete</h3>
                <p className="text-gray-300 text-sm">This auction has been successfully finalized.</p>
              </div>
            ) : auction.status === 'paid_held_in_escrow' ? (
              isWinner ? (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                  <Package className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="text-lg font-bold text-blue-800 mb-1">Payment Secure</h3>
                  <p className="text-blue-600 text-sm mb-4">Your payment is held in escrow. Only release funds after receiving the item.</p>
                  <button onClick={handleReleaseFunds} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition w-full">Confirm Receipt & Release Funds</button>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                  <h3 className="text-lg font-bold text-blue-800">Item Sold & Paid</h3>
                  <p className="text-blue-600">Pending delivery confirmation.</p>
                </div>
              )
            ) : auction.status === 'completed' ? (
              isWinner ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                  <h3 className="text-xl font-bold text-green-800 mb-2">You Won!</h3>
                  <button onClick={() => setIsShippingModalOpen(true)} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition w-full flex items-center justify-center gap-2">
                    <Truck size={20} /> Proceed to Shipping
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-500 p-4 rounded-lg text-center font-medium">
                  Auction Ended. Winner: {auction.bids[auction.bids.length - 1]?.bidder?.name}
                </div>
              )
            ) : canBid ? (
              <form onSubmit={handlePlaceBid} className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" min={auction.currentPrice + 1} required />
                </div>
                <button type="submit" className="bg-bid-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">Place Bid</button>
              </form>
            ) : user && !user.emailVerified ? (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center font-medium">
                Verify your email from Profile before placing bids.
              </div>
            ) : isOwner ? (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center font-medium">This is your auction.</div>
            ) : (
              <div className="text-center"><Link to="/login" className="text-bid-purple font-bold">Log in</Link> to bid.</div>
            )}
          </div>
        </div>
      </div>

      {isShippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Shipping Details</h3>
              <button onClick={() => setIsShippingModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple" value={shippingDetails.name} onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <input type="text" required className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple" placeholder="123 Main St, Apt 4B" value={shippingDetails.address} onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" required className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple" value={shippingDetails.city} onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" required className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple" value={shippingDetails.postalCode} onChange={(e) => setShippingDetails({ ...shippingDetails, postalCode: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" required className="w-full rounded-lg border-gray-300 focus:ring-bid-purple focus:border-bid-purple" value={shippingDetails.phone} onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })} />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
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
