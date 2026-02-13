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
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ============================================
// EXISTING STUDENT SUBSCRIPTION CODE (UNCHANGED)
// ============================================

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
  },
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
  },
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
        const end = sub.endDate.toDate
          ? sub.endDate.toDate()
          : new Date(sub.endDate);
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
        daysRemaining: Math.ceil(
          (endDate - new Date()) / (1000 * 60 * 60 * 24),
        ),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const activateSubscription = createAsyncThunk(
  "subscription/activateSubscription",
  async ({ userId, planId, durationDays }, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return rejectWithValue("User not found");
      const planRef = doc(db, "subscriptionPlans", planId);
      const planSnap = await getDoc(planRef);

      if (!planSnap.exists()) {
        return rejectWithValue("Plan not found");
      }

      const planData = planSnap.data();

      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + durationDays);

      const subs = userSnap.data().subscription || [];
      const updated = subs.map((s) => ({ ...s, isActive: false }));

      updated.push({
        plan: planId,
        planName: planData.name,
        planType: planData.type,
        subject: planData.subject || "All",
        subcategory: planData.subcategory || "All",
        mainCategory: planData.mainCategory || "All",
        testLimit: planData.testLimit || 0,
        price: planData.price,
        duration: planData.duration,
        features: planData.features || [],
        description: planData.description || "",
        startDate: start,
        endDate: end,
        isActive: true,
      });

      await updateDoc(userRef, {
        subscription: updated,
        updatedAt: serverTimestamp(),
      });

      return { uid: userId, subscription: updated };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },

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
        orderBy("submittedAt", "desc"),
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
  },
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
  },
);

export const createPlan = createAsyncThunk(
  "subscriptions/createPlan",
  async (data, { rejectWithValue }) => {
    try {
      const {
        name,
        type,
        price,
        duration,
        features,
        description,
        testLimit,
        subject,
        subcategory,
        mainCategory,
      } = data;

      const plansRef = collection(db, "subscriptionPlans");
      const exists = await getDocs(query(plansRef, where("name", "==", name)));

      if (!exists.empty)
        throw new Error("A plan with this name already exists");

      const newPlanRef = await addDoc(plansRef, {
        name,
        type,
        price: price || 0,
        duration,
        features: features || [],
        description: description || "",
        testLimit: testLimit || 0,
        subject: subject || "All",
        subcategory: subcategory || "All",
        mainCategory: mainCategory || "All",
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
  },
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
  },
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
  },
);

// ============================================
// NEW TEACHER SUBSCRIPTION PLANS
// ============================================

export const getAllTeacherPlans = createAsyncThunk(
  "subscription/getAllTeacherPlans",
  async (_, { rejectWithValue }) => {
    try {
      const ref = collection(db, "teacherSubscriptionPlans");
      const q = query(
        ref,
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);

      return {
        success: true,
        count: snapshot.docs.length,
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const createTeacherPlan = createAsyncThunk(
  "subscription/createTeacherPlan",
  async (data, { rejectWithValue }) => {
    try {
      const {
        name,
        price,
        duration,
        features,
        description,
        mockTestLimit,
        mainCategory,
        examType,
        subject,
        classLevel,
        subcategory,
      } = data;

      const plansRef = collection(db, "teacherSubscriptionPlans");

      const newPlanRef = await addDoc(plansRef, {
        name,
        price: price || 0,
        duration,
        features: features || [],
        description: description || "",
        mockTestLimit: mockTestLimit || 0,
        mainCategory: mainCategory || "",
        examType: examType || "All",
        subject: subject || "All",
        classLevel: classLevel || "All",
        subcategory: subcategory || "All",
        isActive: true,
        createdAt: serverTimestamp(),
      });

      const newSnap = await getDoc(newPlanRef);

      return {
        success: true,
        message: "Teacher plan created successfully",
        data: { id: newPlanRef.id, ...newSnap.data() },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTeacherPlan = createAsyncThunk(
  "subscription/updateTeacherPlan",
  async ({ planId, updates }, { rejectWithValue }) => {
    try {
      const ref = doc(db, "teacherSubscriptionPlans", planId);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });

      const snap = await getDoc(ref);

      return {
        success: true,
        message: "Teacher plan updated",
        data: { id: planId, ...snap.data() },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTeacherPlan = createAsyncThunk(
  "subscription/deleteTeacherPlan",
  async (planId, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, "teacherSubscriptionPlans", planId));

      return {
        success: true,
        message: "Teacher plan deleted",
        planId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const purchaseTeacherPlan = createAsyncThunk(
  "subscription/purchaseTeacherPlan",
  async ({ userId, planId }, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const planRef = doc(db, "teacherSubscriptionPlans", planId);

      const [userSnap, planSnap] = await Promise.all([
        getDoc(userRef),
        getDoc(planRef),
      ]);

      if (!userSnap.exists()) return rejectWithValue("User not found");
      if (!planSnap.exists()) return rejectWithValue("Plan not found");

      const userData = userSnap.data();
      const planData = planSnap.data();

      if (userData.role !== "admin") {
        return rejectWithValue("Only teachers can purchase teacher plans");
      }

      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + planData.duration);

      await updateDoc(userRef, {
        teacherSubscription: {
          planId: planId,
          planName: planData.name,
          startDate: start,
          endDate: end,
          isActive: true,
          mockTestsGenerated: 0,
          mockTestLimit: planData.mockTestLimit,
          mainCategory: planData.mainCategory || "All", 
          examType: planData.examType,
          subject: planData.subject,
          classLevel: planData.classLevel,
          subcategory: planData.subcategory,
          purchasedAt: start,
        },
        hasActiveTeacherSubscription: true,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: "Plan purchased successfully",
        subscription: {
          planId,
          planName: planData.name,
          mockTestLimit: planData.mockTestLimit,
          mainCategory: planData.mainCategory, 
          examType: planData.examType,
          subject: planData.subject,
          classLevel: planData.classLevel,
          subcategory: planData.subcategory,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getTeacherSubscriptionStatus = createAsyncThunk(
  "subscription/getTeacherSubscriptionStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return rejectWithValue("User not found");

      const data = userSnap.data();
      const teacherSub = data.teacherSubscription;

      if (!teacherSub || !teacherSub.isActive) {
        return {
          hasSubscription: false,
          isActive: false,
          subscriptionEndDate: null,
          daysRemaining: 0,
          mockTestsGenerated: 0,
          mockTestLimit: 0,
          features: [],
        };
      }

      const endDate = teacherSub.endDate.toDate
        ? teacherSub.endDate.toDate()
        : new Date(teacherSub.endDate);

      const isStillActive = new Date() < endDate;

      if (!isStillActive) {
        await updateDoc(userRef, {
          "teacherSubscription.isActive": false,
          hasActiveTeacherSubscription: false,
        });

        return {
          hasSubscription: false,
          isActive: false,
          subscriptionEndDate: endDate,
          daysRemaining: 0,
          mockTestsGenerated: teacherSub.mockTestsGenerated || 0,
          mockTestLimit: teacherSub.mockTestLimit || 0,
          features: [],
        };
      }

      let features = [];
      if (teacherSub.planId) {
        const planRef = doc(db, "teacherSubscriptionPlans", teacherSub.planId);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          features = planSnap.data().features || [];
        }
      }

      return {
        hasSubscription: true,
        isActive: true,
        planName: teacherSub.planName,
        planId: teacherSub.planId,
        subscriptionEndDate: endDate,
        daysRemaining: Math.ceil(
          (endDate - new Date()) / (1000 * 60 * 60 * 24),
        ),
        mockTestsGenerated: teacherSub.mockTestsGenerated || 0,
        mockTestLimit: teacherSub.mockTestLimit || 0,
        examType: teacherSub.examType,
        subject: teacherSub.subject,
        classLevel: teacherSub.classLevel,
        subcategory: teacherSub.subcategory,
        features: features,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const incrementMockTestCount = createAsyncThunk(
  "subscription/incrementMockTestCount",
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return rejectWithValue("User not found");

      const data = userSnap.data();
      const teacherSub = data.teacherSubscription;

      if (!teacherSub || !teacherSub.isActive) {
        return rejectWithValue("No active subscription");
      }

      const currentCount = teacherSub.mockTestsGenerated || 0;
      const limit = teacherSub.mockTestLimit || 0;

      if (limit > 0 && currentCount >= limit) {
        return rejectWithValue("Mock test limit reached for your subscription");
      }

      await updateDoc(userRef, {
        "teacherSubscription.mockTestsGenerated": increment(1),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        newCount: currentCount + 1,
        limit: limit,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const checkTeacherTestCreationAccess = createAsyncThunk(
  "subscription/checkTeacherTestCreationAccess",
  async ({ userId, testDetails }, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { canCreate: false, reason: "User not found" };
      }

      const data = userSnap.data();
      const teacherSub = data.teacherSubscription;

      if (!teacherSub || !teacherSub.isActive) {
        return {
          canCreate: false,
          reason:
            "No active subscription. Please purchase a plan to create mock tests.",
        };
      }

      const endDate = teacherSub.endDate.toDate
        ? teacherSub.endDate.toDate()
        : new Date(teacherSub.endDate);

      if (new Date() >= endDate) {
        return {
          canCreate: false,
          reason: "Your subscription has expired. Please renew to continue.",
        };
      }

      const currentCount = teacherSub.mockTestsGenerated || 0;
      const limit = teacherSub.mockTestLimit || 0;

      if (limit > 0 && currentCount >= limit) {
        return {
          canCreate: false,
          reason: `You've reached your mock test limit (${limit}). Upgrade your plan to create more tests.`,
        };
      }

      const { mainCategory, examType, subject, classLevel, subcategory } = testDetails || {};

      const subMainCategory = teacherSub.mainCategory;
      const subExamType = teacherSub.examType;
      const subSubject = teacherSub.subject;
      const subClass = teacherSub.classLevel;
      const subSubcategory = teacherSub.subcategory;

      if (
        subMainCategory &&
        subMainCategory !== "All" &&
        mainCategory &&
        mainCategory !== subMainCategory
      ) {
        return {
          canCreate: false,
          reason: `Your subscription only covers "${subMainCategory}" category. This category is for "${mainCategory}".`,
        };
      }

      if (
        subExamType &&
        subExamType !== "All" &&
        examType &&
        examType !== subExamType
      ) {
        return {
          canCreate: false,
          reason: `Your subscription only covers ${subExamType}. This test is for ${examType}.`,
        };
      }

      if (
        subSubject &&
        subSubject !== "All" &&
        subject &&
        subject !== subSubject
      ) {
        return {
          canCreate: false,
          reason: `Your subscription only covers ${subSubject}. This test is for ${subject}.`,
        };
      }

      if (
        subClass &&
        subClass !== "All" &&
        classLevel &&
        classLevel !== subClass
      ) {
        return {
          canCreate: false,
          reason: `Your subscription only covers ${subClass}. This test is for ${classLevel}.`,
        };
      }

      if (subSubcategory && subSubcategory !== "All" && subcategory) {
        if (subcategory !== subSubcategory) {
          return {
            canCreate: false,
            reason: `Your subscription only covers ${subSubject} → ${subSubcategory}. This test is for ${subject} → ${subcategory}.`,
          };
        }
      }

      return {
        canCreate: true,
        remaining: limit > 0 ? limit - currentCount : "Unlimited",
        subscription: teacherSub,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    plans: [],
    teacherPlans: [],
    currentSubscription: null,
    teacherSubscription: null,
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
    // Student subscriptions (existing)
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
      })
      .addCase(getPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      })
      .addCase(getAllPlans.fulfilled, (state, action) => {
        state.plans = action.payload.data;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.plans.unshift(action.payload.data);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const i = state.plans.findIndex((p) => p.id === action.payload.data.id);
        if (i !== -1) state.plans[i] = action.payload.data;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p.id !== action.payload.planId);
      })
      .addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      })
      .addCase(getUserTestHistory.fulfilled, (state, action) => {
        state.testHistory = action.payload.testHistory;
      });

    // Teacher subscriptions (new)
    builder
      .addCase(getAllTeacherPlans.fulfilled, (state, action) => {
        state.teacherPlans = action.payload.data;
      })
      .addCase(createTeacherPlan.fulfilled, (state, action) => {
        state.teacherPlans.unshift(action.payload.data);
      })
      .addCase(updateTeacherPlan.fulfilled, (state, action) => {
        const i = state.teacherPlans.findIndex(
          (p) => p.id === action.payload.data.id,
        );
        if (i !== -1) state.teacherPlans[i] = action.payload.data;
      })
      .addCase(deleteTeacherPlan.fulfilled, (state, action) => {
        state.teacherPlans = state.teacherPlans.filter(
          (p) => p.id !== action.payload.planId,
        );
      })
      .addCase(getTeacherSubscriptionStatus.fulfilled, (state, action) => {
        state.teacherSubscription = action.payload;
      })
      .addCase(purchaseTeacherPlan.fulfilled, (state, action) => {
        state.teacherSubscription = action.payload.subscription;
      });
  },
});

export const { clearSubscriptionError, resetSubscription } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;
