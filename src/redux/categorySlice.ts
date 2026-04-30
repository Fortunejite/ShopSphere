import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientErrorHandler } from '@/lib/errorHandler';
import axios from 'axios';
import { Category } from '@prisma/client';

interface IInitialState {
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  categories: Category[];
}

// Thunks for handling async operations
export const fetchShopCategories = createAsyncThunk(
  'category/fetchShopCategories',
  async (domain: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/shops/${domain}/categories`);
      return response.data;
    } catch (error) {
      const errorMessage = clientErrorHandler(error);
      return rejectWithValue(errorMessage);
    }
  },
);

const initialState: IInitialState = {
  categories: [],
  status: 'idle',
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchBrands
    builder
      .addCase(fetchShopCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShopCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchShopCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;