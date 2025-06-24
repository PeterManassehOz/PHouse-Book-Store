import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);



export const subscribersAuthApi = createApi({
  reducerPath: "newsletterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/newsletter`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token"); // or however you store it
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
      getAllSubscribers: builder.query({
        query: () => ({
            url: "/admin-subscribers",
          method: "GET",
        }),
      }),
      sendNewsletter: builder.mutation({
      query: ({ subject, html }) => ({
        url: "/send-newsletter",
        method: "POST",
        body: { subject, html },
      }),
    }),
  }),
});

export const {useGetAllSubscribersQuery, useSendNewsletterMutation } = subscribersAuthApi;
