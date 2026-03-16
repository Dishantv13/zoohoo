import { baseApi } from "./baseApi";
import { TAGS, TAG_IDS } from "../enum/tagType";
import { tagById } from "../enum/tagHelper";
import { AUTH_URL } from "../enum/apiUrl";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: AUTH_URL.LOGIN,
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: AUTH_URL.REGISTER,
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    logout: builder.mutation({
      query: () => ({
        url: AUTH_URL.LOGOUT,
        method: "POST",
      }),
      invalidatesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: AUTH_URL.GET_CURRENT_USER,
      }),
      providesTags: tagById(TAGS.USER, TAG_IDS.CURRENT_USER),
    }),
    adminRegister: builder.mutation({
      query: (data) => ({
        url: AUTH_URL.ADMIN_REGISTER,
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
