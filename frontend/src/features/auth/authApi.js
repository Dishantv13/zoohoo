import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/auth",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    }
    }),
    endpoints: (builder) => ({  
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),
    login: builder.mutation({
        query: (data) => ({
            url: "/login",
            method: "POST",
            body: data,
        }),
    }),
    logout: builder.mutation({
        query: () => ({
            url: "/logout",
            method: "POST",
        }),
    }),
    getCurrentUser: builder.query({ 
        query: () => ({
            url: "/me",
        }),
        providesTags: ["User"],
    }),
    adminRegister: builder.mutation({
      query: (data) => ({
        url: "/admin/register",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useAdminRegisterMutation
} = authApi;
