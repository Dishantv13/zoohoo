import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../service/api";

export const fetchCustomers = createAsyncThunk(
  'customers/fetch',
  async () => { 
    const res = await api.get('/customers');
    return res.data; // 🔥 MUST return array
  }
);


export const addCustomer = createAsyncThunk(
  "customers/add",
  async (data) => (await api.post("/api/customer", data)).data
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
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.list = action.payload; 
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});


export default slice.reducer;
