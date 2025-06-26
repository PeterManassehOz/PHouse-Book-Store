// store.js
import { combineReducers } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
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
import storage from 'redux-persist/lib/storage';

import themeReducer from '../themeSlice/themeSlice';
import cartReducer from '../cartSlice/cartSlice';
import { newsLetterAuthApi }  from '../newsLetterAuthApi/newsLetterAuthApi';
import userAuthApi           from '../userAuthApi/userAuthApi';
import profileAuthApi        from '../profileAuthApi/profileAuthApi';
import { bookAuthApi }       from '../bookAuthApi/bookAuthApi';
import { orderAuthApi }      from '../orderAuthApi/orderAuthApi';
import { flutterwaveAuthApi }from '../flutterwaveAuthApi/flutterwaveAuthApi';

// 1️⃣ configure your cart-persist
const cartPersistConfig = {
  key:   'cart',
  storage,
  whitelist: ['cartItems', 'books', 'popularBooks', 'yearBooks'],
};
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// 2️⃣ combine your slices & RTK Query reducers
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

// 3️⃣ wrap in a root reducer that catches logout
const rootReducer = (state, action) => {
  if (action.type === 'user/logout') {
    // nuke the persisted storage key — so on next load there is nothing to rehydrate
    storage.removeItem('persist:cart');
    // you could also remove 'persist:root' if you ever persisted more slices under key 'root'
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      // you need to ignore redux-persist action types
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    }
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
