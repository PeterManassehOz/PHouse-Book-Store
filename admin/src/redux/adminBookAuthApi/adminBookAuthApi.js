import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: 'http://localhost:5000/books',
  credentials: 'include',
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
          const timestamp = new Date().getTime();
      
          const recentOrders = response.orders.recentOrders.map((order) => ({
            ...order,
            userId: {
              ...order.userId,
              image: order.userId?.image
                ? `http://localhost:5000/uploads/${order.userId.image.split("/").pop()}?t=${timestamp}`
                : null,
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