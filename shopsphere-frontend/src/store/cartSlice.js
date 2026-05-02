import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/orders/cart");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch cart");
  }
});

export const addToCartAPI = createAsyncThunk("cart/addToCartAPI", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.post("/orders/cart/items", { productId, quantity });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to add to cart");
  }
});

export const updateCartItemAPI = createAsyncThunk("cart/updateCartItemAPI", async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/orders/cart/items/${id}`, { quantity });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to update cart item");
  }
});

export const removeCartItemAPI = createAsyncThunk("cart/removeCartItemAPI", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/orders/cart/items/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to remove item");
  }
});

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  loading: false,
};

const mapCartData = (state, payload) => {
    state.items = payload.items || [];
    state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
    state.totalAmount = payload.totalPrice || state.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        mapCartData(state, action.payload);
      })
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        mapCartData(state, action.payload);
      })
      .addCase(updateCartItemAPI.fulfilled, (state, action) => {
        mapCartData(state, action.payload);
      })
      .addCase(removeCartItemAPI.fulfilled, (state, action) => {
        mapCartData(state, action.payload);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
