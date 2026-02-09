import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/customer/customer.slice";
import invoiceReducer from "../features/invoice/invoice.slice";
import authReducer from "../features/auth/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    invoices: invoiceReducer
  }
});

export default store