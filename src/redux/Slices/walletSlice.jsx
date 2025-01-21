import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';



export const fetchWalletDetails = createAsyncThunk(
  'wallet/fetchDetails',
  async (userId) => {
    const response = await axiosInstance.get(`/user/wallet/${userId}`);
    return response.data.data;
  }
);

export const processPayment = createAsyncThunk(
  'wallet/processPayment',
  async ({ userId, orderId, amount }) => {
    const response = await axiosInstance.post('/user/wallet/payment', {
      userId,
      orderId,
      amount
    });
    return response.data;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    monthlySpending: 0,
    transactions: [],
    loading: false,
    error: null,
    paymentStatus: null
  },
  reducers: {
    clearPaymentStatus: (state) => {
      state.paymentStatus = null;
    }
  },
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
      })
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.paymentStatus = 'processing';
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = 'success';
        state.balance = action.payload.data.newBalance;
        state.transactions = [...state.transactions, action.payload.data.transaction];
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.paymentStatus = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { clearPaymentStatus } = walletSlice.actions;
export default walletSlice.reducer;