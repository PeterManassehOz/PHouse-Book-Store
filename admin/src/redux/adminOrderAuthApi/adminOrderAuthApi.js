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

export const adminOrderAuthApi = createApi({
  reducerPath: 'orderAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    getOrdersForAdmin: builder.query({
      query: () => '/admin',
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: '/status',
        method: 'PUT',
        body: { orderId, status },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersForAdminQuery,
  useUpdateOrderStatusMutation,
} = adminOrderAuthApi;
