/**
 * Module: redux/auth/authThunks.js
 * Purpose: Defines async Redux actions that coordinate API requests and state updates.
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { getApiErrorMessage } from '../../utils/axiosConfig';

// Most authenticated requests need the same bearer token lookup, so it is
// centralized here to keep each thunk focused on its API contract.
const getTokenFromState = (thunkAPI) => thunkAPI.getState().auth.user?.token;

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    if (!token) return thunkAPI.rejectWithValue({ message: 'No active session', shouldLogout: true });
    const response = await axios.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const currentUser = { ...response.data, token };
    // Local storage mirrors the current session so refreshes can restore auth
    // state before Redux refetches the profile.
    localStorage.setItem('user', JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    const status = error.response?.status;
    const serverMessage = String(error.response?.data?.message || '').toLowerCase();
    const shouldLogout = status === 401 || (status === 403 && (serverMessage.includes('not authorized') || serverMessage.includes('token') || serverMessage.includes('jwt') || serverMessage.includes('user not found')));
    if (shouldLogout) localStorage.removeItem('user');
    return thunkAPI.rejectWithValue({ message: getApiErrorMessage(error), shouldLogout });
  }
});

// Many auth endpoints are plain POST requests with the same success/error
// behavior, so this helper removes repetitive thunk boilerplate.
const simplePost = (type, url, timeout) => createAsyncThunk(type, async (payload, thunkAPI) => {
  try {
    const response = await axios.post(url, payload, timeout ? { timeout } : undefined);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const register = simplePost('auth/register', '/auth/register', 70000);
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axios.post('/auth/login', userData);
    // Store the logged-in payload immediately so protected routes can resume
    // without waiting for a second profile fetch.
    if (response.data) localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.put('/auth/updatedetails', userData, { headers: { Authorization: `Bearer ${token}` } });
    // Keep the cached session user aligned with the latest saved profile fields.
    if (response.data) localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const sendVerificationOtp = createAsyncThunk('auth/sendVerificationOtp', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/send-verification-otp', {}, { headers: { Authorization: `Bearer ${token}` }, timeout: 70000 });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const verifyEmailOtp = createAsyncThunk('auth/verifyEmailOtp', async (otp, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/verify-email-otp', { otp }, { headers: { Authorization: `Bearer ${token}` } });
    // Verification may return an updated user object, so the local cache is
    // refreshed when the server includes one.
    if (response.data?.user) localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const startProfileVerification = createAsyncThunk('auth/startProfileVerification', async (formData, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/profile-verification/start', formData, { headers: { Authorization: `Bearer ${token}` }, timeout: 70000 });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const verifyProfileOtp = createAsyncThunk('auth/verifyProfileOtp', async (otp, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/profile-verification/verify-otp', { otp }, { headers: { Authorization: `Bearer ${token}` } });
    if (response.data?.user) localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (file, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    // Avatar uploads are sent as multipart form data because the backend
    // expects a binary file under the `avatar` field name.
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post('/auth/avatar/upload', formData, { headers: { Authorization: `Bearer ${token}` } });
    if (response.data?.user) localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const getMyActivity = createAsyncThunk('auth/getMyActivity', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.get('/auth/activity', { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    await axios.delete('/auth/deleteaccount', { headers: { Authorization: `Bearer ${token}` } });
    // Once the backend deletes the account, the local session cache must go too.
    localStorage.removeItem('user');
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  // Logout is intentionally client-side only because the API uses stateless JWTs.
  localStorage.removeItem('user');
});
