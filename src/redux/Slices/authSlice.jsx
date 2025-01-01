import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
      isAuthenticated: false,
      user: null,
      role: null
    },
    reducers: {
      login: (state, action) => {
        const { user } = action.payload;
        state.isAuthenticated = true;
        state.user = {
          _id: user.id || user._id, // Handle both id formats
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          ...user
        };
        state.role = user.isAdmin ? 'admin' : 'user';
      },
      logout: (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
      }
    }
  });

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;