import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAllAuctions } from '../../redux/auctionSlice';

export const useBidderDashboardData = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    if (!user?._id) return;
    dispatch(
      getAllAuctions({
        includeBids: true,
        includeRegistrations: true,
        force: true,
        limit: 200,
      })
    );
  }, [dispatch, user?._id]);

  const registeredFuture = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          auction.status === 'future' &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user?._id))
      ),
    [auctions, user?._id]
  );

  const activeSessions = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          auction.status === 'ongoing' &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user?._id))
      ),
    [auctions, user?._id]
  );

  const wonAuctions = useMemo(
    () => auctions.filter((auction) => String(auction.winner) === String(user?._id)),
    [auctions, user?._id]
  );

  const previousParticipations = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed'].includes(auction.status) &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user?._id))
      ),
    [auctions, user?._id]
  );

  const registrationCoverage = useMemo(() => {
    const possibleFuture = auctions.filter((item) => item.status === 'future').length;
    if (!possibleFuture) return 0;
    return Math.min(100, Math.round((registeredFuture.length / possibleFuture) * 100));
  }, [auctions, registeredFuture.length]);

  return {
    isLoading,
    registeredFuture,
    activeSessions,
    wonAuctions,
    previousParticipations,
    registrationCoverage,
  };
};
