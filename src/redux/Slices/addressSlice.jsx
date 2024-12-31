import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/user';

// Async thunks for address operations
export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/address/${userId}`);
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
        const response = await axios.post(`${BASE_URL}/address/${userId}`, addressData);
        console.log('Server response:', response.data);
        if (response.data.success) {
          return response.data.data.addresses;
        } else {
          return rejectWithValue(response.data.message || 'Failed to add address');
        }
      } catch (error) {
        console.error('Error in addAddress:', error.response?.data || error.message);
        return rejectWithValue(error.response?.data?.message || 'Failed to add address');
      }
    }
  );

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ userId, addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/address/${userId}/${addressId}`, addressData);
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/address/${userId}/${addressId}`);
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch addresses';
      })
      // Add address
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add address';
      })
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update address';
      })
      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete address';
      });
  },
});

export default addressSlice.reducer;