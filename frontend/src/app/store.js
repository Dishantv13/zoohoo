import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/customer/customer.slice";
import invoiceReducer from "../features/invoice/invoice.slice";

const store = configureStore({
  reducer: {
    customers: customerReducer,
    invoices: invoiceReducer
  }
});

export default store