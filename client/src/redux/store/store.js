import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../themeSlice/themeSlice';
import cartReducer from '../cartSlice/cartSlice';
import storage from 'redux-persist/lib/storage'; // Default localStorage
import { persistReducer, persistStore } from 'redux-persist';
import { newsLetterAuthApi } from '../newsLetterAuthApi/newsLetterAuthApi';
import userAuthApi from '../userAuthApi/userAuthApi';
import profileAuthApi from '../profileAuthApi/profileAuthApi';
import { bookAuthApi } from '../bookAuthApi/bookAuthApi';
import { orderAuthApi } from '../orderAuthApi/orderAuthApi';
import { flutterwaveAuthApi } from '../flutterwaveAuthApi/flutterwaveAuthApi';




const persistConfig = {
  key: 'cart',  // Only persist the 'cart' state
  storage,
  whitelist: ['cartItems', 'books', 'popularBooks', 'yearBooks'], // Specify what to persist
};

const persistedCartReducer = persistReducer(persistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    cart: persistedCartReducer,
    [newsLetterAuthApi.reducerPath]: newsLetterAuthApi.reducer,
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [profileAuthApi.reducerPath]: profileAuthApi.reducer,
    [bookAuthApi.reducerPath]: bookAuthApi.reducer,
    [orderAuthApi.reducerPath]: orderAuthApi.reducer,
    [flutterwaveAuthApi.reducerPath]: flutterwaveAuthApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Ignore persist actions
        ignoredPaths: ['cart.register'], // Ignore non-serializable paths
      },
    }).concat(newsLetterAuthApi.middleware, userAuthApi.middleware, profileAuthApi.middleware, bookAuthApi.middleware, orderAuthApi.middleware, flutterwaveAuthApi.middleware),
});

export const persistor = persistStore(store);
