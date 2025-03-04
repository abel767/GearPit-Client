import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Add just the clearCartAsync thunk
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/user/cart/clear/${userId}`);
      if (response.status === 200) {
        return true;
      }
      throw new Error('Failed to clear cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    stockAlerts: {}
  },
  reducers: {
    // Keep all your existing reducers
    addToCart: (state, action) => {
      const { product, quantity, variant } = action.payload;
      
      if (!variant.stock) {
        return;
      }
    
      const existingItemIndex = state.items.findIndex(
        item => 
          item.productId === product._id && 
          item.variantId === variant._id.toString()
      );
    
      if (existingItemIndex >= 0) {
        const newQuantity = Math.min(
          state.items[existingItemIndex].quantity + quantity,
          variant.stock
        );
        
        state.items[existingItemIndex].quantity = newQuantity;
        state.items[existingItemIndex].stock = variant.stock;
        
        if (newQuantity !== state.items[existingItemIndex].quantity + quantity) {
          if (!state.stockAlerts) state.stockAlerts = {};
          state.stockAlerts[`${product._id}-${variant._id}`] = {
            type: 'quantity_adjusted',
            message: `Only ${variant.stock} items available`
          };
        }
      } else {
        state.items.push({
          productId: product._id,
          variantId: variant._id.toString(),
          name: product.productName,
          price: variant.price,
          finalPrice: variant.finalPrice,
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
      if (state.stockAlerts) {
        delete state.stockAlerts[`${productId}-${variantId}`];
      }
    },
    
    updateQuantity: (state, action) => {
      const { productId, variantId, quantity, availableStock } = action.payload;
      const itemIndex = state.items.findIndex(
        item => item.productId === productId && item.variantId === variantId.toString()
      );
      
      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        const newQuantity = Math.max(1, Math.min(quantity, availableStock || item.stock));
        
        if (newQuantity !== quantity) {
          if (!state.stockAlerts) state.stockAlerts = {};
          state.stockAlerts[`${productId}-${variantId}`] = {
            type: 'stock_limit',
          };
        }
        
        item.quantity = newQuantity;
        if (availableStock !== undefined) {
          item.stock = availableStock;
        }
      }
    },

    setStockAlert: (state, action) => {
      const { productId, variantId, message } = action.payload;
      if (!state.stockAlerts) state.stockAlerts = {};
      state.stockAlerts[`${productId}-${variantId}`] = {
        message
      };
    },

    clearStockAlert: (state, action) => {
      const { productId, variantId } = action.payload;
      if (state.stockAlerts) {
        delete state.stockAlerts[`${productId}-${variantId}`];
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.stockAlerts = {};
    },
    
    setCartItems: (state, action) => {
      state.items = action.payload
        .filter(item => item.stock > 0)
        .map(item => ({
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
  },
  // Add just the clearCartAsync cases
  extraReducers: (builder) => {
    builder
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.stockAlerts = {};
        state.loading = false;
        state.error = null;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  setCartItems,
  clearStockAlert,
  setStockAlert
} = cartSlice.actions;

export default cartSlice.reducer;