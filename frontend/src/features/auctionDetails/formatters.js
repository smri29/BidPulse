/**
 * Module: features/auctionDetails/formatters.js
 * Purpose: Provides display formatting helpers so presentation rules stay out of component bodies.
 */
export const formatRegistrationCountdown = (registrationRemainingMs) => {
  const totalSec = Math.floor(registrationRemainingMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

export const formatTurnCountdown = (turnRemainingMs) => `${Math.floor(turnRemainingMs / 1000)}s`;

export const formatRoomActivationCountdown = (roomActivationRemainingMs) => {
  const totalSec = Math.floor(roomActivationRemainingMs / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
