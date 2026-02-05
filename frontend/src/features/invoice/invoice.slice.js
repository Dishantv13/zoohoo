import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api";
import axios from 'axios';

export const fetchInvoices = createAsyncThunk(
  'invoices/fetch',
  async (data) => (await api.get("/invoices", data)).data
);

export const addInvoice = createAsyncThunk(
  "invoices/add",
  async (data) => (await api.post("/invoices", data)).data
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchInvoices.pending, state => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchInvoices.rejected, state => {
        state.loading = false;
      });
  },
});



export default invoiceSlice.reducer;

