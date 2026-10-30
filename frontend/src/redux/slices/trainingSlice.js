import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTrainings = createAsyncThunk('trainings/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/trainings', { params });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createTraining = createAsyncThunk('trainings/create', async (data, thunkAPI) => {
  try {
    const response = await api.post('/trainings', data);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const enrollTraining = createAsyncThunk('trainings/enroll', async (id, thunkAPI) => {
  try {
    const response = await api.post(`/trainings/${id}/enroll`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateTraining = createAsyncThunk('trainings/update', async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put(`/trainings/${id}`, data);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteTraining = createAsyncThunk('trainings/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/trainings/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const trainingSlice = createSlice({
  name: 'trainings',
  initialState: {
    trainings: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTrainings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trainings = action.payload;
      })
      .addCase(createTraining.fulfilled, (state, action) => {
        state.trainings.push(action.payload);
      })
      .addCase(enrollTraining.fulfilled, (state, action) => {
        state.trainings = state.trainings.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
      })
      .addCase(updateTraining.fulfilled, (state, action) => {
        state.trainings = state.trainings.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
      })
      .addCase(deleteTraining.fulfilled, (state, action) => {
        state.trainings = state.trainings.filter((t) => t._id !== action.payload);
      });
  },
});

export default trainingSlice.reducer;
