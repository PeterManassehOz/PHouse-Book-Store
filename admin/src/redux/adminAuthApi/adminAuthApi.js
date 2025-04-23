import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: 'http://localhost:5000/admin',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    console.log("Token in request headers:", token);  // Debugging line
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const adminAuthApi = createApi({
    reducerPath: 'adminAuthApi',
    baseQuery,
    endpoints: (builder) => ({
      registerChiefAdmin: builder.mutation({
        query: (data) => ({
          url: '/register',
          method: 'POST',
          body: data,
        }),
      }),
      loginAdmin: builder.mutation({
        query: (data) => ({
          url: '/login',
          method: 'POST',
          body: data,
        }),
      }),
      signupAdmin: builder.mutation({
        query: (data) => ({
          url: '/signup',
          method: 'POST',
          body: data,
        }),
      }),
      assignAdminRole: builder.mutation({
        query: (data) => ({
          url: '/assign',
          method: 'PUT',
          body: data,
        }),
      }),
    }),
  });

export const { 
  useRegisterChiefAdminMutation,
  useLoginAdminMutation,
  useSignupAdminMutation,
  useAssignAdminRoleMutation
} = adminAuthApi;
export default adminAuthApi;