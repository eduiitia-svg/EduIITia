import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const studentOrders = [];

      for (const docSnapshot of querySnapshot.docs) {
        const orderData = docSnapshot.data();

        let userId = null;
        if (orderData.userId) userId = orderData.userId;
        else if (typeof orderData.user === "string") userId = orderData.user;
        else if (orderData.user?.id) userId = orderData.user.id;

        let userData = null;
        if (userId) {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const u = userDoc.data();
            userData = {
              id: userDoc.id,
              name: u.name || null,
              email: u.email || null,
              role: u.role || null,
            };
          }
        }

        let planData = null;
        if (orderData.planId) {
          const planDocRef = doc(db, "subscriptionPlans", orderData.planId);
          const planDoc = await getDoc(planDocRef);

          if (planDoc.exists()) {
            const p = planDoc.data();
            planData = {
              name: p.name,
              price: p.price,
              duration: p.duration,
              type: p.type,
            };
          }
        }

        studentOrders.push({
          id: docSnapshot.id,
          ...orderData,
          user: userData,
          plan: planData,
          createdAt: orderData.createdAt?.toDate() || null,
          orderType: "student", 
        });
      }

      const teacherOrdersRef = collection(db, "teacherOrders");
      const teacherQuery = query(teacherOrdersRef, orderBy("createdAt", "desc"));
      const teacherQuerySnapshot = await getDocs(teacherQuery);

      const teacherOrders = [];

      for (const docSnapshot of teacherQuerySnapshot.docs) {
        const orderData = docSnapshot.data();

        let userId = null;
        if (orderData.userId) userId = orderData.userId;
        else if (typeof orderData.user === "string") userId = orderData.user;
        else if (orderData.user?.id) userId = orderData.user.id;

        let userData = null;
        if (userId) {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const u = userDoc.data();
            userData = {
              id: userDoc.id,
              name: u.name || null,
              email: u.email || null,
              role: u.role || null,
            };
          }
        }

        let planData = null;
        if (orderData.planId) {
          const planDocRef = doc(db, "teacherSubscriptionPlans", orderData.planId);
          const planDoc = await getDoc(planDocRef);

          if (planDoc.exists()) {
            const p = planDoc.data();
            planData = {
              name: p.name,
              price: p.price,
              duration: p.duration,
              type: p.type,
            };
          }
        }

        teacherOrders.push({
          id: docSnapshot.id,
          ...orderData,
          user: userData,
          plan: planData,
          createdAt: orderData.createdAt?.toDate() || orderData.completedAt?.toDate() || null,
          orderType: "teacher", 
        });
      }

      const allOrders = [...studentOrders, ...teacherOrders].sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt - a.createdAt;
      });

      return {
        success: true,
        count: allOrders.length,
        data: allOrders,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const getRevenueStats = createAsyncThunk(
  "orders/getRevenueStats",
  async (_, { rejectWithValue }) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("status", "==", "completed"));
      const querySnapshot = await getDocs(q);

      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          orderType: "student",
        });
      });

      const teacherOrdersRef = collection(db, "teacherOrders");
      const teacherQ = query(teacherOrdersRef, where("status", "==", "completed"));
      const teacherQuerySnapshot = await getDocs(teacherQ);

      const teacherOrders = [];
      teacherQuerySnapshot.forEach((doc) => {
        teacherOrders.push({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || doc.data().completedAt?.toDate(),
          orderType: "teacher",
        });
      });

      const allOrders = [...orders, ...teacherOrders];

      const totalRevenue = allOrders.reduce((sum, o) => {
        const amount = o.orderType === "teacher" ? (o.amount || 0) * 100 : (o.amount || 0);
        return sum + amount;
      }, 0);

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyOrders = allOrders.filter((o) => o.createdAt >= weekAgo);
      const weeklyRevenue = weeklyOrders.reduce((sum, o) => {
        const amount = o.orderType === "teacher" ? (o.amount || 0) * 100 : (o.amount || 0);
        return sum + amount;
      }, 0);

      const monthlyRevenue = {};
      allOrders.forEach((order) => {
        if (order.createdAt) {
          const month = order.createdAt.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          const amount = order.orderType === "teacher" ? (order.amount || 0) * 100 : (order.amount || 0);
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + amount;
        }
      });

      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      let totalUsers = 0;
      let totalAdmins = 0;
      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.role === "student") totalUsers++;
        if (user.role === "admin") totalAdmins++;
      });

      return {
        success: true,
        stats: {
          totalRevenue,
          weeklyRevenue,
          totalOrders: allOrders.length,
          totalUsers,
          totalAdmins,
          monthlyRevenue,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRevenueStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      });
  },
});

export default orderSlice.reducer;
