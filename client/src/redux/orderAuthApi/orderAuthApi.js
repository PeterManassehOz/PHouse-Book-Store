import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/orders`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const orderAuthApi = createApi({
  reducerPath: 'orderAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    createOrder: builder.mutation({
        query: (orderData) => ({
          url: '/',
          method: 'POST',
          body: orderData,
        }),
      }),
  
     getOrdersForUser: builder.query({
      query: () => '/user',
      transformResponse: (rawOrders) =>
        rawOrders.map((order) => ({
          ...order,
          productIds: order.productIds.map((product) => ({
            ...product,
            image: product.image || null, // ✅ Use public GCS URL directly
          })),
        })),
    }),


      getOrderStatus: builder.query({
        query: (orderId) => `/status/${orderId}`,
      }),

    }),
  });
  
  export const { useCreateOrderMutation, useGetOrdersForUserQuery, useGetOrderStatusQuery } = orderAuthApi;