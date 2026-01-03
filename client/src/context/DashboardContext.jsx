import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getPerformanceOverview,
  getTestAttempts,
  getProgressOverTime,
  getTestComparison,
  clearDashboardError,
} from "../slices/dashboardSlice";
const DashboardContext = createContext();
export const DashboardProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    performanceOverview,
    testAttempts,
    progressOverTime,
    testComparison,
    loading,
    error,
  } = useSelector((state) => state.dashboard);
  const loadDashboardData = async () => {
    if (!user?.uid) {
      return;
    }
    if (user.role !== "student") {
      return;
    }
    const uid = user.uid;
    try {
      await Promise.all([
        dispatch(getPerformanceOverview(uid)),
        dispatch(getTestAttempts({ userId: uid })),
        dispatch(getProgressOverTime({ userId: uid })),
        dispatch(getTestComparison(uid)),
      ]);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };
  useEffect(() => {
    if (user?.uid && user?.role === "student") {
      loadDashboardData();
    }
  }, [user?.uid, user?.role]);
  const refreshData = async () => {
    if (user?.role !== "student") {
      return;
    }
    await loadDashboardData();
  };
  const clearError = () => {
    dispatch(clearDashboardError());
  };
  const fetchTestHistory = async () => {
    return testAttempts || [];
  };
  const dashboardData = {
    performance: performanceOverview,
    attempts: testAttempts,
    progress: progressOverTime,
    comparison: testComparison,
  };
  const value = {
    dashboardData,
    performanceOverview,
    testAttempts,
    progressOverTime,
    testComparison,
    loading,
    error,
    refreshData,
    clearError,
    fetchTestHistory,
    isStudent: user?.role === "student",
  };
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};