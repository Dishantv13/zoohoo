import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagListWithIds, tagById, tagList } from "../enum/tagHelper";

export const billApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query({
      query: ({ vendorId, status, page = 1, limit = 10 }) => {
        const params = { page, limit };
        if (vendorId) params.vendorId = vendorId;
        if (status) params.status = status;
        return {
          url: "/bills",
          params,
        };
      },

      providesTags: (result) => tagListWithIds(TAGS.BILL, result?.data?.bills),
    }),

    getBillById: builder.query({
      query: (billId) => ({
        url: `/bills/${billId}`,
      }),

      providesTags: (result, error, billId) => tagById(TAGS.BILL, billId),
    }),

    createBill: builder.mutation({
      query: (data) => ({
        url: "/bills",
        method: "POST",
        body: data,
      }),

      invalidatesTags: tagList(TAGS.BILL),
    }),

    updateBill: builder.mutation({
      query: ({ billId, data }) => ({
        url: `/bills/${billId}`,
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
        url: `bills/${billId}/status`,
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
        url: `/bills/${billId}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, billId) => [
        ...tagById(TAGS.BILL, billId),
        ...tagList(TAGS.BILL),
      ],
    }),
    getBillsStats: builder.query({
      query: () => ({
        url: "bills/stats/summary",
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
