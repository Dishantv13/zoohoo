import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";
import { REPORT_URL } from "../enum/apiUrl";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashBoard: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_DASHBOARD,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getRevenueByMonth: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_MONTHLY_REVENUE,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getRevenueByYear: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_YEARLY_REVENUE,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTodayRevenue: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_TODAY_REVENUE,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTopCustomers: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_TOP_CUSTOMERS,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getMonthlyExpense: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_MONTHLY_EXPENSE,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getYearlyExpense: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_YEARLY_EXPENSE,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTodayExpense: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_TODAY_EXPENSE,
        params,
      }),
      providesTags: tagList(TAGS.DASHBOARD),
    }),
    getTopVendors: builder.query({
      query: (params) => ({
        url: REPORT_URL.GET_TOP_VENDORS,
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
