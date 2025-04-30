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
  reducerPath: 'adminOrderAuthApi',
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

    getAllStatesOrdersForChiefAdmin: builder.query({
      query: () => '/chief-admin-orders',
      providesTags: ['Order'],
    }),

    getOrdersByStateForChiefAdmin: builder.query({
      query: (state) => `/chief-admin-orders/${state}`,
      providesTags: ['Order'],
      transformResponse: (response) => {
        const timestamp = Date.now();
        return response.map(order => ({
          ...order,
          userId: {
            // ◀️ spread _all_ the original populated fields
            ...order.userId,
            // ◀️ then override just the image URL
            image: order.userId?.image
              ? `http://localhost:5000/uploads/${order.userId.image.split('/').pop()}?t=${timestamp}`
              : null,
          },
        }));
      },
    }),
    
  }),
});

export const {
  useGetOrdersForAdminQuery,
  useUpdateOrderStatusMutation,
  useGetAllStatesOrdersForChiefAdminQuery,
  useGetOrdersByStateForChiefAdminQuery,
} = adminOrderAuthApi;
