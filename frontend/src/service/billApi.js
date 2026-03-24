import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagListWithIds, tagById, tagList } from "../enum/tagHelper";
import { BILL_URL } from "../enum/apiUrl";

export const billApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query({
      query: ({ vendorId, status = '', page = 1, limit = 10 }) => {
        const params = { page, limit };
        if (vendorId) params.vendorId = vendorId;
        if (status) params.status = status;
        return {
          url: BILL_URL.GET_BILLS,
          params,
        };
      },

      providesTags: (result) => tagListWithIds(TAGS.BILL, result?.data?.bills),
    }),

    getBillById: builder.query({
      query: (billId) => ({
        url: BILL_URL.GET_BILL_BY_ID(billId),
      }),

      providesTags: (result, error, billId) => tagById(TAGS.BILL, billId),
    }),

    createBill: builder.mutation({
      query: (data) => ({
        url: BILL_URL.CREATE_BILL,
        method: "POST",
        body: data,
      }),

      invalidatesTags: tagList(TAGS.BILL),
    }),

    updateBill: builder.mutation({
      query: ({ billId, data }) => ({
        url: BILL_URL.UPDATE_BILL(billId),
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { billId }) => [
        ...tagById(TAGS.BILL, billId),
        ...tagList(TAGS.BILL),
      ],
    }),
    updateBillStatus: builder.mutation({
      query: ({ billId, status }) => ({
        url: BILL_URL.UPDATE_BILL_STATUS(billId),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { billId }) => [
        ...tagById(TAGS.BILL, billId),
        ...tagList(TAGS.BILL),
      ],
    }),
    deleteBill: builder.mutation({
      query: (billId) => ({
        url: BILL_URL.DELETE_BILL(billId),
        method: "DELETE",
      }),

      invalidatesTags: (result, error, billId) => [
        ...tagById(TAGS.BILL, billId),
        ...tagList(TAGS.BILL),
      ],
    }),
    getBillsStats: builder.query({
      query: () => ({
        url: BILL_URL.GET_BILLS_STATS,
      }),
      providesTags: [
        ...tagById(TAGS.BILL_STATS, TAG_IDS.SUMMARY),
        ...tagList(TAGS.BILL_STATS),
      ],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useUpdateBillStatusMutation,
  useDeleteBillMutation,
  useGetBillsStatsQuery,
} = billApi;
