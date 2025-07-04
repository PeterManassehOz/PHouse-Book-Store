import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const isBrowser = typeof window !== 'undefined';


// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
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
    tagTypes: ['Profile'], // Add this line
    endpoints: (builder) => ({
      updateProfile: builder.mutation({
            query: (formData) => ({
              url: '/profile',
              method: 'PUT',
              body: formData,
            }),
            invalidatesTags: ['Profile'], // This ensures the query is refetched after mutation
          }),
  
      getUserProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
      transformResponse: (response) => {
      let image = response?.image || null; // Default to null if image is not present

        if (image) {
          const timestamp = new Date().getTime();
          image = `${API_BASE}/uploads/${response.image.split("/").pop()}?t=${timestamp}`;
        }

        // ✅ Return transformed response with image URL directly included
        return {
          ...response,
          image,
        };
      },
    }),
    }),
  });
  
  
  export const { useUpdateProfileMutation, useGetUserProfileQuery } = profileAuthApi;
  export default profileAuthApi;