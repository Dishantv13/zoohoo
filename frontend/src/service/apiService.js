import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

const customerApi = axios.create({
  baseURL: "http://localhost:5000/api/customers",
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

const dashboardApi = axios.create({
  baseURL: "http://localhost:5000/api/dashboard",
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

setupInterceptors(api);
setupInterceptors(customerApi);
setupInterceptors(authApi);
setupInterceptors(invoiceApi);
setupInterceptors(paymentApi);
setupInterceptors(dashboardApi);

export const apiService = {
  // Customer APIs
  customerProfile: () => customerApi.get("/profile"),
  updateCustomerProfile: (data) => customerApi.put("/update-profile", data),
  changePassword: (data) => customerApi.put("/change-password", data),
  deleteCustomerProfile: () => customerApi.delete("/delete-profile"),

  // Admin Customer Management APIs
  createCustomer: (data) => customerApi.post("/create-customers", data),
  getCustomers: (params) => customerApi.get("/get-customers", { params }),
  updateCustomer: (customerId, data) =>
    customerApi.put(`/update-customers/${customerId}`, data),
  deleteCustomer: (customerId) => customerApi.delete(`/delete-customers/${customerId}`),

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

  // report APIS
  getDashboardData: (params) => dashboardApi.get("/report", { params }),
};

export default apiService;
