import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/customers",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // customerProfile: builder.query({
    //   query: () => "/profile",
    //   providesTags: (result) => [{ type: "Customer", id: result?.data?._id }],
    // }),
    updateCustomerProfile: builder.mutation({
      query: (data) => ({
        url: "/update-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, data) => [
        { type: "Customer", id: data._id },
      ],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/change-password",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),
    deleteCustomerProfile: builder.mutation({
      query: () => ({
        url: "/delete-profile",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),
    adminCreateCustomer: builder.mutation({
      query: (data) => ({
        url: "/create-customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, search, status }) => ({
        url: "/get-customers",
        params: { page, limit, search, status },
      }),
      providesTags: (result) =>
        result?.data?.customers
          ? [
              ...result.data.customers.map(({ _id }) => ({
                type: "Customer",
                id: _id,
              })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),
    adminUpdateCustomer: builder.mutation({
      query: ({ customerId, data }) => ({
        url: `/update-customers/${customerId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: "Customer", id: customerId },
        { type: "Customer", id: "LIST" },
      ],
    }),
    adminDeleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `/delete-customers/${customerId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, customerId) => [
        { type: "Customer", id: customerId },
        { type: "Customer", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useChangePasswordMutation,
  useDeleteCustomerProfileMutation,
  useGetCustomersQuery,
  useAdminCreateCustomerMutation,
  useAdminUpdateCustomerMutation,
  useAdminDeleteCustomerMutation,
} = customerApi;
