/**
 * Module: features/profile/formatters.js
 * Purpose: Provides display formatting helpers so presentation rules stay out of component bodies.
 */
export const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
};

export const formatDateTime = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
};

export const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
