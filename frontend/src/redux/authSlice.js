import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig';
import { getApiErrorMessage } from '../utils/axiosConfig';

const getTokenFromState = (thunkAPI) => thunkAPI.getState().auth.user?.token;

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    if (!token) return thunkAPI.rejectWithValue({ message: 'No active session', shouldLogout: true });
    const response = await axios.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const currentUser = { ...response.data, token };
    localStorage.setItem('user', JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    const status = error.response?.status;
    const serverMessage = String(error.response?.data?.message || '').toLowerCase();
    const shouldLogout =
      status === 401 ||
      (status === 403 &&
        (serverMessage.includes('not authorized') ||
          serverMessage.includes('token') ||
          serverMessage.includes('jwt') ||
          serverMessage.includes('user not found')));

    if (shouldLogout) {
      localStorage.removeItem('user');
    }

    return thunkAPI.rejectWithValue({
      message: getApiErrorMessage(error),
      shouldLogout,
    });
  }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await axios.post('/auth/register', userData, { timeout: 70000 });
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axios.post('/auth/login', userData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.put('/auth/updatedetails', userData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendVerificationOtp = createAsyncThunk('auth/sendVerificationOtp', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/send-verification-otp', {}, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 70000,
    });
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const verifyEmailOtp = createAsyncThunk('auth/verifyEmailOtp', async (otp, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/verify-email-otp', { otp }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (file, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post('/auth/avatar/upload', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const setEmojiAvatar = createAsyncThunk('auth/setEmojiAvatar', async (emoji, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.post('/auth/avatar/emoji', { emoji }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMyActivity = createAsyncThunk('auth/getMyActivity', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    const response = await axios.get('/auth/activity', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (_, thunkAPI) => {
  try {
    const token = getTokenFromState(thunkAPI);
    await axios.delete('/auth/deleteaccount', {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem('user');
  } catch (error) {
    const message = getApiErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
});

let user = null;
try {
  user = JSON.parse(localStorage.getItem('user'));
} catch (_error) {
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.shouldLogout) {
          state.user = null;
          state.isError = true;
          state.message = action.payload?.message || 'Session expired. Please log in again.';
        } else {
          state.message = '';
        }
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = action.payload?.warning || '';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(verifyEmailOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendVerificationOtp.fulfilled, (state) => {
        state.isSuccess = true;
      })
      .addCase(sendVerificationOtp.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(setEmojiAvatar.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(getMyActivity.fulfilled, (state, action) => {
        state.activity = action.payload;
      })
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isSuccess = true;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export const { forceLogout } = authSlice.actions;
export default authSlice.reducer;
