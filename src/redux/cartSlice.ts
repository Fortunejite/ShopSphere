import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';
import { clientErrorHandler } from '@/lib/errorHandler';
import { CartWithProducts, CartItem } from '@/models/Cart';

interface IInitialState {
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  cart: CartWithProducts | null;
}

const initialState: IInitialState = {
  cart: null,
  status: 'idle',
  error: null,
};

/** Helper to wrap axios calls + error mapping */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function wrapRequest<T>(fn: () => Promise<T>, rejectWithValue: any) {
  try {
    return await fn();
  } catch (err) {
    const error = clientErrorHandler(err);
    console.error(error);
    return rejectWithValue(error);
  }
}

/** Thunks */
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (shopDomain: string, { rejectWithValue }) =>
    wrapRequest(
      () => axios.get<CartWithProducts>(`/api/shops/${shopDomain}/cart`).then((r) => r.data),
      rejectWithValue,
    ),
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { shopDomain, item }: { shopDomain: string; item: CartItem },
    { rejectWithValue }
  ) =>
    wrapRequest(
      () => axios.post(`/api/shops/${shopDomain}/cart`, item).then((r) => r.data.cart),
      rejectWithValue,
    ),
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (
    { 
      shopDomain, 
      product_id, 
      quantity, 
      variant_index 
    }: { 
      shopDomain: string; 
      product_id: number; 
      quantity: number; 
      variant_index?: number 
    },
    { rejectWithValue }
  ) =>
    wrapRequest(
      () => axios.put(`/api/shops/${shopDomain}/cart`, { 
        product_id, 
        quantity, 
        variant_index 
      }).then((r) => r.data.cart),
      rejectWithValue,
    ),
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (
    { 
      shopDomain, 
      product_id, 
      variant_index 
    }: { 
      shopDomain: string; 
      product_id: number; 
      variant_index?: number 
    },
    { rejectWithValue }
  ) =>
    wrapRequest(
      () => axios.delete(`/api/shops/${shopDomain}/cart`, {
        data: { product_id, variant_index }
      }).then((r) => r.data.cart),
      rejectWithValue,
    ),
);

/** Slice */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.error = null;
      state.status = 'idle';
    },
    resetCartStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // handle fulfilled
    builder.addMatcher(
      isAnyOf(
        fetchCart.fulfilled,
        addToCart.fulfilled,
        updateCartItem.fulfilled,
        removeFromCart.fulfilled
      ),
      (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
        state.error = null;
      },
    );
    
    // handle pending
    builder.addMatcher(
      isAnyOf(
        fetchCart.pending,
        addToCart.pending,
        updateCartItem.pending,
        removeFromCart.pending
      ),
      (state) => {
        state.status = 'loading';
        state.error = null;
      },
    );

    // handle errors
    builder.addMatcher(
      isAnyOf(
        fetchCart.rejected,
        addToCart.rejected,
        updateCartItem.rejected,
        removeFromCart.rejected
      ),
      (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      },
    );
  },
});

// Selectors
export const selectCart = (state: { cart: IInitialState }) => state.cart.cart;
export const selectCartItems = (state: { cart: IInitialState }) => state.cart.cart?.items || [];
export const selectCartStatus = (state: { cart: IInitialState }) => state.cart.status;
export const selectCartError = (state: { cart: IInitialState }) => state.cart.error;
export const selectCartItemCount = (state: { cart: IInitialState }) => state.cart.cart?.total_items || 0;
export const selectCartTotal = (state: { cart: IInitialState }) => state.cart.cart?.total_amount || 0;

export const itemInCart = (
  state: { cart: IInitialState },
  productId: number,
  variantIndex?: number
) => {
  const cart = state.cart.cart;
  if (!cart?.items) return false;
  return cart.items.some((item) => 
    item.product_id === productId && (typeof variantIndex === 'number' ? item.variant_index === variantIndex : true)
  );
};

export const getCartItemQuantity = (
  state: { cart: IInitialState },
  productId: number,
  variantIndex?: number
) => {
  const cart = state.cart.cart;
  if (!cart?.items) return 0;
  const item = cart.items.find((item) => 
    item.product_id === productId && item.variant_index === variantIndex
  );
  return item?.quantity || 0;
};

export const { clearCart, resetCartStatus } = cartSlice.actions;
export default cartSlice.reducer;
