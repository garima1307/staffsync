import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const applyLeave = createAsyncThunk('leaves/apply', async (leaveData, thunkAPI) => {
  try {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMyLeaves = createAsyncThunk('leaves/fetchMy', async (_, thunkAPI) => {
  try {
    const response = await api.get('/leaves/my');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAllLeaves = createAsyncThunk('leaves/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/leaves', { params });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateLeaveStatus = createAsyncThunk(
  'leaves/updateStatus',
  async ({ id, status, reviewRemarks }, thunkAPI) => {
    try {
      const response = await api.put(`/leaves/${id}`, { status, reviewRemarks });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const cancelLeave = createAsyncThunk('leaves/cancel', async (id, thunkAPI) => {
  try {
    await api.delete(`/leaves/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    myLeaves: [],
    allLeaves: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    clearLeaveStatus: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLeaves.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myLeaves = action.payload;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.myLeaves.unshift(action.payload.data);
      })
      .addCase(fetchAllLeaves.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allLeaves = action.payload;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.allLeaves = state.allLeaves.map((l) =>
          l._id === action.payload._id ? action.payload : l
        );
      })
      .addCase(cancelLeave.fulfilled, (state, action) => {
        state.myLeaves = state.myLeaves.filter((l) => l._id !== action.payload);
      });
  },
});

export const { clearLeaveStatus } = leaveSlice.actions;
export default leaveSlice.reducer;
