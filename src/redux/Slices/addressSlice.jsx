import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/user/address/${userId}`);
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async ({ userId, addressData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/user/address/${userId}`, addressData);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ userId, addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/user/address/${userId}/${addressId}`, addressData);
      return response.data.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/user/address/${userId}/${addressId}`);
      if (response.data.success) {
        return response.data.data?.addresses || [];
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch addresses';
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      });
  },
});

export default addressSlice.reducer;