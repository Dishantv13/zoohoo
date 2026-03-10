import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { invoiceApi } from "./invoiceApi";
import { reportApi } from "./reportApi";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  tagTypes: ["Payment", "PaymentStatus", "PaymentHistory"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/payments",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCardPayment: builder.mutation({
      query: (data) => ({
        url: "/card",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            invoiceApi.util.invalidateTags([
              { type: "Invoice", id: "LIST" },
              { type: "Invoice", id: arg?.invoiceId },
            ]),
          );
        } catch {}
      },
    }),
    getUPIPayment: builder.mutation({
      query: (data) => ({
        url: "/qr",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            invoiceApi.util.invalidateTags([
              { type: "Invoice", id: "LIST" },
              { type: "Invoice", id: arg?.invoiceId },
            ]),
          );
        } catch {}
      },
    }),
    getCashPayment: builder.mutation({
      query: (data) => ({
        url: "/cash",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            invoiceApi.util.invalidateTags([
              { type: "Invoice", id: "LIST" },
              { type: "Invoice", id: arg?.invoiceId },
            ]),
          );
          dispatch(
            reportApi.util.invalidateTags(["Dashboard"]),
          );
        } catch {}
      },
    }),
    getPaymentStatus: builder.query({
      query: (invoiceId) => ({
        url: `/${invoiceId}/status`,
      }),
      providesTags: (result, error, invoiceId) => [
        { type: "PaymentStatus", id: invoiceId },
      ],
    }),
    getPaymentHistory: builder.query({
      query: (invoiceId) => ({
        url: `${invoiceId}/history`,
      }),
      providesTags: (result, error, invoiceId) =>
        result?.data?.data?.paymentHistory
          ? [
              ...result.data.data.paymentHistory.map(({ _id }) => ({
                type: "PaymentHistory",
                id: _id,
              })),
              { type: "PaymentHistory", id: invoiceId },
            ]
          : [{ type: "PaymentHistory", id: invoiceId }],
    }),
  }),
});

export const {
  useGetCardPaymentMutation,
  useGetUPIPaymentMutation,
  useGetCashPaymentMutation,
  useGetPaymentStatusQuery,
  useGetPaymentHistoryQuery,
} = paymentApi;
