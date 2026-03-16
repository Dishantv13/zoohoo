import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";
import { PAYMENT_URL } from "../enum/apiUrl";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getCardPayment: builder.mutation({
      query: (data) => ({
        url: PAYMENT_URL.CARD_PAYMENT,
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
        url: PAYMENT_URL.UPI_PAYMENT,
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
        url: PAYMENT_URL.CASH_PAYMENT,
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
        url: PAYMENT_URL.GET_PAYMENT_STATUS(invoiceId),
      }),

      providesTags: (result, error, invoiceId) =>
        tagById(TAGS.PAYMENT_STATUS, invoiceId),
    }),

    getPaymentHistory: builder.query({
      query: (invoiceId) => ({
        url: PAYMENT_URL.GET_PAYMENT_HISTORY(invoiceId),
      }),

      providesTags: (result, error, invoiceId) =>
        tagListWithIds(
          TAGS.PAYMENT_HISTORY,
          result?.data?.data?.paymentHistory
        ),
    }),

    getBillPaymentHistory: builder.query({
      query: (billId) => ({
        url: PAYMENT_URL.GET_BILL_PAYMENT_HISTORY(billId),
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