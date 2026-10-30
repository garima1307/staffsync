import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/employees', { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchEmployeeStats = createAsyncThunk('employees/fetchStats', async (_, thunkAPI) => {
  try {
    const response = await api.get('/employees/stats/summary');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (employeeData, thunkAPI) => {
  try {
    const response = await api.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteEmployee = createAsyncThunk('employees/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/employees/${id}`);
    return { id, message: response.data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    employees: [],
    stats: null,
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    clearEmployeeStatus: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.data;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((emp) => emp._id !== action.payload.id);
      });
  },
});

export const { clearEmployeeStatus } = employeeSlice.actions;
export default employeeSlice.reducer;
