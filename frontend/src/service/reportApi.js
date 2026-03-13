import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashBoard: builder.query({
      query: (params) => ({
        url: "report/dashboard",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getRevenueByMonth: builder.query({
      query: (params) => ({
        url: "report/monthly-revenue",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getRevenueByYear: builder.query({
      query: (params) => ({
        url: "report/yearly-revenue",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTodayRevenue: builder.query({
      query: (params) => ({
        url: "report/today-revenue",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTopCustomers: builder.query({
      query: (params) => ({
        url: "report/top-customers",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getMonthlyExpense: builder.query({
      query: (params) => ({
        url: "report/monthly-expense",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getYearlyExpense: builder.query({
      query: (params) => ({
        url: "report/yearly-expense",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTodayExpense: builder.query({
      query: (params) => ({
        url: "report/today-expense",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTopVendors: builder.query({
      query: (params) => ({
        url: "report/top-vendors",
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
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
