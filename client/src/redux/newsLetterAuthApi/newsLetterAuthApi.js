import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:5000/newsletter',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
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
        query: (email) => ({
          url: `/status?email=${email}`,
          method: 'GET',
        }),
      }),
    }),
  });
  
  export const { useSubscribeNewsletterMutation, useGetSubscriptionStatusQuery } = newsLetterAuthApi;