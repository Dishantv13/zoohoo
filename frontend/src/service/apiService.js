import axios from "axios";

const chatApi = axios.create({
  baseURL: "http://localhost:5000/api/chat",
});

const setupInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
};
setupInterceptors(chatApi);
export const apiService = {
    
  // Chat APIs
  getConversations: (params) => chatApi.get("/conversations", { params }),
  getMessages: (conversationId, params) =>
    chatApi.get(`/conversations/${conversationId}/messages`, { params }),
  createConversation: (data) => chatApi.post("/conversations", data),
  sendMessage: (data) => chatApi.post("/messages", data),
  markAsRead: (data) => chatApi.put("/messages/read", data),
  getUnreadCount: (conversationId) =>
    chatApi.get(`/conversations/${conversationId}/unread`),
  searchConversations: (params) =>
    chatApi.get("/conversations/search", { params }),
};

export default apiService;
