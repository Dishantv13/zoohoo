import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";
import { INVOICE_URL } from "../enum/apiUrl";

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (invoiceData) => ({
        url: INVOICE_URL.CREATE_INVOICE,
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: tagList(TAGS.INVOICE),
    }),
    getInvoices: builder.query({
      query: ({ page = 1, limit = 10, status }) => ({
        url: INVOICE_URL.GET_ALL_INVOICES,
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        tagListWithIds(TAGS.INVOICE, result?.data?.data),
    }),
    getInvoiceById: builder.query({
      query: (id) => ({
        url: INVOICE_URL.GET_INVOICE_BY_ID(id),
      }),
      providesTags: (result, error, id) => tagById(TAGS.INVOICE, id),
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: INVOICE_URL.UPDATE_INVOICE(id),
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
        url: INVOICE_URL.UPDATE_INVOICE_STATUS(id),
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
        url: INVOICE_URL.DELETE_INVOICE(id),
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        ...tagById(TAGS.INVOICE, id),
        ...tagList(TAGS.INVOICE),
      ],
    }),
    downloadInvoice: builder.mutation({
      query: (id) => ({
        url: INVOICE_URL.DOWNLOAD_INVOICE(id),
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: (result, error, id) => tagById(TAGS.INVOICE, id),
    }),
    getAdminAllInvoices: builder.query({
      query: ({ page = 1, limit = 10, status, customerId }) => {
        if (customerId) {
          return {
            url: INVOICE_URL.GET_CUSTOMER_INVOICES(customerId),
            params: { page, limit, status },
          };
        }
        return {
          url: INVOICE_URL.GET_ADMIN_ALL_INVOICES,
          params: { page, limit, status },
        };
      },
      providesTags: (result) =>
        tagListWithIds(TAGS.INVOICE, result?.data?.data),
    }),
    getCustomerInvoices: builder.query({
      query: ({ customerId, page = 1, limit = 10, status }) => ({
        url: INVOICE_URL.GET_CUSTOMER_INVOICES(customerId),
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        tagListWithIds(TAGS.INVOICE, result?.data?.data),
    }),
    exportInvoice: builder.mutation({
      query: (params) => ({
        url: INVOICE_URL.EXPORT_INVOICE,
        method: "GET",
        params,
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: tagList(TAGS.INVOICE_EXPORT),
    }),
    invoiceStateCard: builder.query({
      query: () => ({
        url: INVOICE_URL.INVOICE_STATE_CARD,
      }),
      providesTags: tagList(TAGS.INVOICE_STATS),
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
  useInvoiceStateCardQuery,
} = invoiceApi;
