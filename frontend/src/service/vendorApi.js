import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";
import { VENDOR_URL } from "../enum/apiUrl";

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: ({ page = 1, limit = 10, search }) => ({
        url: VENDOR_URL.GET_VENDORS,
        params: { page, limit, search },
      }),

      providesTags: (result) =>
        tagListWithIds(TAGS.VENDOR, result?.data?.vendors),
    }),

    createVendor: builder.mutation({
      query: (data) => ({
        url: VENDOR_URL.CREATE_VENDOR,
        method: "POST",
        body: data,
      }),

      invalidatesTags: tagList(TAGS.VENDOR),
    }),
    updateVendor: builder.mutation({
      query: ({ vendorId, data }) => ({
        url: VENDOR_URL.UPDATE_VENDOR(vendorId),
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
        url: VENDOR_URL.DELETE_VENDOR(vendorId),
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        ...tagById(TAGS.VENDOR, vendorId),
        ...tagList(TAGS.VENDOR),
      ],
    }),
    getVendorStats: builder.query({
      query: (vendorId) => ({
        url: VENDOR_URL.GET_VENDOR_STATS(vendorId),
      }),
      providesTags: (result, error, vendorId) => [
        ...tagById(TAGS.VENDOR_STATS, vendorId),
      ],
    }),
    getVendorBills: builder.query({
      query: ({ vendorId, page = 1, limit = 10 }) => ({
        url: VENDOR_URL.GET_VENDOR_BILLS(vendorId),
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
