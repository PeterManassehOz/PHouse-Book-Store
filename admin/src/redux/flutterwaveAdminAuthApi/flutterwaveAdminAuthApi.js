import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/flutterwave',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapped baseQuery with try-catch
const baseQuery = async (args, api, extraOptions) => {
  try {
    return await rawBaseQuery(args, api, extraOptions);
  } catch (error) {
    console.error('BaseQuery error:', error);
    return { error: { status: 'FETCH_ERROR', message: error.message || 'Something went wrong' } };
  }
};

export const flutterwaveAdminAuthApi = createApi({
  reducerPath: 'flutterwaveAdminAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    
    getAllTransactions: builder.query({
        query: () => '/transactions',
      }),

      getAllTransactionsForStateAdmin: builder.query({
        query: () => ({
          url: '/admin-transactions',
          method: 'GET',
        }),
        transformResponse: (response) => {
          const timestamp = new Date().getTime();
          return response.map((txn) => ({
            ...txn,
            userId: {
              ...txn.userId,
              image: txn.userId?.image
                ? `http://localhost:5000/uploads/${txn.userId.image.split("/").pop()}?t=${timestamp}`
                : null,
            },
          }));
        },
      }),
      
      
  }),
});

export const {
    useGetAllTransactionsQuery,
    useGetAllTransactionsForStateAdminQuery,
} = flutterwaveAdminAuthApi;
