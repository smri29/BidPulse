const DEFAULT_AUCTION_IMAGE = 'https://via.placeholder.com/900x600?text=RiZBiD+Listing';

export const toSafeImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_AUCTION_IMAGE;
  const trimmed = rawUrl.trim();
  if (!trimmed) return DEFAULT_AUCTION_IMAGE;

  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice(7)}`;
  return trimmed;
};

export const getAuctionImage = (images) => {
  if (Array.isArray(images) && images.length > 0) {
    const firstValid = images.find((item) => typeof item === 'string' && item.trim());
    if (firstValid) return toSafeImageUrl(firstValid);
  }
  return DEFAULT_AUCTION_IMAGE;
};

export const handleAuctionImageError = (event) => {
  const target = event?.currentTarget;
  if (!target) return;
  if (target.dataset?.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = DEFAULT_AUCTION_IMAGE;
};

