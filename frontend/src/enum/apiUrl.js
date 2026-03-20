export const AUTH_URL = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  GET_CURRENT_USER: "/auth/me",
  ADMIN_REGISTER: "/auth/admin/register",
};

export const BILL_URL = {
    GET_BILLS: "/bills",
    GET_BILL_BY_ID: (billId) => `/bills/${billId}`,
    CREATE_BILL: "/bills",
    UPDATE_BILL: (billId) => `/bills/${billId}`,
    UPDATE_BILL_STATUS: (billId) => `/bills/${billId}/status`,
    DELETE_BILL: (billId) => `/bills/${billId}`,
    GET_BILLS_STATS: "/bills/stats/summary",
};

export const CUSTOMER_URL = {
    CHANGE_PASSWORD: "/customers/change-password",
    UPDATE_CUSTOMER_PROFILE: "/customers/update-profile",
    DELETE_CUSTOMER_PROFILE: "/customers/delete-profile",
    ADMIN_CREATE_CUSTOMER: "/customers/create-customers",
    GET_CUSTOMERS: "/customers/get-customers",
    ADMIN_UPDATE_CUSTOMER: (customerId) => `/customers/update-customers/${customerId}`,
    ADMIN_DELETE_CUSTOMER: (customerId) => `/customers/delete-customers/${customerId}`,
};

export const INVOICE_URL = {
    CREATE_INVOICE: "/invoices",
    GET_ALL_INVOICES: "/invoices",
    GET_INVOICE_BY_ID: (invoiceId) => `/invoices/${invoiceId}`,
    UPDATE_INVOICE: (invoiceId) => `/invoices/${invoiceId}`,
    UPDATE_INVOICE_STATUS: (invoiceId) => `/invoices/${invoiceId}/status`,
    DELETE_INVOICE: (invoiceId) => `/invoices/${invoiceId}`,
    DOWNLOAD_INVOICE: (invoiceId) => `/invoices/${invoiceId}/download`,
    GET_ADMIN_ALL_INVOICES: "/invoices/admin/all",
    GET_CUSTOMER_INVOICES: (customerId) => `/invoices/admin/customer/${customerId}`,
    EXPORT_INVOICE: "/invoices/export",
    INVOICE_STATE_CARD: "/invoices/state-card",
};

export const ITEM_URL = {
    GET_INVENTORY_ITEMS: "/items",
    GET_VENDOR_AVAILABILITY: (vendorId) => `/items/availability/${vendorId}`,
    CREATE_INVENTORY_ITEM: "/items",
    UPDATE_INVENTORY_ITEM: (itemId) => `/items/${itemId}`,
    DELETE_INVENTORY_ITEM: (itemId) => `/items/${itemId}`,
}

export const PAYMENT_URL = {
    CARD_PAYMENT: "/payments/card",
    UPI_PAYMENT: "/payments/qr",
    CASH_PAYMENT: "/payments/cash",
    GET_PAYMENT_STATUS: (invoiceId) => `/payments/${invoiceId}/status`,
    GET_PAYMENT_HISTORY: (invoiceId) => `/payments/${invoiceId}/history`,
    GET_BILL_PAYMENT_HISTORY: (billId) => `/payments/bill/${billId}/history`,
};

export const REPORT_URL = {
    GET_DASHBOARD : "/report/dashboard",
    GET_MONTHLY_REVENUE : "/report/monthly-revenue",
    GET_YEARLY_REVENUE : "/report/yearly-revenue",
    GET_TODAY_REVENUE : "/report/today-revenue",
    GET_TOP_CUSTOMERS : "/report/top-customers",
    GET_MONTHLY_EXPENSE : "/report/monthly-expense",
    GET_YEARLY_EXPENSE : "/report/yearly-expense",
    GET_TODAY_EXPENSE : "/report/today-expense",
    GET_TOP_VENDORS : "/report/top-vendors",
};

export const VENDOR_URL = {
    GET_VENDORS: "/vendors",
    CREATE_VENDOR: "/vendors",
    UPDATE_VENDOR: (vendorId) => `/vendors/${vendorId}`,
    DELETE_VENDOR: (vendorId) => `/vendors/${vendorId}`,
    GET_VENDOR_STATS: (vendorId) => `/vendors/${vendorId}/stats`,
    GET_VENDOR_BILLS: (vendorId) => `/vendors/${vendorId}/bills`,
};

export const ROUTE_PATHS = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    ADMIN_DELETE_CUSTOMER: "/admin/register",
    CREATE_INVOICE: "/create-invoice",
    INVOICES: "/invoices",
    CUSTOMER_MANAGEMENT: "/admin/customers",
    VENDOR_MANAGEMENT: "/admin/vendors",
    ADMIN_CREATE_INVOICE: "/admin/customer/create-invoice",
    ADMIN_CREATE_BILL: "/admin/vendor/create-bill",
    ADMIN_VENDOR_BILLS: "/admin/vendor/bills",
    ADMIN_INVOICE_MANAGEMENT: "/admin/customer/invoices",
    VENDOR_INVENTORY: "/vendor/inventory",
    REPORT: "/report",
    REVENUE_REPORT: "/revenue-report",
    EXPENSE_REPORT: "/expense-report",
    INVOICE_ID : (invoice) => `/invoices/${invoice._id}`,
    FALSE : "*",
}

