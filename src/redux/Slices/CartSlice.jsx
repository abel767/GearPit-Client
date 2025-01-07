import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, variant } = action.payload;
      const existingItem = state.items.find(
        item => item.productId === product._id && item.variantId === variant._id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId: product._id,
          variantId: variant._id,
          name: product.productName,
          price: variant.price,
          finalPrice: variant.finalPrice || variant.price * (1 - (variant.discount || 0) / 100),
          quantity: quantity,
          image: product.images[0],
          size: variant.size,
          color: variant.color,
          stock: variant.stock
        });
      }
    },
    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      );
    },
    updateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        item => item.productId === productId && item.variantId === variantId
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartItems: (state, action) => {
      state.items = action.payload;
    }
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  setCartItems 
} = cartSlice.actions;

export default cartSlice.reducer;