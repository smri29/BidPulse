import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import auctionReducer from './auctionSlice';
import notificationReducer from './notificationSlice';

// Active Redux domains:
// - auth: session, profile, verification, activity
// - auction: listing collections and create/delete state
// - notifications: local notification timeline and read state
export const store = configureStore({
  reducer: {
    auth: authReducer,
    auction: auctionReducer,
    notifications: notificationReducer,
  },
});
