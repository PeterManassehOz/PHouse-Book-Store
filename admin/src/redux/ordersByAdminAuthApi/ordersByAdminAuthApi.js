import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';



// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);


const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/adminorders`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const ordersByAdminAuthApi = createApi({
  reducerPath: 'ordersByAdminAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    createAdminOrder: builder.mutation({
      query: ({ orderItems, message }) => ({
        url: '/',
        method: 'POST',
        body: { orderItems, message }, // Important: orderItems is an array of objects
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    // 2. Get all Admin Orders (for logged-in admin)
    getAdminOrders: builder.query({
      query: () => '/',
      providesTags: ['AdminOrders'],
    }),

    // 3. Update Order Status
    updateAdminOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: '/status',             // no query string
        method: 'PUT',
        body: { orderId, status },   // both in the JSON body
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    // 4. Get a Single Order's Status
    getAdminOrderStatus: builder.query({
      query: (orderId) => `/status/${orderId}`,
    }),

    // 5. Get All States Orders for Chief Admin
    getAllStatesOrdersForChiefAdmin: builder.query({
      query: () => '/chief-admin-orders',
      providesTags: ['AdminOrders'],
    }),

    // 6. Get Orders by State for Chief Admin
    getOrdersByStateForChiefAdmin: builder.query({
      query: (state) => `/chief-admin-orders/${state}`,
      providesTags: ['AdminOrders'],
    }),

    // 7. Get Admin Order Statistics
    getAdminOrderStatistics: builder.query({
      query: () => '/statistics',
    }),
  }),
});

export const {
  useCreateAdminOrderMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useGetAdminOrderStatusQuery,
  useGetAllStatesOrdersForChiefAdminQuery,
  useGetOrdersByStateForChiefAdminQuery,
  useGetAdminOrderStatisticsQuery,
} = ordersByAdminAuthApi;
