export const deriveAuctionViewState = ({
  auction,
  user,
  registrationRemainingMs,
}) => {
  const sellerId = auction.seller?._id || auction.seller;
  const winnerId = auction.winner?._id || auction.winner;
  const userId = String(user?._id || '');
  const isOwner = user && String(sellerId) === userId;
  const isWinner = user && String(winnerId) === userId;

  const myRegistration = auction.registrations?.find(
    (entry) => String(entry.bidder?._id || entry.bidder) === userId
  );
  const currentRoomActivatorId = String(
    auction.roomActivation?.currentBidder?._id || auction.roomActivation?.currentBidder || ''
  );
  const isRegistered = Boolean(myRegistration);
  const isActiveBidder = auction.activeBidders?.some(
    (bidder) => String(bidder?._id || bidder) === userId
  );
  const isCurrentTurn =
    String(auction.currentTurnBidder?._id || auction.currentTurnBidder) === userId;
  const registrationClosed = auction.status === 'future' && registrationRemainingMs === 0;
  const roomActivationActive = Boolean(auction.roomActivation?.isActive && currentRoomActivatorId);
  const isCurrentRoomActivator = roomActivationActive && currentRoomActivatorId === userId;

  return {
    isOwner,
    isWinner,
    myRegistration,
    isRegistered,
    isActiveBidder,
    isCurrentTurn,
    registrationClosed,
    roomActivationActive,
    isCurrentRoomActivator,
    canRegister:
      user && auction.status === 'future' && registrationRemainingMs > 0 && !isOwner && !isRegistered,
    canBid: user && auction.status === 'ongoing' && isActiveBidder && isCurrentTurn && user.emailVerified,
    canGiveUp: user && auction.status === 'ongoing' && isActiveBidder,
  };
};
