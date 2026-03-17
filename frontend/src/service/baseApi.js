import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TAGS } from "../enum/tagType";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: Object.values(TAGS),

  endpoints: () => ({}),
});
