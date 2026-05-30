const VERIFICATION_UI_STORAGE_PREFIX = 'auctionpulse_profile_verification_ui';

export const getVerificationUiStorageKey = (user) => {
  const stableId = user?._id || user?.id || user?.email;
  return stableId ? `${VERIFICATION_UI_STORAGE_PREFIX}:${stableId}` : null;
};

export const readVerificationUiState = (user) => {
  if (typeof window === 'undefined') return null;
  const storageKey = getVerificationUiStorageKey(user);
  if (!storageKey) return null;

  try {
    return JSON.parse(sessionStorage.getItem(storageKey) || 'null');
  } catch {
    return null;
  }
};

export const writeVerificationUiState = (user, state) => {
  if (typeof window === 'undefined') return;
  const storageKey = getVerificationUiStorageKey(user);
  if (!storageKey) return;
  sessionStorage.setItem(storageKey, JSON.stringify(state));
};

export const clearVerificationUiState = (user) => {
  if (typeof window === 'undefined') return;
  const storageKey = getVerificationUiStorageKey(user);
  if (!storageKey) return;
  sessionStorage.removeItem(storageKey);
};
