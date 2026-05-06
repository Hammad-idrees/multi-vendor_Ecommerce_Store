import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface ProductState {
    products: any[];
    product: any;
    loading: boolean;
    error: string | null;
    page: number;
    pages: number;
    total: number;
}

const initialState: ProductState = {
    products: [],
    product: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
    total: 0,
};

export const listProducts = createAsyncThunk(
    'products/list',
    async (
        { keyword = '', pageNumber = 1, category = '', minPrice = '', maxPrice = '', minRating = '', sort = '' }: any = {},
        { rejectWithValue }
    ) => {
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (pageNumber) params.append('pageNumber', String(pageNumber));
            if (category) params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minRating) params.append('minRating', minRating);
            if (sort) params.append('sort', sort);

            const { data } = await api.get(`/products?${params.toString()}`);
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

export const listProductDetails = createAsyncThunk(
    'products/details',
    async (id: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/products/${id}`);
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(listProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.total = action.payload.total;
            })
            .addCase(listProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(listProductDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listProductDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload;
            })
            .addCase(listProductDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default productSlice.reducer;
