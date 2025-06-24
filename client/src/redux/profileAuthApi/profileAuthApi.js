import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);

const baseQuery = fetchBaseQuery({ 
  baseUrl: `${API_BASE}/users`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
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
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, 
              },
            }),
            invalidatesTags: ['Profile'], // This ensures the query is refetched after mutation
          }),
  
          getUserProfile: builder.query({
            query: () => ({
              url: '/profile',
              method: 'GET',
            }),
            providesTags: ['Profile'], // This marks the query as cacheable under 'Profile' tag
          }),
    }),
  });
  
  
  export const { useUpdateProfileMutation, useGetUserProfileQuery } = profileAuthApi;
  export default profileAuthApi;