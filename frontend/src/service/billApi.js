import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const billApi = createApi({
  reducerPath: "billApi",
  tagTypes: ["Bill", "BillStats"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/bills",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBills: builder.query({
      query: ({ vendorId, status, page = 1 , limit = 10 } = {}) => {
        const params = {};
        if (vendorId) params.vendorId = vendorId;
        if (status) params.status = status;
        if (page) params.page = page;
        if (limit) params.limit = limit;
        return {
          url: "/",
          params,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.bills.map(({ _id }) => ({ type: "Bill", id: _id })),
              { type: "Bill", id: "LIST" },
            ]
          : [{ type: "Bill", id: "LIST" }],
    }),
    getBillById: builder.query({
      query: (billId) => ({
        url: `/${billId}`,
      }),
      providesTags: (result, error, billId) => [{ type: "Bill", id: billId }],
    }),
    createBill: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Bill", id: "LIST" }],
    }),
    updateBill: builder.mutation({
      query: ({ billId, data }) => ({
        url: `/${billId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { billId }) => [
        { type: "Bill", id: billId },
        { type: "Bill", id: "LIST" },
      ],
    }),
    updateBillStatus: builder.mutation({
      query: ({ billId, status }) => ({
        url: `/${billId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { billId }) => [
        { type: "Bill", id: billId },
        { type: "Bill", id: "LIST" },
      ],
    }),
    deleteBill: builder.mutation({
      query: (billId) => ({
        url: `/${billId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, billId) => [
        { type: "Bill", id: billId },
        { type: "Bill", id: "LIST" },
      ],
    }),
    getBillsStats: builder.query({
      query: () => ({
        url: "/stats/summary",
      }),
      providesTags: [
        { type: "BillStats", id: "SUMMARY" },
        { type: "Bill", id: "LIST" },
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
