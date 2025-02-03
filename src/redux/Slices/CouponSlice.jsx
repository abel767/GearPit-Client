import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks
export const fetchAvailableCoupons = createAsyncThunk(
  'coupon/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/valid-coupons`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch coupons');
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          cartTotal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate coupon');
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  availableCoupons: [],
  appliedCoupon: null,
  loading: false,
  error: null
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch available coupons
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCoupons = action.payload;
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAppliedCoupon, clearError } = couponSlice.actions;
export default couponSlice.reducer;