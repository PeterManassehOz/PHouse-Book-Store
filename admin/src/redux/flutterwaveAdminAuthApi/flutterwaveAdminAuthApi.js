import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';



// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);


const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/flutterwave`,
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
          return response.map((txn) => ({
            ...txn,
            userId: {
              ...txn.userId,
              image: txn.userId?.image || null, // ✅ Use GCS URL directly
            },
          }));
        },
      }),

      
      getAllStatesTransactionsForChiefAdmin: builder.query({
        query: () => ({
          url: '/chief-admin-transactions',
          method: 'GET',
        }),
      }),
      

    getTransactionsByStateForChiefAdmin: builder.query({
      query: (state) => ({
        url: `/chief-admin-transactions/${state}`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        return response.map((txn) => ({
          ...txn,
          userId: {
            ...txn.userId,
            image: txn.userId?.image || null, // ✅ GCS URL already correct
          },
        }));
      },
    }),

  }),
});

export const {
    useGetAllTransactionsQuery,
    useGetAllTransactionsForStateAdminQuery,
    useGetAllStatesTransactionsForChiefAdminQuery,
    useGetTransactionsByStateForChiefAdminQuery,
} = flutterwaveAdminAuthApi;
