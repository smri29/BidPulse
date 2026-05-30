export const SELLER_MODE_PATHS = ['/dashboard/seller', '/create-auction', '/edit-auction'];
export const BIDDER_MODE_PATHS = ['/dashboard/bidder', '/auction'];
export const MODE_KEY = 'AuctionPulse_dashboard_mode';
export const LEGACY_MODE_KEY = 'RiZBiD_dashboard_mode';

export const NAV_LINKS = [
  { to: '/', label: 'Auctions' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/safety', label: 'Safety' },
];

export const readPreferredMode = () => {
  if (typeof window === 'undefined') return 'bidder';
  const stored = localStorage.getItem(MODE_KEY) || localStorage.getItem(LEGACY_MODE_KEY);
  return stored === 'seller' ? 'seller' : 'bidder';
};

export const persistPreferredMode = (mode) => {
  localStorage.setItem(MODE_KEY, mode);
  localStorage.setItem(LEGACY_MODE_KEY, mode);
};

export const getModeFromPath = (path) => {
  if (SELLER_MODE_PATHS.some((sellerPath) => path.startsWith(sellerPath))) return 'seller';
  if (BIDDER_MODE_PATHS.some((bidderPath) => path.startsWith(bidderPath))) return 'bidder';
  return null;
};
