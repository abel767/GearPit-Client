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

// Create persist configs for both user and admin
const userPersistConfig = {
  key: 'user',
  storage,
};

const adminPersistConfig = {
  key: 'admin',
  storage,
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    admin: persistedAdminReducer,
    profile: profileReducer,
    address: addressReducer,
    product: productReducer,
    cart: cartReducer
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