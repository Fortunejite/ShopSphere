import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './categorySlice';
import shopReducer from './shopSlice';
const store = configureStore({
  reducer: {
    category: categoryReducer,
    shop: shopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
