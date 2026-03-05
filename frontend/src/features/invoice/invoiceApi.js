import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/invoices",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (invoiceData) => ({
        url: "/",
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    getInvoices: builder.query({
      query: ({page = 1, limit = 10, status}) => ({
        url: "/",
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({
                type: "Invoice",
                id: _id,
              })),
              { type: "Invoice", id: "LIST" },
            ]
          : [{ type: "Invoice", id: "LIST" }],
    }),
    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        { type: "Invoice", id: "LIST" },
      ],
    }),
    updateInvoiceStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        { type: "Invoice", id: "LIST" },
      ],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Invoice", id },
        { type: "Invoice", id: "LIST" },
      ],
    }),
    downloadInvoice: builder.mutation({
      query: (id) => ({
        url: `/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),
    getAdminAllInvoices: builder.query({
      query: ({ page = 1, limit = 10, status, customerId }) => {
        if (customerId) {
          return {
            url: `admin/customer/${customerId}`,
            params: { page, limit, status },
          };
        }
        return {
          url: "admin/all",
          params: { page, limit, status },
        };
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({
                type: "Invoice",
                id: _id,
              })),
              { type: "Invoice", id: "LIST" },
            ]
          : [{ type: "Invoice", id: "LIST" }],
    }),
    getCustomerInvoices: builder.query({
      query: ({ customerId, page = 1, limit = 10, status }) => ({
        url: `admin/customer/${customerId}`,
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({
                type: "Invoice",
                id: _id,
              })),
              { type: "Invoice", id: "LIST" },
            ]
          : [{ type: "Invoice", id: "LIST" }],
    }),
    exportInvoice: builder.mutation({
      query: (params) => ({
        url: "export",
        method: "GET",
        params,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: (result) =>
        result
          ? [{ type: "Invoice", id: "EXPORT" }]
          : [{ type: "Invoice", id: "EXPORT" }],

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
