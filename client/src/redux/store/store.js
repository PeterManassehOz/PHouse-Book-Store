// store.js
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { combineReducers }                                  from 'redux';
import themeReducer                                         from '../themeSlice/themeSlice';
import cartReducer                                          from '../cartSlice/cartSlice';
import storage                                              from 'redux-persist/lib/storage'; // Default localStorage
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

import { newsLetterAuthApi }    from '../newsLetterAuthApi/newsLetterAuthApi';
import userAuthApi              from '../userAuthApi/userAuthApi';
import profileAuthApi           from '../profileAuthApi/profileAuthApi';
import { bookAuthApi }          from '../bookAuthApi/bookAuthApi';
import { orderAuthApi }         from '../orderAuthApi/orderAuthApi';
import { flutterwaveAuthApi }   from '../flutterwaveAuthApi/flutterwaveAuthApi';

// 1️⃣ Persist only cart slice
const cartPersistConfig = {
  key:       'cart',
  storage,
  whitelist: ['cartItems', 'books', 'popularBooks', 'yearBooks'],
};
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// 2️⃣ Combine all slices + RTK-Query reducers
const appReducer = combineReducers({
  theme:    themeReducer,
  cart:     persistedCartReducer,
  [newsLetterAuthApi.reducerPath]:     newsLetterAuthApi.reducer,
  [userAuthApi.reducerPath]:           userAuthApi.reducer,
  [profileAuthApi.reducerPath]:        profileAuthApi.reducer,
  [bookAuthApi.reducerPath]:           bookAuthApi.reducer,
  [orderAuthApi.reducerPath]:          orderAuthApi.reducer,
  [flutterwaveAuthApi.reducerPath]:    flutterwaveAuthApi.reducer,
});

// 3️⃣ Wrap in a root reducer that wipes everything when we dispatch “user/logout”
const rootReducer = (state, action) => {
  if (action.type === 'user/logout') {
    // Remove persisted cart from disk so nothing rehydrates next load
    storage.removeItem('persist:cart');
    // Re-run the combined reducers with state=undefined → everything resets
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }).concat(
    newsLetterAuthApi.middleware,
    userAuthApi.middleware,
    profileAuthApi.middleware,
    bookAuthApi.middleware,
    orderAuthApi.middleware,
    flutterwaveAuthApi.middleware,
  ),
});

export const persistor = persistStore(store);
