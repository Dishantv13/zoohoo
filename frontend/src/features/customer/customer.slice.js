import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api";

export const fetchCustomers = createAsyncThunk(
  'customers/fetch',
  async () => { 
    const res = await api.get('/customers');
    return res.data; 
  }
);

const slice = createSlice({
  name: 'customers',
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default slice.reducer;
