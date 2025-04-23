import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/orders',
  credentials: 'include',
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
  
      // Endpoint for getting orders for the user
      getOrdersForUser: builder.query({
        query: () => '/user',
        transformResponse: (rawOrders) =>
          rawOrders.map((order) => ({
            ...order,
            productIds: order.productIds.map((product) => ({
              ...product,
              image: `http://localhost:5000/${product.image}`,  // full URL now baked in
            })),
          })),
      }),
  

      getOrderStatus: builder.query({
        query: (orderId) => `/status/${orderId}`,
      }),

    }),
  });
  
  export const { useCreateOrderMutation, useGetOrdersForUserQuery, useGetOrderStatusQuery } = orderAuthApi;