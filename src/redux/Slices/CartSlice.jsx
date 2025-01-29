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
      
      // Create a unique key combining productId and variantId
      const existingItemIndex = state.items.findIndex(
        item => 
          item.productId === product._id && 
          item.variantId === variant._id.toString() // Ensure string comparison
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        state.items[existingItemIndex].quantity += quantity;
        // Ensure quantity doesn't exceed stock
        state.items[existingItemIndex].quantity = Math.min(
          state.items[existingItemIndex].quantity,
          variant.stock
        );
      } else {
        // Add new item with all variant-specific details
        state.items.push({
          productId: product._id,
          variantId: variant._id.toString(), // Ensure string format
          name: product.productName,
          price: variant.price,
          finalPrice: variant.finalPrice || variant.price * (1 - (variant.discount || 0) / 100),
          quantity: Math.min(quantity, variant.stock),
          image: product.images[0],
          size: variant.size,
          stock: variant.stock
        });
      }
    },
    
    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        item => !(item.productId === productId && item.variantId === variantId.toString())
      );
    },
    
    updateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(
        item => item.productId === productId && item.variantId === variantId.toString()
      );
      
      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
      }
    },
    
    clearCart: (state) => {
      state.items = [];
    },
    
    setCartItems: (state, action) => {
      // Ensure each item has all necessary properties and consistent ID formats
      state.items = action.payload.map(item => ({
        productId: item.productId,
        variantId: item.variantId.toString(),
        name: item.name,
        price: item.price,
        finalPrice: item.finalPrice,
        quantity: Math.min(item.quantity, item.stock),
        image: item.image,
        size: item.size,
        stock: item.stock
      }));
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