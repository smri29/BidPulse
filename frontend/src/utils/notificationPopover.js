const DISMISSED_STORAGE_PREFIX = 'AuctionPulse_notificationPopoverHidden';
export const NOTIFICATION_POPOVER_EVENT = 'auctionpulse:notification-popover-hidden-change';

export const getDismissedStorageKey = (ownerKey) =>
  `${DISMISSED_STORAGE_PREFIX}:${ownerKey || 'guest'}`;

export const readDismissedNotificationIds = (ownerKey) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(getDismissedStorageKey(ownerKey)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const persistDismissedNotificationIds = (ownerKey, ids) => {
  localStorage.setItem(getDismissedStorageKey(ownerKey), JSON.stringify(ids));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_POPOVER_EVENT, {
        detail: { ownerKey, ids },
      })
    );
  }
};
