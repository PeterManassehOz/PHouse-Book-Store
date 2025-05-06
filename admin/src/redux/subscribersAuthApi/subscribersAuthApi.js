import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subscribersAuthApi = createApi({
  reducerPath: "newsletterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/newsletter",
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
  }),
});

export const {useGetAllSubscribersQuery } = subscribersAuthApi;
