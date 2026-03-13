import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryItems: builder.query({
      query: (params = {}) => ({
        url: "/items",
        params,
      }),
      providesTags: (result) =>
        tagListWithIds(TAGS.INVENTORY_ITEM, result?.data),
    }),
    getVendorAvailability: builder.query({
      query: (vendorId) => ({
        url: `/items/availability/${vendorId}`,
      }),
      providesTags: (result, error, vendorId) => tagById(TAGS.VENDOR_AVAILABILITY, vendorId),
    }),
    createInventoryItem: builder.mutation({
      query: (data) => ({
        url: "/items",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagList(TAGS.INVENTORY_ITEM),
    }),
    updateInventoryItem: builder.mutation({
      query: ({ itemId, data }) => ({
        url: `/items/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        ...tagById(TAGS.INVENTORY_ITEM, itemId),
        ...tagList(TAGS.INVENTORY_ITEM),
      ],
    }),
    deleteInventoryItem: builder.mutation({
      query: (itemId) => ({
        url: `/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, itemId) => [
        ...tagById(TAGS.INVENTORY_ITEM, itemId),
        ...tagList(TAGS.INVENTORY_ITEM),
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