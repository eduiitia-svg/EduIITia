import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const checkTestAccess = createAsyncThunk(
  "subscription/checkTestAccess",
  async ({ userId, testType }, { rejectWithValue }) => {
    try {
      if (testType?.toLowerCase() === "demo") {
        return {
          canTakeTest: true,
          planType: "Demo Test",
          message: "Demo test - no subscription required",
        };
      }

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return rejectWithValue("User not found");

      const subscriptions = userSnap.data().subscription || [];
      const activeSub = subscriptions.find((sub) => sub.isActive === true);

      if (activeSub) {
        return {
          canTakeTest: true,
          planType: activeSub.plan || "Premium",
          message: "Access granted",
        };
      }

      return rejectWithValue("Please subscribe to access this test");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const getPlans = createAsyncThunk(
  "subscription/getPlans",
  async (_, { rejectWithValue }) => {
    try {
      const plansRef = collection(db, "subscriptionPlans");
      const q = query(plansRef, where("isActive", "==", true));
      const snapshot = await getDocs(q);

      const plans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return plans;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSubscriptionStatus = createAsyncThunk(
  "subscription/getSubscriptionStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return rejectWithValue("User not found");

      const data = userSnap.data();
      const subs = data.subscription || [];

      const activeSub = subs.find((sub) => {
        if (!sub.isActive || !sub.endDate) return false;
        const end = sub.endDate.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
        return new Date() < end;
      });

      if (!activeSub) {
        return {
          planType: "Free",
          isActive: false,
          subscriptionEndDate: null,
          daysRemaining: 0,
        };
      }

      const endDate = activeSub.endDate.toDate
        ? activeSub.endDate.toDate()
        : new Date(activeSub.endDate);

      return {
        planType: activeSub.plan || "Premium",
        isActive: true,
        subscriptionEndDate: endDate,
        daysRemaining: Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const activateSubscription = createAsyncThunk(
  "subscription/activateSubscription",
  async ({ userId, planId, durationDays }, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return rejectWithValue("User not found");

      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + durationDays);

      const subs = snap.data().subscription || [];

      const updated = subs.map((s) => ({ ...s, isActive: false }));

      updated.push({
        plan: planId,
        startDate: start,
        endDate: end,
        isActive: true,
      });

      await updateDoc(userRef, {
        subscription: updated,
        updatedAt: serverTimestamp(),
      });

      return { uid: userId, ...updated };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserTestHistory = createAsyncThunk(
  "subscription/getUserTestHistory",
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return rejectWithValue("User not found");

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("user", "==", userId),
        orderBy("submittedAt", "desc")
      );
      const snapshot = await getDocs(q);

      const testHistory = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        testHistory,
        totalTestsTaken: testHistory.length,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllPlans = createAsyncThunk(
  "subscriptions/getAllPlans",
  async (_, { rejectWithValue }) => {
    try {
      const ref = collection(db, "subscriptionPlans");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return {
        success: true,
        count: snapshot.docs.length,
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPlan = createAsyncThunk(
  "subscriptions/createPlan",
  async (data, { rejectWithValue }) => {
    try {
      const { name, type, price, duration, features, description, testLimit } = data;

      const plansRef = collection(db, "subscriptionPlans");
      const exists = await getDocs(query(plansRef, where("name", "==", name)));

      if (!exists.empty) throw new Error("A plan with this name already exists");

      const newPlanRef = await addDoc(plansRef, {
        name,
        type,
        price: price || 0,
        duration,
        features: features || [],
        description: description || "",
        testLimit: testLimit || 0,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      const newSnap = await getDoc(newPlanRef);

      return {
        success: true,
        message: "Subscription plan created",
        data: { id: newPlanRef.id, ...newSnap.data() },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePlan = createAsyncThunk(
  "subscriptions/updatePlan",
  async ({ planId, updates }, { rejectWithValue }) => {
    try {
      const ref = doc(db, "subscriptionPlans", planId);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });

      const snap = await getDoc(ref);

      return {
        success: true,
        message: "Plan updated",
        data: { id: planId, ...snap.data() },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePlan = createAsyncThunk(
  "subscriptions/deletePlan",
  async (planId, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, "subscriptionPlans", planId));

      return {
        success: true,
        message: "Plan deleted",
        planId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    plans: [],
    currentSubscription: null,
    testHistory: [],
    testAccess: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetSubscription: (state) => {
      state.currentSubscription = null;
      state.testHistory = [];
      state.testAccess = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkTestAccess.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkTestAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.testAccess = action.payload;
      })
      .addCase(checkTestAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.testAccess = { canTakeTest: false };
      });

    builder
      .addCase(getPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      });

    builder
      .addCase(getAllPlans.fulfilled, (state, action) => {
        state.plans = action.payload.data;
      });


    builder.addCase(createPlan.fulfilled, (state, action) => {
      state.plans.unshift(action.payload.data);
    });


    builder.addCase(updatePlan.fulfilled, (state, action) => {
      const i = state.plans.findIndex((p) => p.id === action.payload.data.id);
      if (i !== -1) state.plans[i] = action.payload.data;
    });


    builder.addCase(deletePlan.fulfilled, (state, action) => {
      state.plans = state.plans.filter((p) => p.id !== action.payload.planId);
    });


    builder
      .addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      });

    builder
      .addCase(getUserTestHistory.fulfilled, (state, action) => {
        state.testHistory = action.payload.testHistory;
      });
  },
});

export const { clearSubscriptionError, resetSubscription } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;
