import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios, { socketUrl } from '../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Clock, DollarSign, ArrowLeft, CheckCircle, Package, Truck, X, Lock, Users, Hand } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAuctionImage, handleAuctionImageError } from '../utils/imageUrl';

// Auction details responsibilities:
// 1. show one auction in full detail
// 2. react to realtime state changes
// 3. handle registration, room opening, bidding, give-up, payment, and receipt confirmation
const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeNow, setTimeNow] = useState(Date.now());
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [relistAmount, setRelistAmount] = useState('');
  const socketRef = useRef(null);

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const fetchAuction = async () => {
    try {
      const res = await axios.get(`/auctions/${id}`);
      let nextAuction = res.data;

      // If the current user is the winner and payment state may be stale, try a reconciliation sync.
      const isWinnerForAuction =
        user?.token &&
        String(nextAuction.winner?._id || nextAuction.winner || '') === String(user?._id || '') &&
        nextAuction.status === 'completed' &&
        nextAuction.payment?.stripeSessionId;

      if (isWinnerForAuction) {
        try {
          await axios.post(
            `/payment/reconcile/${id}`,
            {},
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          const refreshed = await axios.get(`/auctions/${id}`);
          nextAuction = refreshed.data;
        } catch (_syncError) {
          // Ignore reconcile errors here; normal flow and webhook may still update shortly.
        }
      }

      setAuction(nextAuction);
      setBidAmount(String((nextAuction.currentPrice || 0) + 1));
      setRelistAmount(String(Math.max((nextAuction.startingPrice || 1) - 1, 1)));
    } catch (_error) {
      toast.error('Error fetching listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // These client-side timers drive registration, room-opening, and turn countdown displays.
    const timer = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAuction();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Join the auction-specific socket room so the page updates when bids or state change.
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: user?.token ? { token: user.token } : undefined,
    });
    socketRef.current = socket;

    socket.emit('joinAuction', id);
    socket.on('bidUpdated', (payload) => {
      if (!payload?.auctionId || payload.auctionId === id || payload._id === id) {
        fetchAuction();
      }
    });

    return () => {
      socket.off('bidUpdated');
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [id, user?.token]);

  const handleRegister = async () => {
    if (!user?.token) {
      toast.error('Please login first');
      return;
    }

    try {
      const { data } = await axios.post(
        `/auctions/${id}/register`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Registered as #${data.registrationNumber}`);
      fetchAuction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleOpenAuctionRoom = async () => {
    if (!user?.token) {
      toast.error('Please login first');
      return;
    }

    try {
      const { data } = await axios.post(
        `/auctions/${id}/open-room`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAuction(data);
      toast.success('Auction room is now live for all registered participants.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to open auction room');
      fetchAuction();
    }
  };

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

  const handleGiveUp = async () => {
    if (!user?.token) return;

    try {
      await axios.post(
        `/auctions/${id}/give-up`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.info('You gave up this round');
      fetchAuction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to give up');
    }
  };

  const handleNoRegistrationDecision = async (action) => {
    try {
      await axios.post(
        `/auctions/${id}/no-registration-decision`,
        { action, reducedStartingPrice: action === 'relist' ? Number(relistAmount) : undefined },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(action === 'withdraw' ? 'Product withdrawn' : 'Product re-listed');
      fetchAuction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      // Shipping details are collected here before redirecting to Stripe checkout.
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

  const handleConfirmReceived = async () => {
    if (!window.confirm('Confirm that you received the product from AuctionPulse?')) return;

    try {
      await axios.post(`/payment/confirm-received/${id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Product receipt confirmed. Order closed.');
      fetchAuction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm product receipt');
    }
  };

  const registrationRemainingMs = useMemo(() => {
    if (!auction?.registrationEndAt) return 0;
    return Math.max(new Date(auction.registrationEndAt).getTime() - timeNow, 0);
  }, [auction?.registrationEndAt, timeNow]);

  const turnRemainingMs = useMemo(() => {
    if (!auction?.turnExpiresAt) return 0;
    return Math.max(new Date(auction.turnExpiresAt).getTime() - timeNow, 0);
  }, [auction?.turnExpiresAt, timeNow]);

  const roomActivationRemainingMs = useMemo(() => {
    if (!auction?.roomActivation?.expiresAt) return 0;
    return Math.max(new Date(auction.roomActivation.expiresAt).getTime() - timeNow, 0);
  }, [auction?.roomActivation?.expiresAt, timeNow]);

  const registrationCountdown = useMemo(() => {
    // Registration windows may be long in production or very short in testing,
    // so this formatter keeps the display readable across both cases.
    const totalSec = Math.floor(registrationRemainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s}s`;
  }, [registrationRemainingMs]);

  const turnCountdown = useMemo(() => `${Math.floor(turnRemainingMs / 1000)}s`, [turnRemainingMs]);

  const roomActivationCountdown = useMemo(() => {
    // Room activation is a short bridge state, so mm:ss is enough detail here.
    const totalSec = Math.floor(roomActivationRemainingMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [roomActivationRemainingMs]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!auction) return <div className="p-10 text-center">Not Found</div>;

  const sellerId = auction.seller?._id || auction.seller;
  const isOwner = user && String(sellerId) === String(user._id);
  const isWinner = user && String(auction.winner?._id || auction.winner) === String(user._id);

  const myRegistration = auction.registrations?.find(
    (entry) => String(entry.bidder?._id || entry.bidder) === String(user?._id)
  );
  const currentRoomActivatorId = String(
    auction.roomActivation?.currentBidder?._id || auction.roomActivation?.currentBidder || ''
  );
  const isRegistered = Boolean(myRegistration);
  const isActiveBidder = auction.activeBidders?.some((bidder) => String(bidder?._id || bidder) === String(user?._id));
  const isCurrentTurn = String(auction.currentTurnBidder?._id || auction.currentTurnBidder) === String(user?._id);
  const registrationClosed = auction.status === 'future' && registrationRemainingMs === 0;
  const roomActivationActive = Boolean(auction.roomActivation?.isActive && currentRoomActivatorId);
  const isCurrentRoomActivator = roomActivationActive && currentRoomActivatorId === String(user?._id || '');

  // These booleans centralize the page's switching logic so button visibility is easier to explain.
  const canRegister = user && auction.status === 'future' && registrationRemainingMs > 0 && !isOwner && !isRegistered;
  const canBid = user && auction.status === 'ongoing' && isActiveBidder && isCurrentTurn && user.emailVerified;
  const canGiveUp = user && auction.status === 'ongoing' && isActiveBidder;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-bid-purple mb-6 transition">
        <ArrowLeft size={20} className="mr-1" /> Back to Listings
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="h-96 lg:h-auto bg-gray-100 relative">
          <img
            src={getAuctionImage(auction.images)}
            alt={auction.title}
            onError={handleAuctionImageError}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-bid-purple shadow-sm">
            {auction.category}
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">{auction.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs text-gray-500 mb-1">Current Highest Offer</div>
                <div className="text-3xl font-bold text-bid-purple flex items-center">
                  <DollarSign size={24} strokeWidth={3} />
                  {auction.currentPrice}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {auction.status === 'future' && !registrationClosed ? (
                  <>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock size={14} /> Registration Closes In
                    </div>
                    <div className="text-lg font-bold text-gray-900">{registrationCountdown}</div>
                  </>
                ) : auction.status === 'future' && roomActivationActive ? (
                  <>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock size={14} /> Open Auction Window
                    </div>
                    <div className="text-lg font-bold text-gray-900">{roomActivationCountdown}</div>
                  </>
                ) : auction.status === 'ongoing' ? (
                  <>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock size={14} /> Turn Timer
                    </div>
                    <div className="text-lg font-bold text-gray-900">{turnCountdown}</div>
                  </>
                ) : auction.status === 'future' ? (
                  <>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="text-lg font-bold text-gray-900">Awaiting Room Opening</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="text-lg font-bold text-gray-900 uppercase">{auction.status.replaceAll('_', ' ')}</div>
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
                <p>
                  Active participants: {auction.activeBidders?.map((bidder) => bidder.name).join(' vs ') || 'TBD'}
                </p>
              )}
              {auction.status === 'disapproved' && auction.verificationNote ? (
                <p className="text-red-700"><b>Disapproval Reason:</b> {auction.verificationNote}</p>
              ) : null}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Offer History</h3>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-2">
                {auction.bids?.length > 0 ? (
                  [...auction.bids].reverse().map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span>{bid.bidder?.name || 'Participant'}</span>
                      <span className="font-bold">${bid.amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No offers yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {canRegister && (
              <button onClick={handleRegister} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
                Register For Auction
              </button>
            )}

            {auction.status === 'future' && isRegistered && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-emerald-800 text-sm">
                Registered successfully. Reminder email will be sent 5 minutes before the auction goes live.
              </div>
            )}

            {auction.status === 'future' && registrationClosed && roomActivationActive && isCurrentRoomActivator && (
              <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  It is your turn to open the auction room for everyone. This window expires in{' '}
                  <b>{roomActivationCountdown}</b>.
                </p>
                <button
                  onClick={handleOpenAuctionRoom}
                  className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  Open Auction
                </button>
              </div>
            )}

            {auction.status === 'future' && registrationClosed && roomActivationActive && !isCurrentRoomActivator && isRegistered && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Waiting for registered participant #{auction.roomActivation?.currentSequence} to open the auction room.
                This handoff expires in <b>{roomActivationCountdown}</b>.
              </div>
            )}

            {auction.status === 'future' && registrationClosed && !roomActivationActive && isRegistered && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Registration is closed. The auction room is preparing to hand off to the next eligible participant.
              </div>
            )}

            {auction.status === 'future' && registrationClosed && !isRegistered && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Registration is closed. Waiting for a registered participant to open the auction room.
              </div>
            )}

            {auction.status === 'ongoing' && !isRegistered && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
                Spectator mode enabled. You can watch this live auction session.
              </div>
            )}

            {auction.status === 'ongoing' && canBid && (
              <form onSubmit={handlePlaceBid} className="flex gap-3">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-3"
                  min={auction.currentPrice + 1}
                  required
                />
                <button type="submit" className="bg-bid-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Place Offer
                </button>
              </form>
            )}

            {auction.status === 'ongoing' && isActiveBidder && !isCurrentTurn && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
                Waiting for your turn. Each active turn is 20 seconds.
              </div>
            )}

            {canGiveUp && (
              <button onClick={handleGiveUp} className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 inline-flex items-center justify-center gap-2">
                <Hand size={16} /> Give Up
              </button>
            )}

            {auction.status === 'no_registrations' && isOwner && (
              <div className="space-y-3 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-900">No participant registrations found. Choose the next step:</p>
                <button
                  onClick={() => handleNoRegistrationDecision('withdraw')}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold"
                >
                  Withdraw Product ($9.99 fee)
                </button>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={relistAmount}
                    min={1}
                    onChange={(e) => setRelistAmount(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Reduced starting amount"
                  />
                  <button
                    onClick={() => handleNoRegistrationDecision('relist')}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Relist ($14.99)
                  </button>
                </div>
              </div>
            )}

            {auction.status === 'closed' ? (
              <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                <h3 className="text-xl font-bold">Transaction Complete</h3>
              </div>
            ) : auction.status === 'paid_shipping_pending' || auction.status === 'paid_held_in_escrow' ? (
              isWinner ? (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                  <Package className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="text-lg font-bold text-blue-800 mb-1">Shipping in Progress</h3>
                  <p className="text-sm text-blue-700 mb-3">AuctionPulse will deliver within 7-14 days.</p>
                  <button onClick={handleConfirmReceived} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition w-full">
                    Product Received
                  </button>
                </div>
              ) : null
            ) : auction.status === 'completed' && isWinner ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                  <h3 className="text-xl font-bold text-green-800 mb-2">You Won</h3>
                  <button onClick={() => setIsShippingModalOpen(true)} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition w-full flex items-center justify-center gap-2">
                    <Truck size={20} /> Proceed to Payment
                  </button>
                </div>
            ) : null}
          </div>
        </div>
      </div>

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
              <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Full Name" value={shippingDetails.name} onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })} />
              <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Shipping Address" value={shippingDetails.address} onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="City" value={shippingDetails.city} onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })} />
                <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Postal Code" value={shippingDetails.postalCode} onChange={(e) => setShippingDetails({ ...shippingDetails, postalCode: e.target.value })} />
              </div>
              <input type="tel" required className="w-full rounded-lg border-gray-300" placeholder="Phone Number" value={shippingDetails.phone} onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })} />

              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <DollarSign size={18} /> Pay & Confirm Order
              </button>
              <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={12} /> Secure Payment via Stripe
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetails;

