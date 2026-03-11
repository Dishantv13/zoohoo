import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const itemApi = createApi({
  reducerPath: "itemApi",
  tagTypes: ["InventoryItem", "VendorAvailability"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/items",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getInventoryItems: builder.query({
      query: (params = {}) => ({
        url: "/",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "InventoryItem", id: _id })),
              { type: "InventoryItem", id: "LIST" },
            ]
          : [{ type: "InventoryItem", id: "LIST" }],
    }),
    getVendorAvailability: builder.query({
      query: (vendorId) => ({
        url: `/availability/${vendorId}`,
      }),
      providesTags: (result, error, vendorId) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "VendorAvailability",
                id: _id,
              })),
              { type: "VendorAvailability", id: vendorId },
            ]
          : [{ type: "VendorAvailability", id: vendorId }],
    }),
    createInventoryItem: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "InventoryItem", id: "LIST" }],
    }),
    updateInventoryItem: builder.mutation({
      query: ({ itemId, data }) => ({
        url: `/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        { type: "InventoryItem", id: itemId },
        { type: "InventoryItem", id: "LIST" },
      ],
    }),
    deleteInventoryItem: builder.mutation({
      query: (itemId) => ({
        url: `/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, itemId) => [
        { type: "InventoryItem", id: itemId },
        { type: "InventoryItem", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetVendorAvailabilityQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = itemApi;
