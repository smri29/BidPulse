import React from 'react';
import { CheckCircle, Hand, Package, Truck } from 'lucide-react';

const AuctionActionsPanel = ({
  auction,
  canRegister,
  isRegistered,
  registrationClosed,
  roomActivationActive,
  isCurrentRoomActivator,
  roomActivationCountdown,
  canBid,
  bidAmount,
  setBidAmount,
  handleRegister,
  handleOpenAuctionRoom,
  handlePlaceBid,
  isActiveBidder,
  isCurrentTurn,
  canGiveUp,
  handleGiveUp,
  isOwner,
  relistAmount,
  setRelistAmount,
  handleNoRegistrationDecision,
  isWinner,
  setIsShippingModalOpen,
  handleConfirmReceived,
}) => (
  <div className="mt-8 space-y-3">
    {canRegister && (
      <button onClick={handleRegister} className="w-full rounded-lg bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700">
        Register For Auction
      </button>
    )}
    {auction.status === 'future' && isRegistered && (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Registered successfully. Reminder email will be sent 5 minutes before the auction goes live.
      </div>
    )}
    {auction.status === 'future' && registrationClosed && roomActivationActive && isCurrentRoomActivator && (
      <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          It is your turn to open the auction room for everyone. This window expires in <b>{roomActivationCountdown}</b>.
        </p>
        <button onClick={handleOpenAuctionRoom} className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700">
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
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Spectator mode enabled. You can watch this live auction session.
      </div>
    )}
    {auction.status === 'ongoing' && canBid && (
      <form onSubmit={handlePlaceBid} className="flex gap-3">
        <input
          type="number"
          value={bidAmount}
          onChange={(event) => setBidAmount(event.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-3"
          min={auction.currentPrice + 1}
          required
        />
        <button type="submit" className="rounded-lg bg-bid-purple px-6 py-3 font-bold text-white transition hover:bg-blue-700">
          Place Offer
        </button>
      </form>
    )}
    {auction.status === 'ongoing' && isActiveBidder && !isCurrentTurn && (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Waiting for your turn. Each active turn is 20 seconds.
      </div>
    )}
    {canGiveUp && (
      <button onClick={handleGiveUp} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700">
        <Hand size={16} /> Give Up
      </button>
    )}
    {auction.status === 'no_registrations' && isOwner && (
      <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">No participant registrations found. Choose the next step:</p>
        <button onClick={() => handleNoRegistrationDecision('withdraw')} className="w-full rounded-lg bg-gray-900 py-2.5 font-semibold text-white">
          Withdraw Product ($9.99 fee)
        </button>
        <div className="flex gap-2">
          <input
            type="number"
            value={relistAmount}
            min={1}
            onChange={(event) => setRelistAmount(event.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Reduced starting amount"
          />
          <button onClick={() => handleNoRegistrationDecision('relist')} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">
            Relist ($14.99)
          </button>
        </div>
      </div>
    )}
    {auction.status === 'closed' ? (
      <div className="rounded-xl bg-gray-800 p-6 text-center text-white">
        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
        <h3 className="text-xl font-bold">Transaction Complete</h3>
      </div>
    ) : auction.status === 'paid_shipping_pending' || auction.status === 'paid_held_in_escrow' ? (
      isWinner ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <Package className="mx-auto mb-2 h-8 w-8 text-blue-600" />
          <h3 className="mb-1 text-lg font-bold text-blue-800">Shipping in Progress</h3>
          <p className="mb-3 text-sm text-blue-700">AuctionPulse will deliver within 7-14 days.</p>
          <button onClick={handleConfirmReceived} className="w-full rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition hover:bg-blue-700">
            Product Received
          </button>
        </div>
      ) : null
    ) : auction.status === 'completed' && isWinner ? (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="mb-2 text-xl font-bold text-green-800">You Won</h3>
        <button onClick={() => setIsShippingModalOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-3 font-bold text-white transition hover:bg-green-700">
          <Truck size={20} /> Proceed to Payment
        </button>
      </div>
    ) : null}
  </div>
);

export default AuctionActionsPanel;
