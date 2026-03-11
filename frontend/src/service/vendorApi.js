import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  tagTypes: ["Vendor", "VendorStats", "VendorBills"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/vendors",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    vendorLogin: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),
    getVendors: builder.query({
      query: ({page = 1 , limit = 10}) => ({
        url: "/",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.vendors.map(({ _id }) => ({ type: "Vendor", id: _id })),
              { type: "Vendor", id: "LIST" },
            ]
          : [{ type: "Vendor", id: "LIST" }],
    }),
    createVendor: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Vendor", id: "LIST" }],
    }),
    updateVendor: builder.mutation({
      query: ({ vendorId, data }) => ({
        url: `/${vendorId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        { type: "Vendor", id: vendorId },
        { type: "Vendor", id: "LIST" },
      ],
    }),
    deleteVendor: builder.mutation({
      query: (vendorId) => ({
        url: `/${vendorId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, vendorId) => [
        { type: "Vendor", id: vendorId },
        { type: "Vendor", id: "LIST" },
      ],
    }),
    getVendorStats: builder.query({
      query: (vendorId) => ({
        url: `/${vendorId}/stats`,
      }),
      providesTags: (result, error, vendorId) => [
        { type: "VendorStats", id: vendorId },
      ],
    }),
    getVendorBills: builder.query({
      query: (vendorId) => ({
        url: `/${vendorId}/bills`,
      }),
      providesTags: (result, error, vendorId) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "VendorBills",
                id: _id,
              })),
              { type: "VendorBills", id: vendorId },
            ]
          : [{ type: "VendorBills", id: vendorId }],
    }),
  }),
});

export const {
  useVendorLoginMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetVendorStatsQuery,
  useGetVendorBillsQuery,
} = vendorApi;
