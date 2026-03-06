import { configureStore } from "@reduxjs/toolkit";
// import customerReducer from "../features/customer/customer.slice";
import invoiceReducer from "../features/invoice/invoice.slice";
import authReducer from "../features/auth/authSlice";
import { invoiceApi } from "../features/invoice/invoiceApi";
import { customerApi } from "../features/customer/customerApi";
import { paymentApi } from "../features/payment/paymentApi";
import { reportApi } from "../features/report/reportApi";
import { authApi } from "../features/auth/authApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // customers: customerReducer,
    invoices: invoiceReducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      invoiceApi.middleware,
      customerApi.middleware,
      paymentApi.middleware,
      reportApi.middleware,
      authApi.middleware,
    ),
});

export default store;
