import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY_PREFIX = 'BidPulse_notifications';
const LEGACY_STORAGE_KEY = 'RiZBiD_notifications';
const GUEST_OWNER_KEY = 'guest';

const parseJson = (value) => {
  try {
    return JSON.parse(value || 'null');
  } catch {
    return null;
  }
};

const getOwnerKey = (user) => {
  if (!user) return GUEST_OWNER_KEY;

  const stableId =
    user._id ||
    user.id ||
    user.email ||
    user.username ||
    user.name;

  if (!stableId) return GUEST_OWNER_KEY;
  return `${user.role || 'user'}:${String(stableId).trim().toLowerCase()}`;
};

const getStorageKey = (ownerKey) => `${STORAGE_KEY_PREFIX}:${ownerKey || GUEST_OWNER_KEY}`;

const getInitialOwnerKey = () => {
  const storedUser = parseJson(localStorage.getItem('user'));
  return getOwnerKey(storedUser);
};

const loadNotifications = (ownerKey) => {
  const scopedNotifications = parseJson(localStorage.getItem(getStorageKey(ownerKey)));
  if (Array.isArray(scopedNotifications)) return scopedNotifications;

  if (ownerKey === GUEST_OWNER_KEY) {
    const legacyNotifications = parseJson(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (Array.isArray(legacyNotifications)) {
      localStorage.setItem(getStorageKey(ownerKey), JSON.stringify(legacyNotifications));
      return legacyNotifications;
    }
  }

  return [];
};

const persistNotifications = (ownerKey, notifications) => {
  localStorage.setItem(getStorageKey(ownerKey), JSON.stringify(notifications));
};

const initialOwnerKey = getInitialOwnerKey();

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    ownerKey: initialOwnerKey,
    items: loadNotifications(initialOwnerKey),
  },
  reducers: {
    setNotificationOwner: (state, action) => {
      const nextOwnerKey = getOwnerKey(action.payload);
      if (state.ownerKey === nextOwnerKey) return;

      state.ownerKey = nextOwnerKey;
      state.items = loadNotifications(nextOwnerKey);
    },
    addNotification: (state, action) => {
      const payload = {
        id: action.payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: action.payload.title || 'Update',
        message: action.payload.message || '',
        type: action.payload.type || 'info',
        createdAt: action.payload.createdAt || new Date().toISOString(),
        read: false,
      };

      const last = state.items[0];
      if (
        last &&
        last.title === payload.title &&
        last.message === payload.message &&
        Math.abs(new Date(payload.createdAt).getTime() - new Date(last.createdAt).getTime()) < 2000
      ) {
        return;
      }

      state.items.unshift(payload);
      state.items = state.items.slice(0, 500);
      persistNotifications(state.ownerKey, state.items);
    },
    markNotificationRead: (state, action) => {
      state.items = state.items.map((item) =>
        item.id === action.payload ? { ...item, read: true } : item
      );
      persistNotifications(state.ownerKey, state.items);
    },
    markAllNotificationsRead: (state) => {
      state.items = state.items.map((item) => ({ ...item, read: true }));
      persistNotifications(state.ownerKey, state.items);
    },
    clearNotifications: (state) => {
      state.items = [];
      persistNotifications(state.ownerKey, state.items);
    },
  },
});

export const {
  setNotificationOwner,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
