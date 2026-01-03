import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL 

export const createCheckout = createAsyncThunk(
  "payment/createCheckout",
  async ({ userId, planId }, { rejectWithValue }) => {
    try {
      
      
      const planRef = await getDocs(
        query(collection(db, "subscriptionPlans"), where("__name__", "==", planId))
      );
      
      if (planRef.empty) {
        return rejectWithValue("Plan not found");
      }
      
      const plan = { id: planRef.docs[0].id, ...planRef.docs[0].data() };
      const amount = Math.round((plan.price || 0) * 100); 


      
      const response = await axios.post(`${API_URL}/api/payment/create-order`, {
        userId,
        planId,
        amount,
      });


      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return {
        ...response.data,
        plan: {
          id: plan.id,
          name: plan.name,
          type: plan.type,
          duration: plan.duration,
          price: plan.price,
        },
      };
    } catch (error) {
      console.error("❌ Checkout error:", error);
      console.error("❌ Error response:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create checkout"
      );
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (
    { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId },
    { rejectWithValue }
  ) => {
    try {
      
      const response = await axios.post(`${API_URL}/api/payment/verify`, {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return response.data;
    } catch (error) {
      console.error("Verification error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Payment verification failed"
      );
    }
  }
);

export const getUserOrders = createAsyncThunk(
  "payment/getUserOrders",
  async (userId, { rejectWithValue }) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("user", "==", userId));
      const snapshot = await getDocs(q);

      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return orders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    currentOrder: null,
    orders: [],
    loading: false,
    error: null,
    checkoutData: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPayment: (state) => {
      state.currentOrder = null;
      state.checkoutData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutData = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, resetPayment } = paymentSlice.actions;

export default paymentSlice.reducer;