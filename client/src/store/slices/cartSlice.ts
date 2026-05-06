import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface CartItem {
    id?: string; // MongoDB item ID in the cart items array
    product: string; // Product ID
    name: string;
    image: string;
    price: number;
    countInStock: number;
    qty: number;
    variant?: { size: string; color: string };
    selected?: boolean;
}

interface CartState {
    cartItems: CartItem[];
    shippingAddress: any;
    paymentMethod: string;
    loading: boolean;
    error: string | null;
}

const cartItemsFromStorage = localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems')!)
    : [];

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress')!)
    : {};

const initialState: CartState = {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
    paymentMethod: 'PayPal',
    loading: false,
    error: null,
};

const mapCartData = (data: any) => {
    return data.items.map((item: any) => ({
        id: item._id,
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || 'https://via.placeholder.com/150',
        price: item.product.price,
        countInStock: (item.product.variants && item.product.variants.length > 0)
            ? item.product.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
            : (item.product.stock || 0),
        qty: item.quantity,
        variant: item.variant,
        selected: item.selected !== undefined ? item.selected : true
    }));
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/cart');
        return mapCartData(data);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const addToCart = createAsyncThunk(
    'cart/add',
    async ({ productId, quantity, variant }: any, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/cart', { productId, quantity, variant });
            return mapCartData(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/update',
    async ({ itemId, quantity, selected }: any, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/cart/${itemId}`, { quantity, selected });
            return mapCartData(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const toggleItemSelection = createAsyncThunk(
    'cart/toggleSelection',
    async ({ itemId, selected }: any, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/cart/${itemId}`, { selected });
            return mapCartData(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const selectAllItems = createAsyncThunk(
    'cart/selectAll',
    async (selected: boolean, { rejectWithValue }) => {
        try {
            const { data } = await api.put('/cart', { selected });
            return mapCartData(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/remove',
    async (itemId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.delete(`/cart/${itemId}`);
            return mapCartData(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        saveShippingAddress: (state, action: PayloadAction<any>) => {
            state.shippingAddress = action.payload;
            localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
        },
        savePaymentMethod: (state, action: PayloadAction<string>) => {
            state.paymentMethod = action.payload;
            localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
        },
        clearCartLocal: (state) => {
            state.cartItems = [];
            localStorage.removeItem('cartItems');
        },
        clearSelectedCartItemsLocal: (state) => {
            state.cartItems = state.cartItems.filter(item => !item.selected);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addMatcher(
                (action) => [
                    addToCart.fulfilled.type, 
                    updateCartItem.fulfilled.type, 
                    removeFromCart.fulfilled.type, 
                    toggleItemSelection.fulfilled.type, 
                    selectAllItems.fulfilled.type
                ].includes(action.type),
                (state, action: PayloadAction<CartItem[]>) => {
                    state.cartItems = action.payload;
                    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                }
            );
    },
});

export const {
    saveShippingAddress,
    savePaymentMethod,
    clearCartLocal,
    clearSelectedCartItemsLocal
} = cartSlice.actions;

export default cartSlice.reducer;
