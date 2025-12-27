import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';
import { clientErrorHandler } from '@/lib/errorHandler';
import { CartWithProducts, CartItem, CartItemWithProduct } from '@/models/Cart';
import { 
  getLocalCart,
  addToLocalCart, 
  updateLocalCartQuantity, 
  removeFromLocalCart,
  clearLocalCart 
} from '@/lib/localCart';

interface IInitialState {
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  cart: CartWithProducts | null;
  isAuthenticated: boolean;
}

const initialState: IInitialState = {
  cart: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
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

/** Helper to create a local cart object from localStorage items */
// function createLocalCartObject(shopDomain: string): CartWithProducts {
//   const localItems = getLocalCart(shopDomain);
  
//   const totalItems = localItems.reduce((sum, item) => sum + item.quantity, 0);
//   const totalAmount = localItems.reduce((sum, item) => sum + item.subtotal, 0);

//   const now = new Date();
//   return {
//     id: 0, // Local cart doesn't have an ID
//     user_id: 0, // Local cart doesn't have a user ID
//     shop_id: 0, // We'll need to get this from shop domain if needed
//     total_items: totalItems,
//     total_amount: totalAmount,
//     created_at: now,
//     updated_at: now,
//     items: localItems
//   };
// }

/** Thunks */
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (shopDomain: string, { rejectWithValue, getState }) => {
    const state = getState() as { cart: IInitialState };
    
    if (!state.cart.isAuthenticated) {
      return getLocalCart();
    }
    
    return wrapRequest(
      () => axios.get<CartWithProducts>(`/api/shops/${shopDomain}/cart`).then((r) => r.data),
      rejectWithValue,
    );
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { shopDomain, item }: { shopDomain: string; item: CartItemWithProduct },
    { rejectWithValue, getState }
  ) => {
    const state = getState() as { cart: IInitialState };
    
    // If not authenticated, add to local cart
    if (!state.cart.isAuthenticated) {
      return addToLocalCart(item);
    }

    // For authenticated users, convert CartItemWithProduct back to CartItem for the API
    const apiItem: CartItem = {
      product_id: item.product_id,
      quantity: item.quantity,
      variant_index: item.variant_index
    };

    return wrapRequest(
      () => axios.post(`/api/shops/${shopDomain}/cart`, apiItem).then((r) => r.data.cart),
      rejectWithValue,
    );
  }
);

// New thunk for adding items with just product info (will fetch product data)
// export const addProductToCart = createAsyncThunk(
//   'cart/addProductToCart',
//   async (
//     { 
//       shopDomain, 
//       productId, 
//       quantity, 
//       variantIndex 
//     }: { 
//       shopDomain: string; 
//       productId: number; 
//       quantity: number; 
//       variantIndex?: number 
//     },
//     { rejectWithValue, getState }
//   ) => {
//     const state = getState() as { cart: IInitialState };
    
//     // If not authenticated, we need to fetch product data first
//     if (!state.cart.isAuthenticated) {
//       return wrapRequest(
//         async () => {
//           // Fetch product data
//           const productResponse = await axios.get(`/api/shops/${shopDomain}/products/${productId}`);
//           const product = productResponse.data;
          
//           // Create cart item with product data
//           const variantPrice = variantIndex !== undefined && product.variants?.[variantIndex]
//             ? product.variants[variantIndex].price || product.price
//             : undefined;
            
//           const cartItemWithProduct = createCartItemWithProduct(
//             { product_id: productId, quantity, variant_index: variantIndex },
//             product,
//             variantPrice
//           );
          
//           addToLocalCart(shopDomain, cartItemWithProduct);
//           return createLocalCartObject(shopDomain);
//         },
//         rejectWithValue,
//       );
//     }

//     // For authenticated users, use the regular API
//     const apiItem: CartItem = {
//       product_id: productId,
//       quantity,
//       variant_index: variantIndex
//     };

//     return wrapRequest(
//       () => axios.post(`/api/shops/${shopDomain}/cart`, apiItem).then((r) => r.data.cart),
//       rejectWithValue,
//     );
//   }
// );

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
    { rejectWithValue, getState }
  ) => {
    const state = getState() as { cart: IInitialState };
    
    // If not authenticated, update local cart
    if (!state.cart.isAuthenticated) {
      return updateLocalCartQuantity(product_id, quantity, variant_index);
    }

    return wrapRequest(
      () => axios.put(`/api/shops/${shopDomain}/cart`, { 
        product_id, 
        quantity, 
        variant_index 
      }).then((r) => r.data.cart),
      rejectWithValue,
    );
  }
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
    { rejectWithValue, getState }
  ) => {
    const state = getState() as { cart: IInitialState };
    
    // If not authenticated, update local cart
    if (!state.cart.isAuthenticated) {
      return removeFromLocalCart(product_id, variant_index);
    }

    return wrapRequest(
      () => axios.delete(`/api/shops/${shopDomain}/cart`, {
        data: { product_id, variant_index }
      }).then((r) => r.data.cart),
      rejectWithValue,
    );
  }
);

// New thunk for merging local cart with authenticated cart
export const mergeLocalCart = createAsyncThunk(
  'cart/mergeLocalCart',
  async (shopDomain: string, { rejectWithValue }) =>
    wrapRequest(
      async () => {
        const localItemsWithProduct = getLocalCart().items;
        if (localItemsWithProduct.length === 0) {
          return axios.get<CartWithProducts>(`/api/shops/${shopDomain}/cart`).then((r) => r.data);
        }
        
        // Convert CartItemWithProduct[] to CartItem[] for the merge API
        const localItems: CartItem[] = localItemsWithProduct.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          variant_index: item.variant_index
        }));
        
        const response = await axios.post(`/api/shops/${shopDomain}/cart/merge`, {
          items: localItems
        });
        
        // Clear local cart after successful merge
        clearLocalCart();
        
        return response.data.cart;
      },
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
    setCartAuthenticationStatus: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    clearLocalCart: (state) => {
      clearLocalCart();
      // Reset cart to null or empty cart if this was the current shop
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    // Handle all cart operations (fulfilled) - both authenticated and local
    builder.addMatcher(
      isAnyOf(
        fetchCart.fulfilled,
        addToCart.fulfilled,
        updateCartItem.fulfilled,
        removeFromCart.fulfilled,
        mergeLocalCart.fulfilled,
      ),
      (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
        state.error = null;
      },
    );
    
    // Handle pending states
    builder.addMatcher(
      isAnyOf(
        fetchCart.pending,
        addToCart.pending,
        updateCartItem.pending,
        removeFromCart.pending,
        mergeLocalCart.pending,
      ),
      (state) => {
        state.status = 'loading';
        state.error = null;
      },
    );

    // Handle errors
    builder.addMatcher(
      isAnyOf(
        fetchCart.rejected,
        addToCart.rejected,
        updateCartItem.rejected,
        removeFromCart.rejected,
        mergeLocalCart.rejected,
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
export const selectIsAuthenticated = (state: { cart: IInitialState }) => state.cart.isAuthenticated;

export const selectCartItems = (state: { cart: IInitialState }) => {
  return state.cart.cart?.items || [];
};

export const selectCartStatus = (state: { cart: IInitialState }) => state.cart.status;
export const selectCartError = (state: { cart: IInitialState }) => state.cart.error;

export const selectCartItemCount = (state: { cart: IInitialState }) => {
  return state.cart.cart?.total_items || 0;
};

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

export const { 
  clearCart, 
  resetCartStatus, 
  setCartAuthenticationStatus, 
  clearLocalCart: clearLocalCartAction 
} = cartSlice.actions;
export default cartSlice.reducer;
