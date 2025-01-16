import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: []
  },
  reducers: {
    setWishlistItems: (state, action) => {
      state.items = action.payload;
    },
    addToWishlist: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    }
  }
});

export const { setWishlistItems, addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;