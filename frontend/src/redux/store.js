import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import auctionReducer from './auctionSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    auction: auctionReducer,
    notifications: notificationReducer,
  },
});
