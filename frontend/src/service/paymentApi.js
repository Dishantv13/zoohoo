import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getCardPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/card",
        method: "POST",
        body: data,
      }),

      invalidatesTags: (result, error, arg) => [
        ...tagList(TAGS.PAYMENT),
        ...(arg?.billId ? tagById(TAGS.BILL, arg.billId) : []),
        ...(arg?.invoiceId ? tagById(TAGS.INVOICE, arg.invoiceId) : []),
      ],
    }),

    getUPIPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/qr",
        method: "POST",
        body: data,
      }),

      invalidatesTags: (result, error, arg) => [
        ...tagList(TAGS.PAYMENT),
        ...(arg?.billId ? tagById(TAGS.BILL, arg.billId) : []),
        ...(arg?.invoiceId ? tagById(TAGS.INVOICE, arg.invoiceId) : []),
      ],
    }),

    getCashPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/cash",
        method: "POST",
        body: data,
      }),

      invalidatesTags: (result, error, arg) => [
        ...tagList(TAGS.PAYMENT),
        ...(arg?.billId ? tagById(TAGS.BILL, arg.billId) : []),
        ...(arg?.invoiceId ? tagById(TAGS.INVOICE, arg.invoiceId) : []),
        ...tagList(TAGS.DASHBOARD),
      ],
    }),

    getPaymentStatus: builder.query({
      query: (invoiceId) => ({
        url: `/payments/${invoiceId}/status`,
      }),

      providesTags: (result, error, invoiceId) =>
        tagById(TAGS.PAYMENT_STATUS, invoiceId),
    }),

    getPaymentHistory: builder.query({
      query: (invoiceId) => ({
        url: `/payments/${invoiceId}/history`,
      }),

      providesTags: (result, error, invoiceId) =>
        tagListWithIds(
          TAGS.PAYMENT_HISTORY,
          result?.data?.data?.paymentHistory
        ),
    }),

    getBillPaymentHistory: builder.query({
      query: (billId) => ({
        url: `/payments/bill/${billId}/history`,
      }),

      providesTags: (result, error, billId) =>
        tagListWithIds(
          TAGS.PAYMENT_HISTORY,
          result?.data?.data?.paymentHistory
        ),
    }),
  }),
});

export const {
  useGetCardPaymentMutation,
  useGetUPIPaymentMutation,
  useGetCashPaymentMutation,
  useGetPaymentStatusQuery,
  useGetPaymentHistoryQuery,
  useGetBillPaymentHistoryQuery,
} = paymentApi;