import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../themeSlice/themeSlice';
import { adminBookAuthApi } from "../adminBookAuthApi/adminBookAuthApi";
import adminAuthApi from "../adminAuthApi/adminAuthApi";
import { flutterwaveAdminAuthApi } from '../flutterwaveAdminAuthApi/flutterwaveAdminAuthApi';
import { adminOrderAuthApi } from "../adminOrderAuthApi/adminOrderAuthApi";
import { ordersByAdminAuthApi } from "../ordersByAdminAuthApi/ordersByAdminAuthApi";
import { subscribersAuthApi } from "../subscribersAuthApi/subscribersAuthApi";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    [adminBookAuthApi.reducerPath]: adminBookAuthApi.reducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [flutterwaveAdminAuthApi.reducerPath]: flutterwaveAdminAuthApi.reducer,
    [adminOrderAuthApi.reducerPath]: adminOrderAuthApi.reducer,
    [ordersByAdminAuthApi.reducerPath]: ordersByAdminAuthApi.reducer,
    [subscribersAuthApi.reducerPath]: subscribersAuthApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminBookAuthApi.middleware, adminAuthApi.middleware, flutterwaveAdminAuthApi.middleware, adminOrderAuthApi.middleware, ordersByAdminAuthApi.middleware, subscribersAuthApi.middleware),
});

export default store;