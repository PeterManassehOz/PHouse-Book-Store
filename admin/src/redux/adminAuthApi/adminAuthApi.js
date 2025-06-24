import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);


const baseQuery = fetchBaseQuery({ 
  baseUrl: `${API_BASE}/admin`,
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

      adminForgotPHCode: builder.mutation({
      query: (userData) => ({
        url: '/admin-forgot-phcode',
        method: 'POST',
        body: userData,
      }),
    }),
    }),
  });

export const { 
  useRegisterChiefAdminMutation,
  useLoginAdminMutation,
  useSignupAdminMutation,
  useAssignAdminRoleMutation,
  useAdminForgotPHCodeMutation,
} = adminAuthApi;
export default adminAuthApi;