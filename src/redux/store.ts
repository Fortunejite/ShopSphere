import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './categorySlice';
import shopReducer from './shopSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    category: categoryReducer,
    shop: shopReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
