import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import axios, { socketUrl } from '../../utils/axiosConfig';

export const useAuctionDetails = (id) => {
  const { user } = useSelector((state) => state.auth);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeNow, setTimeNow] = useState(Date.now());
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [relistAmount, setRelistAmount] = useState('');
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const socketRef = useRef(null);

  const fetchAuction = useCallback(async () => {
    try {
      const res = await axios.get(`/auctions/${id}`);
      let nextAuction = res.data;

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
        } catch {
          // Reconcile failures are intentionally silent here because Stripe/webhook
          // retries may still update the auction moments later.
        }
      }

      setAuction(nextAuction);
      setBidAmount(String((nextAuction.currentPrice || 0) + 1));
      setRelistAmount(String(Math.max((nextAuction.startingPrice || 1) - 1, 1)));
    } catch {
      toast.error('Error fetching listing');
    } finally {
      setLoading(false);
    }
  }, [id, user?._id, user?.token]);

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAuction();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

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
  }, [fetchAuction, id, user?.token]);

  useEffect(() => {
    setShippingDetails((prev) => ({
      ...prev,
      name: user?.name || prev.name || '',
    }));
  }, [user?.name]);

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

  const handlePlaceBid = async (event) => {
    event.preventDefault();
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

  const handlePayment = async (event) => {
    event.preventDefault();
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

  return {
    user,
    auction,
    loading,
    bidAmount,
    setBidAmount,
    isShippingModalOpen,
    setIsShippingModalOpen,
    relistAmount,
    setRelistAmount,
    shippingDetails,
    setShippingDetails,
    registrationRemainingMs,
    turnRemainingMs,
    roomActivationRemainingMs,
    handleRegister,
    handleOpenAuctionRoom,
    handlePlaceBid,
    handleGiveUp,
    handleNoRegistrationDecision,
    handlePayment,
    handleConfirmReceived,
  };
};
