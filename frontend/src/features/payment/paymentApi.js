import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
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
    }),
    getUPIPayment: builder.mutation({
      query: (data) => ({
        url: "/upi",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
    getCashPayment: builder.mutation({
      query: (data) => ({
        url: "/cash",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
    getPaymentStatus: builder.query({
      query: (invoiceId) => ({
        url: `/${invoiceId}/status`,
      }),
      providesTags: (result, invoiceId) => [
        { type: "PaymentStatus", id: invoiceId },
      ],
    }),
    getPaymentHistory: builder.query({
      query: (invoiceId) => ({
        url: `${invoiceId}/history`,
      }),
      providesTags: (result, invoiceId) =>
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

export const { useGetCardPaymentMutation, useGetUPIPaymentMutation, useGetCashPaymentMutation, useGetPaymentStatusQuery, useGetPaymentHistoryQuery } = paymentApi;
