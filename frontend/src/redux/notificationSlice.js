import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'RiZBiD_notifications';

const loadNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const persistNotifications = (notifications) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: loadNotifications(),
  },
  reducers: {
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
      persistNotifications(state.items);
    },
    markNotificationRead: (state, action) => {
      state.items = state.items.map((item) =>
        item.id === action.payload ? { ...item, read: true } : item
      );
      persistNotifications(state.items);
    },
    markAllNotificationsRead: (state) => {
      state.items = state.items.map((item) => ({ ...item, read: true }));
      persistNotifications(state.items);
    },
    clearNotifications: (state) => {
      state.items = [];
      persistNotifications(state.items);
    },
  },
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

