import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: "/vendors",
        params: { page, limit },
      }),

      providesTags: (result) =>
        tagListWithIds(TAGS.VENDOR, result?.data?.vendors),
    }),

    createVendor: builder.mutation({
      query: (data) => ({
        url: "/vendors",
        method: "POST",
        body: data,
      }),

      invalidatesTags: tagList(TAGS.VENDOR),
    }),
    updateVendor: builder.mutation({
      query: ({ vendorId, data }) => ({
        url: `/vendors/${vendorId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        ...tagById(TAGS.VENDOR, vendorId),
        ...tagList(TAGS.VENDOR),
      ],
    }),
    deleteVendor: builder.mutation({
      query: (vendorId) => ({
        url: `/vendors/${vendorId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        ...tagById(TAGS.VENDOR, vendorId),
        ...tagList(TAGS.VENDOR),
      ],
    }),
    getVendorStats: builder.query({
      query: (vendorId) => ({
        url: `/vendors/${vendorId}/stats`,
      }),
      providesTags: (result, error, vendorId) => [
        ...tagById(TAGS.VENDOR_STATS, vendorId),
      ],
    }),
    getVendorBills: builder.query({
      query: ({ vendorId, page = 1, limit = 10 }) => ({
        url: `/vendors/${vendorId}/bills`,
        params: { page, limit },
      }),
      providesTags: (result, error, vendorId) =>
        tagListWithIds(TAGS.VENDOR_BILLS, result?.data?.bills),
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetVendorStatsQuery,
  useGetVendorBillsQuery,
} = vendorApi;
