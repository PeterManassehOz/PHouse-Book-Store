import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);


const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/flutterwave`,  prepareHeaders: (headers) => {
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

export const flutterwaveAuthApi = createApi({
  reducerPath: 'flutterwaveAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    verifyTransaction: builder.query({
      query: (tx_id) => `/verify/${tx_id}`,
    }),
    saveTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '/save-transaction',
        method: 'POST',
        body: transactionData,
      }),
    }),
    getUserTransactions: builder.query({
      query: () => '/user-transactions',
    }),
  }),
});

export const {
  useVerifyTransactionQuery,
  useSaveTransactionMutation,
  useGetUserTransactionsQuery,
} = flutterwaveAuthApi;
