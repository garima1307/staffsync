import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const checkInUser = createAsyncThunk('attendance/checkIn', async (data = {}, thunkAPI) => {
  try {
    const response = await api.post('/attendance/check-in', data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const checkOutUser = createAsyncThunk('attendance/checkOut', async (_, thunkAPI) => {
  try {
    const response = await api.post('/attendance/check-out');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMyAttendance = createAsyncThunk('attendance/fetchMy', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAllAttendance = createAsyncThunk('attendance/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/attendance', { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    myRecords: [],
    todayRecord: null,
    allRecords: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    clearAttendanceStatus: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkInUser.fulfilled, (state, action) => {
        state.todayRecord = action.payload.data;
        state.myRecords.unshift(action.payload.data);
      })
      .addCase(checkOutUser.fulfilled, (state, action) => {
        state.todayRecord = action.payload.data;
        state.myRecords = state.myRecords.map((r) =>
          r._id === action.payload.data._id ? action.payload.data : r
        );
      })
      .addCase(fetchMyAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRecords = action.payload.data;
        state.todayRecord = action.payload.today;
      })
      .addCase(fetchAllAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRecords = action.payload.data;
      });
  },
});

export const { clearAttendanceStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
