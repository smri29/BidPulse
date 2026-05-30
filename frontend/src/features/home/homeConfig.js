export const WATCHLIST_KEY = 'AuctionPulse_watchlist';
export const LEGACY_WATCHLIST_KEY = 'rizbid_watchlist';

export const HERO_MESSAGES = [
  'Verified Auction Intelligence',
  'Queue-Based Live Auctions',
  'Managed Fulfillment You Can Trust',
];

export const PHASES = [
  { id: 'future', label: 'Upcoming Auctions', statuses: ['future'] },
  { id: 'ongoing', label: 'Live Auctions', statuses: ['ongoing'] },
  {
    id: 'previous',
    label: 'Past Auctions',
    statuses: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed', 'no_registrations', 'withdrawn', 'disapproved'],
  },
];

export const loadWatchlist = () => {
  try {
    const current = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || 'null');
    if (Array.isArray(current)) return current;

    const legacy = JSON.parse(localStorage.getItem(LEGACY_WATCHLIST_KEY) || 'null');
    if (Array.isArray(legacy)) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(legacy));
      return legacy;
    }
    return [];
  } catch {
    return [];
  }
};
