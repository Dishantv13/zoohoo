import { baseApi } from "./baseApi";
import { TAGS } from "../enum/tagType";
import { tagById, tagList, tagListWithIds } from "../enum/tagHelper";
import { CUSTOMER_URL } from "../enum/apiUrl";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateCustomerProfile: builder.mutation({
      query: (data) => ({
        url: CUSTOMER_URL.UPDATE_CUSTOMER_PROFILE,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, data) => tagById(TAGS.CUSTOMER, data.id),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: CUSTOMER_URL.CHANGE_PASSWORD,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: tagList(TAGS.CUSTOMER),
    }),

    deleteCustomerProfile: builder.mutation({
      query: () => ({
        url: CUSTOMER_URL.DELETE_CUSTOMER_PROFILE,
        method: "DELETE",
      }),
      invalidatesTags: tagList(TAGS.CUSTOMER),
    }),

    adminCreateCustomer: builder.mutation({
      query: (data) => ({
        url: CUSTOMER_URL.ADMIN_CREATE_CUSTOMER,
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagList(TAGS.CUSTOMER),
    }),

    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, search, status }) => ({
        url: CUSTOMER_URL.GET_CUSTOMERS,
        params: { page, limit, search, status },
      }),

      providesTags: (result) =>
        tagListWithIds(TAGS.CUSTOMER, result?.data?.customers),
    }),

    adminUpdateCustomer: builder.mutation({
      query: ({ customerId, data }) => ({
        url: CUSTOMER_URL.ADMIN_UPDATE_CUSTOMER(customerId),
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
        url: CUSTOMER_URL.ADMIN_DELETE_CUSTOMER(customerId),
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
