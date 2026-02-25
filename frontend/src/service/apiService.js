import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
});

const authApi = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

const invoiceApi = axios.create({
  baseURL: "http://localhost:5000/api/invoices",
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
};

setupInterceptors(api);
setupInterceptors(authApi);
setupInterceptors(invoiceApi);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const apiService = {
  // Customer APIs
  customerProfile: () => api.get("/customers/profile"),
  updateCustomerProfile: (data) => api.put("/customers/profile", data),
  changePassword: (data) => api.put("/customers/change-password", data),
  deleteCustomerProfile: () => api.delete("/customers/profile"),

  // Payment APIs
  cardPayment: (data) => api.post("/payments/card", data),
  qrPayment: (data) => api.post("/payments/qr", data),

  // Authentication APIs
  register: (data) => authApi.post("/register", data),
  login: (data) => authApi.post("/login", data),
  logout: () => authApi.post("/logout"),
  adminRegister: (data) => authApi.post("/admin/register", data),
  getCurrentUser: () => authApi.get("/me"),

  // Admin Customer Management APIs
  createCustomer: (data) => authApi.post("/customers", data),
  getCustomers: (params) => authApi.get("/customers", { params }),
  updateCustomer: (customerId, data) =>
    authApi.put(`/customers/${customerId}`, data),
  deleteCustomer: (customerId) => authApi.delete(`/customers/${customerId}`),

  // Invoice APIs
  createInvoice: (data) => invoiceApi.post("/", data),
  getInvoices: (params) => invoiceApi.get("/", { params }),
  getInvoiceById: (id) => invoiceApi.get(`/${id}`),
  updateInvoice: (id, data) => invoiceApi.put(`/${id}`, data),
  updateInvoiceStatus: (id, status) =>
    invoiceApi.patch(`/${id}/status`, { status }),
  deleteInvoice: (id) => invoiceApi.delete(`/${id}`),
  downloadInvoice: (id) =>
    invoiceApi.get(`/${id}/download`, { responseType: "blob" }),
  getAdminAllInvoices: (params) => invoiceApi.get("/admin/all", { params }),
  getCustomerInvoices: (customerId, params) =>
    invoiceApi.get(`/admin/customer/${customerId}`, { params }),
};

export default apiService;
