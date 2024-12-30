import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching profile data
export const fetchProfileData = createAsyncThunk(
  'profile/fetchProfileData',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    userData: null,
    loading: false,
    error: null,
    isEditing: false
  },
  reducers: {
    setEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    resetProfile: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
      state.isEditing = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.isEditing = false;
      });
  }
});

export const { setEditing, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;