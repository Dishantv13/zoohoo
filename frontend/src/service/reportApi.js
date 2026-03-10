import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reportApi = createApi({
  reducerPath: "reportApi",
  tagTypes: ["Dashboard"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/dashboard",
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
        url: "/report",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getRevenueByMonth: builder.query({
      query: (params) => ({
        url: "/report/monthly-revenue",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getRevenueByYear: builder.query({
      query: (params) => ({
        url: "/report/yearly-revenue",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getTodayRevenue: builder.query({
      query: (params) => ({
        url: "/report/today-revenue",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getTopCustomers: builder.query({
      query: (params) => ({
        url: "/report/top-customers",
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
} = reportApi;
