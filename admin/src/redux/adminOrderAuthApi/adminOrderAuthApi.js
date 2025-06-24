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
              ? `${API_BASE}/uploads/${order.userId.image.split('/').pop()}?t=${timestamp}`
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
