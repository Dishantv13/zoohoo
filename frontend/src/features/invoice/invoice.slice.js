import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api";

const defaultPagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

export const fetchInvoices = createAsyncThunk(
  "invoices/fetch",
  async (params = {}) => (await api.get("/invoices", { params })).data,
);

export const addInvoice = createAsyncThunk(
  "invoices/add",
  async (data) => (await api.post("/invoices", data)).data,
);

const invoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    list: [],
    loading: false,
    pagination: defaultPagination,
    summary: {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      confirmedAmount: 0,
      overdueCount: 0,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        const payload = action.payload;

        state.list = payload;
        state.pagination = defaultPagination;
        state.summary = action.payload.summary;

        state.list = payload?.data || [];
        state.pagination = payload?.pagination || defaultPagination;
        state.summary = payload?.summary || state.summary;

        state.loading = false;
      })
      .addCase(fetchInvoices.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default invoiceSlice.reducer;
