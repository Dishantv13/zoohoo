import { configureStore } from "@reduxjs/toolkit";
// import customerReducer from "../features/customer/customer.slice";
import invoiceReducer from "../features/invoice/invoice.slice";
import authReducer from "../features/auth/authSlice";
import { invoiceApi } from "../features/invoice/invoiceApi";
import { customerApi } from "../features/customer/customerApi";
import { paymentApi } from "../features/payment/paymentApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // customers: customerReducer,
    invoices: invoiceReducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck: false}).concat(invoiceApi.middleware, customerApi.middleware, paymentApi.middleware),
});

export default store;
