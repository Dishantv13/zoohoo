import axios from "axios";

const invoiceApi = axios.create({
  baseURL: "http://localhost:5000/api/invoices",
});

invoiceApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const invoiceAPI = {
  createInvoice: (data) => invoiceApi.post("/", data),
  getInvoices: (params) => invoiceApi.get("/", { params }),
  getInvoiceById: (id) => invoiceApi.get(`/${id}`),
  updateInvoice: (id, data) => invoiceApi.put(`/${id}`, data),
  updateInvoiceStatus: (id, status) => invoiceApi.patch(`/${id}/status`, { status }),
  deleteInvoice: (id) => invoiceApi.delete(`/${id}`),
  downloadInvoice: (id) => invoiceApi.get(`/${id}/download`, { responseType: "blob" }),

  getAdminAllInvoices: (params) => invoiceApi.get("/admin/all", { params }),
  getCustomerInvoices: (customerId, params) => invoiceApi.get(`/admin/customer/${customerId}`, { params }),
};

export default invoiceApi;
