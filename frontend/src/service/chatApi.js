import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/chat",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Conversation", "Message"],

  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (params) => ({
        url: "/conversations",
        params,
      }),
      providesTags: ["Conversation"],
    }),

    getMessages: builder.query({
      query: ({ conversationId, params }) => ({
        url: `/conversations/${conversationId}/messages`,
        params,
      }),
      providesTags: ["Message"],
    }),

    createConversation: builder.mutation({
      query: (data) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conversation"],
    }),

    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Message"],
    }),

    markAsRead: builder.mutation({
      query: (data) => ({
        url: "/messages/read",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Message"],
    }),

    getUnreadCount: builder.query({
      query: (conversationId) =>
        `/conversations/${conversationId}/unread-count`,
    }),

    searchConversations: builder.query({
      query: (searchTerm) => ({
        url: "/conversations/search",
        params: { q: searchTerm },
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetUnreadCountQuery,
  useSearchConversationsQuery,
} = chatApi;
