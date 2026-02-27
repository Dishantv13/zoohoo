import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/customers",
  withCredentials: false,
});

const authApi = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

const invoiceApi = axios.create({
  baseURL: "http://localhost:5000/api/invoices",
});

const paymentApi = axios.create({
  baseURL: "http://localhost:5000/api/payments",
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
setupInterceptors(paymentApi);
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
  customerProfile: () => api.get("/profile"),
  updateCustomerProfile: (data) => api.put("/update-profile", data),
  changePassword: (data) => api.put("/change-password", data),
  deleteCustomerProfile: () => api.delete("/delete-profile"),

  // Admin Customer Management APIs
  createCustomer: (data) => api.post("/create-customers", data),
  getCustomers: (params) => api.get("/get-customers", { params }),
  updateCustomer: (customerId, data) =>
    api.put(`/update-customers/${customerId}`, data),
  deleteCustomer: (customerId) => api.delete(`/delete-customers/${customerId}`),

  // Payment APIs
  cardPayment: (data) => paymentApi.post("/card", data),
  qrPayment: (data) => paymentApi.post("/qr", data),
  cashPayment: (data) => paymentApi.post("/cash", data),
  getPaymentStatus: (invoiceId) => paymentApi.get(`/${invoiceId}/status`),
  getPaymentHistory: (invoiceId) => paymentApi.get(`/${invoiceId}/history`),

  // Authentication APIs
  register: (data) => authApi.post("/register", data),
  login: (data) => authApi.post("/login", data),
  logout: () => authApi.post("/logout"),
  adminRegister: (data) => authApi.post("/admin/register", data),
  getCurrentUser: () => authApi.get("/me"),

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
  exportInvoice: (params) =>
    invoiceApi.get("/export", { params, responseType: "blob" }),
};

export default apiService;
