import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import dashboardReducer from "../slices/dashboardSlice";
import subscriptionReducer from "../slices/subscriptionSlice";
import testReducer from "../slices/testSlice";
import leaderboardReducer from "../slices/leaderboardSlice";
import analyticsReducer from "../slices/analyticsSlice";
import orderReducer from "../slices/orderSlice";
import questionReducer from "../slices/questionSlice";
import attemptReducer from "../slices/attemptSlice";
import contactReducer from "../slices/contactSlice";
import adminReducer from "../slices/adminSlice";
import paymentReducer from "../slices/paymentSlice";
import categoryReducer from "../slices/categorySlice";
import studyMaterialReducer from "../slices/studyMaterialSlice";

export default configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    subscription: subscriptionReducer,
    test: testReducer,
    leaderboard: leaderboardReducer,
    analytics: analyticsReducer,
    orders: orderReducer,
    questions: questionReducer,
    studyMaterial: studyMaterialReducer,
    attempts: attemptReducer,
    contact: contactReducer,
    admin: adminReducer,
    payment: paymentReducer,
    category: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
