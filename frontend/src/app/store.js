import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import { baseApi } from "../service/baseApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      baseApi.middleware,
    ),
});

export default store;
