import { configureStore } from "@reduxjs/toolkit";
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import profileReducer from './Slices/profileSlice';
import addressReducer from './Slices/addressSlice';
import productReducer from './Slices/productSlice';
import userReducer from './Slices/userSlice';
import adminReducer from './Slices/adminSlice';
import cartReducer from './Slices/CartSlice'
import walletReducer from './Slices/walletSlice'
import wishlistReducer from './Slices/wishlistSlice'

// Create persist configs
const userPersistConfig = {
  key: 'user',
  storage,
};

const adminPersistConfig = {
  key: 'admin',
  storage,
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
};

// Add cart persist config
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'] // Only persist the items array
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);
const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    admin: persistedAdminReducer,
    profile: profileReducer,
    address: addressReducer,
    product: productReducer,
    cart: persistedCartReducer, // Use the persisted cart reducer
    wallet: walletReducer,
    wishlist: persistedWishlistReducer  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };