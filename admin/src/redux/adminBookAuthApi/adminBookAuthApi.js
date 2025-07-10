import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';



// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);


const baseQuery = fetchBaseQuery({ 
  baseUrl: `${API_BASE}/books`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});


export const adminBookAuthApi = createApi({
    reducerPath: 'adminBookAuthApi',
    baseQuery,
    endpoints: (builder) => ({
      createBook: builder.mutation({
        query: (formData) => ({
          url: '/',
          method: 'POST',
          body: formData,
        }),
      }),      
          
    getAllBooks: builder.query({
        query: () => {
          console.log("Fetching all studies...");
          return {
            url: '/',
            method: 'GET',
          };
        },
      }),

      getStatisticsData: builder.query({
        query: () => ({
          url: '/stats',
          method: 'GET',
        }),
        transformResponse: (response) => {
          const recentOrders = response.orders.recentOrders.map((order) => ({
            ...order,
            userId: {
              ...order.userId,
              image: order.userId?.image || null, // already a full GCS URL
            },
          }));

          return {
            ...response,
            orders: {
              ...response.orders,
              recentOrders,
            },
          };
        },
      }),

      
    updateBook: builder.mutation({
        query: ({ id, studyData }) => ({
          url: `/${id}`,
          method: 'PUT',
          body: studyData, // Keep it as FormData
        }),
      }),   
       
      deleteBook: builder.mutation({
        query: (id) => ({
          url: `/${id}`,
          method: 'DELETE',
        }),
      }),

      getBookById: builder.query({
        query: (id) => {
          console.log(`Fetching study with ID: ${id}`);
          return {
            url: `/${id}`,
            method: 'GET',
          };
        },
      }),
    }),
});

export const {
    useCreateBookMutation,
    useGetAllBooksQuery,
    useGetStatisticsDataQuery,
    useUpdateBookMutation,
    useDeleteBookMutation,
    useGetBookByIdQuery
    } = adminBookAuthApi;