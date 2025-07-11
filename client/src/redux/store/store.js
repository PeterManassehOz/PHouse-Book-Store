// store.js (fixed)
import { configureStore } from '@reduxjs/toolkit';      // ← drop getDefaultMiddleware
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist';

import themeReducer             from '../themeSlice/themeSlice';
import cartReducer              from '../cartSlice/cartSlice';
import { newsLetterAuthApi }    from '../newsLetterAuthApi/newsLetterAuthApi';
import userAuthApi              from '../userAuthApi/userAuthApi';
import profileAuthApi           from '../profileAuthApi/profileAuthApi';
import { bookAuthApi }          from '../bookAuthApi/bookAuthApi';
import { orderAuthApi }         from '../orderAuthApi/orderAuthApi';
import { flutterwaveAuthApi }   from '../flutterwaveAuthApi/flutterwaveAuthApi';

// Persist config for cart slice
const cartPersistConfig = {
  key:       'cart',
  storage,
  whitelist: ['cartItems', 'books', 'popularBooks', 'yearBooks'],
};
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Combine all reducers
const appReducer = combineReducers({
  theme:    themeReducer,
  cart:     persistedCartReducer,
  [newsLetterAuthApi.reducerPath]:   newsLetterAuthApi.reducer,
  [userAuthApi.reducerPath]:         userAuthApi.reducer,
  [profileAuthApi.reducerPath]:      profileAuthApi.reducer,
  [bookAuthApi.reducerPath]:         bookAuthApi.reducer,
  [orderAuthApi.reducerPath]:        orderAuthApi.reducer,
  [flutterwaveAuthApi.reducerPath]:  flutterwaveAuthApi.reducer,
});

// Root reducer to catch logout
const rootReducer = (state, action) => {
  if (action.type === 'user/logout') {
    storage.removeItem('persist:cart');
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      newsLetterAuthApi.middleware,
      userAuthApi.middleware,
      profileAuthApi.middleware,
      bookAuthApi.middleware,
      orderAuthApi.middleware,
      flutterwaveAuthApi.middleware
    ),
});

export const persistor = persistStore(store);
