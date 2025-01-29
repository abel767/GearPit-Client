import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';



export const fetchWalletDetails = createAsyncThunk(
  'wallet/fetchDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/user/wallet/${userId}`, {
        withCredentials: true
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh token through axiosInstance interceptor
        try {
          const retryResponse = await axiosInstance.get(`/user/wallet/${userId}`, {
            withCredentials: true
          });
          return retryResponse.data.data;
        } catch (retryError) {
          return rejectWithValue(retryError.response?.data || 'Failed to fetch wallet details');
        }
      }
      return rejectWithValue(error.response?.data || 'Failed to fetch wallet details');
    }
  }
);

export const processPayment = createAsyncThunk(
  'wallet/processPayment',
  async ({ userId, orderId, amount }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/user/wallet/payment', {
        userId,
        orderId,
        amount
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Payment processing failed');
    }
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