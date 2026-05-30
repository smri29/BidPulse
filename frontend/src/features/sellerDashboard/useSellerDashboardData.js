/**
 * Module: features/sellerDashboard/useSellerDashboardData.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Seller Dashboard Data flow.
 */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deleteAuction, getAllAuctions } from '../../redux/auctionSlice';

export const useSellerDashboardData = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const [selectedListingId, setSelectedListingId] = useState(null);

  useEffect(() => {
    if (!user?._id) return;

    dispatch(
      getAllAuctions({
        seller: user._id,
        includeRegistrations: true,
        includeBids: true,
        force: true,
        limit: 300,
      })
    );
  }, [dispatch, user?._id]);

  const myAuctions = useMemo(
    () => auctions.filter((auction) => String(auction.seller?._id || auction.seller) === String(user?._id)),
    [auctions, user?._id]
  );

  const selectedListing = useMemo(
    () => myAuctions.find((item) => item._id === selectedListingId) || null,
    [myAuctions, selectedListingId]
  );

  const metrics = useMemo(() => {
    const totalListings = myAuctions.length;
    const liveListings = myAuctions.filter((auction) => ['future', 'ongoing'].includes(auction.status)).length;
    const totalRegistrations = myAuctions.reduce((sum, auction) => sum + (auction.registrations?.length || 0), 0);
    const totalBids = myAuctions.reduce((sum, auction) => sum + (auction.bids?.length || 0), 0);
    const releasedEarnings = myAuctions
      .filter((auction) => auction.status === 'closed')
      .reduce((sum, auction) => sum + auction.currentPrice * 0.95, 0);
    const pipelineEarnings = myAuctions
      .filter((auction) => ['completed', 'paid_shipping_pending', 'paid_held_in_escrow'].includes(auction.status))
      .reduce((sum, auction) => sum + auction.currentPrice * 0.95, 0);
    const topBid = myAuctions.reduce((max, auction) => Math.max(max, Number(auction.currentPrice || 0)), 0);

    return {
      totalListings,
      liveListings,
      totalRegistrations,
      totalBids,
      releasedEarnings,
      pipelineEarnings,
      topBid,
    };
  }, [myAuctions]);

  const statusDistribution = useMemo(() => {
    const map = {};
    myAuctions.forEach((auction) => {
      map[auction.status] = (map[auction.status] || 0) + 1;
    });

    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => right.count - left.count);
  }, [myAuctions]);

  const bidTrend = useMemo(
    () =>
      myAuctions
        .map((auction) => ({
          id: auction._id,
          label: auction.title,
          createdAt: new Date(auction.createdAt).getTime(),
          bidCount: auction.bids?.length || 0,
        }))
        .sort((left, right) => left.createdAt - right.createdAt),
    [myAuctions]
  );

  const listingInsights = useMemo(
    () =>
      [...myAuctions]
        .map((auction) => {
          const registrationCount = auction.registrations?.length || 0;
          const bidCount = auction.bids?.length || 0;
          const intensity = registrationCount > 0 ? (bidCount / registrationCount).toFixed(2) : '0.00';
          const lastBid = bidCount > 0 ? auction.bids[bidCount - 1] : null;
          return { ...auction, registrationCount, bidCount, intensity, lastBid };
        })
        .sort((left, right) => right.bidCount - left.bidCount)
        .slice(0, 6),
    [myAuctions]
  );

  const handleDelete = (id) => {
    if (window.confirm('Delete this listing permanently?')) {
      dispatch(deleteAuction(id));
      if (selectedListingId === id) setSelectedListingId(null);
    }
  };

  return {
    user,
    isLoading,
    myAuctions,
    selectedListingId,
    setSelectedListingId,
    selectedListing,
    metrics,
    statusDistribution,
    bidTrend,
    listingInsights,
    handleDelete,
  };
};
