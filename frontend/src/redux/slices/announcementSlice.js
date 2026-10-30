import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAnnouncements = createAsyncThunk('announcements/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/announcements', { params });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createAnnouncement = createAsyncThunk('announcements/create', async (data, thunkAPI) => {
  try {
    const response = await api.post('/announcements', data);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteAnnouncement = createAsyncThunk('announcements/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/announcements/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const announcementSlice = createSlice({
  name: 'announcements',
  initialState: {
    announcements: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.announcements = action.payload;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter((a) => a._id !== action.payload);
      });
  },
});

export default announcementSlice.reducer;
