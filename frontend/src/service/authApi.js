import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagById } from "../enum/tagHelper";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/auth/me",
      }),
      providesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    adminRegister: builder.mutation({
      query: (data) => ({
        url: "/auth/admin/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useAdminRegisterMutation,
} = authApi;
