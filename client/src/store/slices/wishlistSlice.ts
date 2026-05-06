import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface WishlistState {
    items: any[];
    loading: boolean;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
    const { data } = await api.get('/wishlist');
    return data.products || [];
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId: string) => {
    const { data } = await api.post('/wishlist', { productId });
    return data.products || [];
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId: string) => {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return data.products || [];
});

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.items = action.payload;
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.items = action.payload;
            });
    },
});

export default wishlistSlice.reducer;
