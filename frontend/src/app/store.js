import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import { invoiceApi } from "../service/invoiceApi";
import { customerApi } from "../service/customerApi";
import { paymentApi } from "../service/paymentApi";
import { reportApi } from "../service/reportApi";
import { authApi } from "../service/authApi";
import { chatApi } from "../service/chatApi";
import { vendorApi } from "../service/vendorApi";
import { billApi } from "../service/billApi";
import { itemApi } from "../service/itemApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [billApi.reducerPath]: billApi.reducer,
    [itemApi.reducerPath]: itemApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      invoiceApi.middleware,
      customerApi.middleware,
      paymentApi.middleware,
      reportApi.middleware,
      authApi.middleware,
      chatApi.middleware,
      vendorApi.middleware,
      itemApi.middleware,
      billApi.middleware,
    ),
});

export default store;
