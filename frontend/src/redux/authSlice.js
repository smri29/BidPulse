/**
 * Module: redux/authSlice.js
 * Purpose: Owns Redux state transitions and async lifecycle wiring for this part of the app.
 */
import { createSlice } from '@reduxjs/toolkit';

import { buildAuthExtraReducers } from './auth/authReducerCases';

let user = null;
try {
  user = JSON.parse(localStorage.getItem('user'));
} catch {
  user = null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    activity: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    forceLogout: (state, action) => {
      localStorage.removeItem('user');
      state.user = null;
      state.activity = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = !!action?.payload;
      state.message = action?.payload || '';
    },
  },
  extraReducers: buildAuthExtraReducers,
});

export const { reset, forceLogout } = authSlice.actions;
export * from './auth/authThunks';
export default authSlice.reducer;
