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
              items: order.items.map(({ bookId, quantity }) => ({
                // pull the populated book document
                ...bookId,
                quantity,                             // now the real ordered quantity
                subtotal: bookId.price * quantity,    // compute line total
                image: bookId.image || null,          // pass through your GCS URL
              })),
            })),
        }),


      getOrderStatus: builder.query({
        query: (orderId) => `/status/${orderId}`,
      }),

    }),
  });
  
  export const { useCreateOrderMutation, useGetOrdersForUserQuery, useGetOrderStatusQuery } = orderAuthApi;