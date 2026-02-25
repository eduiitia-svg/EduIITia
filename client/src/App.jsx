import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import { logout, setUser } from "./slices/authSlice";
import {
  getSubscriptionStatus,
  getTeacherSubscriptionStatus,
} from "./slices/subscriptionSlice";
import ProtectedRoute from "./layout/ProtectedRoute";
import SpotlightBackground from "./ui/SpotlightBackground";
import SubscriptionMonitor from "./layout/SubscriptionMonitor";

const Home = lazy(() => import("./Pages/Home"));
const Dashboard = lazy(() => import("./componets/dashboard/Dashboard"));
const ProfilePage = lazy(() => import("./componets/ProfilePage"));
const TestInterface = lazy(() => import("./componets/test/TestInterface"));
const RecentTestsHome = lazy(() => import("./componets/RecentTestsHome"));
const TestAnalysis = lazy(() => import("./ui/TestAnalysis"));
const ResetPasswordPage = lazy(() => import("./componets/ResetPasswordPage"));
const SuperApp = lazy(() => import("./super-admin/SuperApp"));
const AdminDashboard = lazy(() => import("./componets/admin/AdminDashboard"));
const LegalPages = lazy(() => import("./componets/LegalPages"));
const TeacherPricing = lazy(() => import("./componets/TeacherPricing"));

import { TestProvider } from "./context/TestContext.jsx";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { LeaderboardProvider } from "./context/LeaderboardContext.jsx";
import { SubscriptionProvider } from "./context/SubscriptionContext.jsx";
import StudentStudyMaterial from "./componets/StudentStudyMaterial.jsx";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./componets/ScrollToTop.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";

const StudentRoutes = () => (
  <SubscriptionProvider>
    <DashboardProvider>
      <TestProvider>
        <LeaderboardProvider>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profilePage" element={<ProfilePage />} />
            <Route path="/test/:testId" element={<TestInterface />} />
            <Route path="/study" element={<RecentTestsHome />} />
            <Route path="/study-material" element={<StudentStudyMaterial />} />
            <Route
              path="/test-analysis/:attemptId"
              element={<TestAnalysis />}
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </LeaderboardProvider>
      </TestProvider>
    </DashboardProvider>
  </SubscriptionProvider>
);

const AdminRoutes = () => (
  <SubscriptionProvider>
    <AdminProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/*" element={<AdminDashboard />} />
        </Routes>
      </ThemeProvider>
    </AdminProvider>
  </SubscriptionProvider>
);

const SuperAdminRoutes = () => (
  <Routes>
    <Route path="/*" element={<SuperApp />} />
  </Routes>
);

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

useEffect(() => {
  const SESSION_DURATION = 24 * 60 * 60 * 1000;

  const isSessionValid = () => {
    try {
      const storedData = localStorage.getItem("user");
      if (!storedData) return false;

      const parsedData = JSON.parse(storedData);
      const loginTimestamp = parsedData.loginTimestamp;

      if (!loginTimestamp) {
        localStorage.setItem("user", JSON.stringify({
          ...parsedData,
          loginTimestamp: Date.now(),
        }));
        return true;
      }

      return (Date.now() - loginTimestamp) < SESSION_DURATION;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  };

  const initializeAuth = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      if (!isSessionValid()) {
        localStorage.clear();
        dispatch(logout());
        toast.error("Your session has expired. Please login again.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userData = parsedUser.user || parsedUser;

      const currentUserId = auth.currentUser?.uid;
      if (currentUserId && currentUserId !== userData.uid) {
        localStorage.clear();
        window.location.reload();
        return;
      }

      dispatch(setUser(userData));

      if (userData?.uid) {
        const userRef = doc(db, "users", userData.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const freshUserData = userSnap.data();
          const updatedUser = { uid: userData.uid, ...freshUserData };

          dispatch(setUser(updatedUser));
          
          const existingTimestamp = parsedUser.loginTimestamp || Date.now();
          localStorage.setItem("user", JSON.stringify({
            user: updatedUser,
            loginTimestamp: existingTimestamp,
          }));

          if (freshUserData.role === "student" && freshUserData.subscription) {
            dispatch(getSubscriptionStatus(userData.uid));
          } else if (freshUserData.role === "admin") {
            dispatch(getTeacherSubscriptionStatus(userData.uid));
          }
        } else {
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      localStorage.removeItem("user");
    }
  };

  initializeAuth();

 
  const timeout = setTimeout(() => {
    const intervalId = setInterval(() => {
      if (localStorage.getItem("user") && !isSessionValid()) {
        localStorage.clear();
        dispatch(logout());
        toast.error("Your session has expired. Please login again.", {
          duration: 4000,
        });
        window.location.href = "/";
      }
    }, 30 * 1000);

    return () => clearInterval(intervalId);
  }, 5000); 

  return () => clearTimeout(timeout);
}, [dispatch]);

  return (
    <div className="relative min-h-screen w-full text-gray-900 dark:text-gray-200">
      <Toaster position="bottom-right" />
      <SpotlightBackground />
      <SubscriptionMonitor />

      <div className="relative z-10">
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-white dark:bg-transparent">
              Loading...
            </div>
          }
        >
          <ScrollToTop />

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/super/*"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <SuperAdminRoutes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher-pricing"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <TeacherPricing />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRoutes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/*"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentRoutes />
                  </ProtectedRoute>
                }
              />

              <Route path="/legal-terms/:type?" element={<LegalPages />} />

              <Route
                path="/"
                element={
                  user?.role === "superadmin" ? (
                    <Navigate to="/super/dashboard" replace />
                  ) : user?.role === "admin" ? (
                    user?.hasActiveTeacherSubscription ? (
                      <Navigate to="/admin/dashboard" replace />
                    ) : (
                      <Navigate to="/teacher-pricing" replace />
                    )
                  ) : (
                    <Home />
                  )
                }
              />

              <Route
                path="*"
                element={
                  user?.role === "superadmin" ? (
                    <Navigate to="/super/dashboard" replace />
                  ) : user?.role === "admin" ? (
                    user?.hasActiveTeacherSubscription ? (
                      <Navigate to="/admin/dashboard" replace />
                    ) : (
                      <Navigate to="/teacher-pricing" replace />
                    )
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
};

export default App;
