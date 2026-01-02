import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig'; // Using centralized config

// Helper to get token
const getConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 1. Create Auction
export const createAuction = createAsyncThunk(
  'auctions/create',
  async (auctionData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // UPDATED: Use relative path '/auctions'
      const response = await axios.post('/auctions', auctionData, getConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 2. Get All Auctions (Public)
export const getAllAuctions = createAsyncThunk(
  'auctions/getAll',
  async (_, thunkAPI) => {
    try {
      // UPDATED: Use relative path '/auctions'
      const response = await axios.get('/auctions');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. Delete Auction (Seller/Admin)
export const deleteAuction = createAsyncThunk(
  'auctions/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // UPDATED: Use relative path '/auctions/:id'
      await axios.delete(`/auctions/${id}`, getConfig(token));
      return id; // Return ID to remove it from state
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
    auction: null, // Single auction details
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAuction.pending, (state) => { state.isLoading = true; })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.auctions.push(action.payload);
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllAuctions.pending, (state) => { state.isLoading = true; })
      .addCase(getAllAuctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auctions = action.payload;
      })
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.auctions = state.auctions.filter((a) => a._id !== action.payload);
      });
  },
});

export const { reset } = auctionSlice.actions;
export default auctionSlice.reducer;