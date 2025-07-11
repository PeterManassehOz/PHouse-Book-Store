import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const isBrowser = typeof window !== 'undefined';

// Read the env var
const API_BASE = import.meta.env.VITE_API_BASE;
// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);


const baseQuery = fetchBaseQuery({
    baseUrl: `${API_BASE}/newsletter`,    prepareHeaders: (headers) => {
     const token = isBrowser ? window.localStorage.getItem('token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });
  
export const newsLetterAuthApi = createApi({
    reducerPath: 'newsletterApi',
    baseQuery,
    endpoints: (builder) => ({
      subscribeNewsletter: builder.mutation({
        query: (email) => ({
          url: '/subscribe',
          method: 'POST',
          body: { email },
        }),
      }),
      
    getSubscriptionStatus: builder.query({
      query: () => ({
        url: "/status",
        method: "GET",
        // no email needed
      }),
    }),
    }),
  });
  
  export const { useSubscribeNewsletterMutation, useGetSubscriptionStatusQuery } = newsLetterAuthApi;