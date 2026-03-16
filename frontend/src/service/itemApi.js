import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";
import { ITEM_URL } from "../enum/apiUrl";

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryItems: builder.query({
      query: (params = {}) => ({
        url: ITEM_URL.GET_INVENTORY_ITEMS,
        params,
      }),
      providesTags: (result) =>
        tagListWithIds(TAGS.INVENTORY_ITEM, result?.data),
    }),
    getVendorAvailability: builder.query({
      query: (vendorId) => ({
        url: ITEM_URL.GET_VENDOR_AVAILABILITY(vendorId),
      }),
      providesTags: (result, error, vendorId) => tagById(TAGS.VENDOR_AVAILABILITY, vendorId),
    }),
    createInventoryItem: builder.mutation({
      query: (data) => ({
        url: ITEM_URL.CREATE_INVENTORY_ITEM,
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagList(TAGS.INVENTORY_ITEM),
    }),
    updateInventoryItem: builder.mutation({
      query: ({ itemId, data }) => ({
        url: ITEM_URL.UPDATE_INVENTORY_ITEM(itemId),
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
        url: ITEM_URL.DELETE_INVENTORY_ITEM(itemId),
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