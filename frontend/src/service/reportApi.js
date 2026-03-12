import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reportApi = createApi({
  reducerPath: "reportApi",
  tagTypes: ["Dashboard"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/report",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDashBoard: builder.query({
      query: (params) => ({
        url: "/dashboard",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getRevenueByMonth: builder.query({
      query: (params) => ({
        url: "/monthly-revenue",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getRevenueByYear: builder.query({
      query: (params) => ({
        url: "/yearly-revenue",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getTodayRevenue: builder.query({
      query: (params) => ({
        url: "/today-revenue",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getTopCustomers: builder.query({
      query: (params) => ({
        url: "/top-customers",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getMonthlyExpense: builder.query({
      query: (params) => ({
        url: "/monthly-expense",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getYearlyExpense: builder.query({
      query: (params) => ({
        url: "/yearly-expense",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getTodayExpense: builder.query({
      query: (params) => ({
        url: "/today-expense",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getTopVendors: builder.query({
      query: (params) => ({
        url: "/top-vendors",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashBoardQuery,
  useGetRevenueByMonthQuery,
  useGetRevenueByYearQuery,
  useGetTodayRevenueQuery,
  useGetTopCustomersQuery,

  useGetMonthlyExpenseQuery,
  useGetYearlyExpenseQuery,
  useGetTodayExpenseQuery,
  useGetTopVendorsQuery,
} = reportApi;
