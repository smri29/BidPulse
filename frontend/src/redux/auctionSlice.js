import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Auction slice focuses on collection-level listing operations used across
// the homepage and dashboards.
export const createAuction = createAsyncThunk(
  'auctions/create',
  async (auctionData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const response = await axios.post('/auctions', auctionData, {
        ...getConfig(token),
        timeout: 90000,
      });
      return response.data;
    } catch (error) {
      const message =
        // Large image uploads are the main case where timeout messaging needs to be more descriptive.
        error.code === 'ECONNABORTED'
          ? 'Upload is taking longer than expected. Please check your seller dashboard before retrying.'
          : error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllAuctions = createAsyncThunk(
  'auctions/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await axios.get('/auctions', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteAuction = createAsyncThunk(
  'auctions/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await axios.delete(`/auctions/${id}`, getConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const auctionSlice = createSlice({
  name: 'auction',
  initialState: {
    auctions: [],
    auction: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
    lastFetchedAt: 0,
  },
  reducers: {
    reset: (state) => {
      // reset is mainly used by the create-auction page after submission attempts.
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAuction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.auctions.unshift(action.payload);
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllAuctions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAuctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auctions = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(getAllAuctions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.auctions = state.auctions.filter((a) => a._id !== action.payload);
      });
  },
});

export const { reset } = auctionSlice.actions;
export default auctionSlice.reducer;
