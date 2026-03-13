import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateCustomerProfile: builder.mutation({
      query: (data) => ({
        url: "/customers/update-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, data) => tagById(TAGS.CUSTOMER, data.id),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: "/customers/change-password",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: tagList(TAGS.CUSTOMER),
    }),

    deleteCustomerProfile: builder.mutation({
      query: () => ({
        url: "/customers/delete-profile",
        method: "DELETE",
      }),
      invalidatesTags: tagList(TAGS.CUSTOMER),
    }),

    adminCreateCustomer: builder.mutation({
      query: (data) => ({
        url: "/customers/create-customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagList(TAGS.CUSTOMER),
    }),

    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, search, status }) => ({
        url: "/customers/get-customers",
        params: { page, limit, search, status },
      }),

      providesTags: (result) =>
        tagListWithIds(TAGS.CUSTOMER, result?.data?.customers),
    }),

    adminUpdateCustomer: builder.mutation({
      query: ({ customerId, data }) => ({
        url: `/customers/update-customers/${customerId}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { customerId }) => [
        ...tagById(TAGS.CUSTOMER, customerId),
        ...tagList(TAGS.CUSTOMER),
      ],
    }),

    adminDeleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `/customers/delete-customers/${customerId}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, customerId) => [
        ...tagById(TAGS.CUSTOMER, customerId),
        ...tagList(TAGS.CUSTOMER),
      ],
    }),
  }),
});

export const {
  useUpdateCustomerProfileMutation,
  useChangePasswordMutation,
  useDeleteCustomerProfileMutation,
  useAdminCreateCustomerMutation,
  useGetCustomersQuery,
  useAdminUpdateCustomerMutation,
  useAdminDeleteCustomerMutation,
} = customerApi;
