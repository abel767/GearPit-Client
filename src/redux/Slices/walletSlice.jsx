import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
export const fetchWalletDetails = createAsyncThunk(
  'wallet/fetchDetails',
  async (userId) => {
    const response = await axios.get(`http://localhost:3000/user/wallet/${userId}`);
    return response.data.data;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    monthlySpending: 0,
    transactions: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.monthlySpending = action.payload.monthlySpending;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchWalletDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default walletSlice.reducer;