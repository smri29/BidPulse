import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { getApiErrorMessage } from '../../utils/axiosConfig';

const getTokenFromState = (thunkAPI) => thunkAPI.getState().auth.user?.token;

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    if (!token) return thunkAPI.rejectWithValue({ message: 'No active session', shouldLogout: true });
    const response = await axios.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const currentUser = { ...response.data, token };
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
    localStorage.removeItem('user');
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
});
