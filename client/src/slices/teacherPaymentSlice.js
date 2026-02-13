import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL;

export const createTeacherCheckout = createAsyncThunk(
  "teacherPayment/createCheckout",
  async ({ userId, planId }, { rejectWithValue }) => {
    try {
      // Fetch teacher plan details
      const planRef = doc(db, "teacherSubscriptionPlans", planId);
      const planSnap = await getDoc(planRef);
      
      if (!planSnap.exists()) {
        return rejectWithValue("Teacher plan not found");
      }
      
      const plan = { id: planSnap.id, ...planSnap.data() };
      const amount = Math.round((plan.price || 0) * 100); 

      // Create Razorpay order
      const response = await axios.post(`${API_URL}/api/payment/create-teacher-order`, {
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
          duration: plan.duration,
          price: plan.price,
          mockTestLimit: plan.mockTestLimit,
          examType: plan.examType,
          subject: plan.subject,
          classLevel: plan.classLevel,
        },
      };
    } catch (error) {
      console.error("❌ Teacher checkout error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create checkout"
      );
    }
  }
);

export const verifyTeacherPayment = createAsyncThunk(
  "teacherPayment/verifyPayment",
  async (
    { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, planId },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/api/payment/verify-teacher`, {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
        planId,
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      const userRef = doc(db, "users", userId);
      const planRef = doc(db, "teacherSubscriptionPlans", planId);
      const planSnap = await getDoc(planRef);
      
      if (planSnap.exists()) {
        const planData = planSnap.data();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planData.duration);

        await updateDoc(userRef, {
          teacherSubscription: {
            planId: planId,
            planName: planData.name,
            startDate: startDate,
            endDate: endDate,
            isActive: true,
            mockTestsGenerated: 0,
            mockTestLimit: planData.mockTestLimit,
            mainCategory: planData.mainCategory || "All", 
            examType: planData.examType || "All",
            subject: planData.subject || "All",
            classLevel: planData.classLevel || "All",
            subcategory: planData.subcategory || "All",
            purchasedAt: startDate,
          },
          hasActiveTeacherSubscription: true,
          updatedAt: serverTimestamp(),
        });
      }

      return response.data;
    } catch (error) {
      console.error("❌ Teacher payment verification error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Payment verification failed"
      );
    }
  }
);

const teacherPaymentSlice = createSlice({
  name: "teacherPayment",
  initialState: {
    currentOrder: null,
    loading: false,
    error: null,
    checkoutData: null,
  },
  reducers: {
    clearTeacherPaymentError: (state) => {
      state.error = null;
    },
    resetTeacherPayment: (state) => {
      state.currentOrder = null;
      state.checkoutData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTeacherCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeacherCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutData = action.payload;
      })
      .addCase(createTeacherCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyTeacherPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTeacherPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(verifyTeacherPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTeacherPaymentError, resetTeacherPayment } =
  teacherPaymentSlice.actions;

export default teacherPaymentSlice.reducer;