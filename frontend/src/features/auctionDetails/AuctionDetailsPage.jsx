import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';
import AuctionActionsPanel from './components/sections/AuctionActionsPanel';
import AuctionHistorySection from './components/sections/AuctionHistorySection';
import AuctionOverviewSection from './components/sections/AuctionOverviewSection';
import ShippingDetailsModal from './components/ShippingDetailsModal';
import { deriveAuctionViewState } from './deriveAuctionViewState';
import {
  formatRegistrationCountdown,
  formatRoomActivationCountdown,
  formatTurnCountdown,
} from './formatters';
import { useAuctionDetails } from './useAuctionDetails';

const AuctionDetailsPage = () => {
  const { id } = useParams();
  const {
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
  } = useAuctionDetails(id);

  const registrationCountdown = useMemo(
    () => formatRegistrationCountdown(registrationRemainingMs),
    [registrationRemainingMs]
  );
  const turnCountdown = useMemo(
    () => formatTurnCountdown(turnRemainingMs),
    [turnRemainingMs]
  );
  const roomActivationCountdown = useMemo(
    () => formatRoomActivationCountdown(roomActivationRemainingMs),
    [roomActivationRemainingMs]
  );

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!auction) return <div className="p-10 text-center">Not Found</div>;

  const viewState = deriveAuctionViewState({
    auction,
    user,
    registrationRemainingMs,
  });

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center text-gray-500 transition hover:text-bid-purple">
        <ArrowLeft size={20} className="mr-1" /> Back to Listings
      </Link>

      <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2">
        <div className="relative h-96 bg-gray-100 lg:h-auto">
          <img
            src={getAuctionImage(auction.images)}
            alt={auction.title}
            onError={handleAuctionImageError}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-bid-purple shadow-sm backdrop-blur">
            {auction.category}
          </div>
        </div>

        <div className="flex flex-col justify-between p-8 lg:p-12">
          <div>
            <AuctionOverviewSection
              auction={auction}
              myRegistration={viewState.myRegistration}
              registrationClosed={viewState.registrationClosed}
              registrationCountdown={registrationCountdown}
              roomActivationActive={viewState.roomActivationActive}
              roomActivationCountdown={roomActivationCountdown}
              turnCountdown={turnCountdown}
            />
            <AuctionHistorySection auction={auction} />
          </div>

          <AuctionActionsPanel
            auction={auction}
            canRegister={viewState.canRegister}
            isRegistered={viewState.isRegistered}
            registrationClosed={viewState.registrationClosed}
            roomActivationActive={viewState.roomActivationActive}
            isCurrentRoomActivator={viewState.isCurrentRoomActivator}
            roomActivationCountdown={roomActivationCountdown}
            canBid={viewState.canBid}
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            handleRegister={handleRegister}
            handleOpenAuctionRoom={handleOpenAuctionRoom}
            handlePlaceBid={handlePlaceBid}
            isActiveBidder={viewState.isActiveBidder}
            isCurrentTurn={viewState.isCurrentTurn}
            canGiveUp={viewState.canGiveUp}
            handleGiveUp={handleGiveUp}
            isOwner={viewState.isOwner}
            relistAmount={relistAmount}
            setRelistAmount={setRelistAmount}
            handleNoRegistrationDecision={handleNoRegistrationDecision}
            isWinner={viewState.isWinner}
            setIsShippingModalOpen={setIsShippingModalOpen}
            handleConfirmReceived={handleConfirmReceived}
          />
        </div>
      </div>

      {isShippingModalOpen && (
        <ShippingDetailsModal
          shippingDetails={shippingDetails}
          onChange={(key, value) => setShippingDetails((prev) => ({ ...prev, [key]: value }))}
          onClose={() => setIsShippingModalOpen(false)}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
};

export default AuctionDetailsPage;
