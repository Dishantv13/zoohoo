import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (invoiceData) => ({
        url: "/invoices",
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: tagList(TAGS.INVOICE),
    }),
    getInvoices: builder.query({
      query: ({ page = 1, limit = 10, status }) => ({
        url: "/invoices",
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        tagListWithIds(TAGS.INVOICE, result?.data?.data),
    }),
    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/invoices/${id}`,
      }),
      providesTags: (result, error, id) => tagById(TAGS.INVOICE, id),
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/invoices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        ...tagById(TAGS.INVOICE, id),
        ...tagList(TAGS.INVOICE),
      ],
    }),
    updateInvoiceStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/invoices/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        ...tagById(TAGS.INVOICE, id),
        ...tagList(TAGS.INVOICE),
      ],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        ...tagById(TAGS.INVOICE, id),
        ...tagList(TAGS.INVOICE),
      ],
    }),
    downloadInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoices/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: (result, error, id) => tagById(TAGS.INVOICE, id),
    }),
    getAdminAllInvoices: builder.query({
      query: ({ page = 1, limit = 10, status, customerId }) => {
        if (customerId) {
          return {
            url: `/invoices/admin/customer/${customerId}`,
            params: { page, limit, status },
          };
        }
        return {
          url: "/invoices/admin/all",
          params: { page, limit, status },
        };
      },
      providesTags: (result) =>
        tagListWithIds(TAGS.INVOICE, result?.data?.data),
    }),
    getCustomerInvoices: builder.query({
      query: ({ customerId, page = 1, limit = 10, status }) => ({
        url: `/invoices/admin/customer/${customerId}`,
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        tagListWithIds(TAGS.INVOICE, result?.data?.data),
    }),
    exportInvoice: builder.mutation({
      query: (params) => ({
        url: "/invoices/export",
        method: "GET",
        params,
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: tagList(TAGS.INVOICE_EXPORT),
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useDeleteInvoiceMutation,
  useDownloadInvoiceMutation,
  useGetCustomerInvoicesQuery,
  useGetAdminAllInvoicesQuery,
  useExportInvoiceMutation,
} = invoiceApi;
