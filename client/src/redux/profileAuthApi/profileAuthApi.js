import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const isBrowser = typeof window !== 'undefined';

// Read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// Log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/users`,
  prepareHeaders: (headers) => {
    const token = isBrowser ? window.localStorage.getItem('token') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const profileAuthApi = createApi({
  reducerPath: 'profileAuthApi',
  baseQuery,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
       transformResponse: (response) => {
          return {
            ...response,
            image: response?.image || null, // ✅ GCS image URL is already public
          };
       },
    }),
  }),
});

export const { useUpdateProfileMutation, useGetUserProfileQuery } = profileAuthApi;
export default profileAuthApi;
