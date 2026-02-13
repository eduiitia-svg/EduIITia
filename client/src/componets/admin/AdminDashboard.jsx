import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./SideBar";
import UploadCSV from "./UploadCSV";
import DashboardHome from "./DashboardHome";
import QuestionPapers from "./QuestionPapers";
import TestAttempts from "./TestAttempts";
import CategoryManagement from "./CategoryManagement";
import RegistrationRequestsDashboard from "./RegistrationRequestsDashboard";
import StudyMaterialManagement from "./StudyMaterialManagement";
import TestimonialManagement from "./TestimonialManagement";
import FeatureGate from "../FeatureGate";
import { getTeacherSubscriptionStatus } from "../../slices/subscriptionSlice";
import { useDispatch, useSelector } from "react-redux";

const AdminDashboard = () => {
  const location = useLocation();
  const dispatch = useDispatch()
  const {user} = useSelector((state) => state.auth)

  useEffect(() => {
    if (user?.uid && user?.role === "admin") {
      dispatch(getTeacherSubscriptionStatus(user.uid));
    }
  }, [dispatch, user?.uid, user?.role]);

  const noisePattern = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white overflow-hidden relative selection:bg-emerald-500/30">
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{ backgroundImage: noisePattern }}
      />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 dark:bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-900/10 dark:bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="relative z-20 hidden md:block shrink-0 h-full">
        <Sidebar />
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
        <div className="p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto min-h-full">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route
                path="dashboard"
                element={
                  <PageWrapper>
                    <DashboardHome />
                  </PageWrapper>
                }
              />
              <Route
                path="upload"
                element={
                  <PageWrapper>
                    <FeatureGate
                      featureName="Upload Questions"
                      userType="teacher"
                      variant="full"
                    >
                      <UploadCSV />
                    </FeatureGate>
                  </PageWrapper>
                }
              />

              <Route
                path="papers"
                element={
                  <PageWrapper>
                    <FeatureGate
                      featureName="Question Papers"
                      userType="teacher"
                      variant="full"
                    >
                      <QuestionPapers />
                    </FeatureGate>
                  </PageWrapper>
                }
              />

              <Route
                path="study-materials"
                element={
                  <PageWrapper>
                    <FeatureGate
                      featureName="Study Material"
                      userType="teacher"
                      variant="full"
                    >
                      <StudyMaterialManagement />
                    </FeatureGate>
                  </PageWrapper>
                }
              />

              <Route
                path="attempts"
                element={
                  <PageWrapper>
                    <FeatureGate
                      featureName="Test Attempts"
                      userType="teacher"
                      variant="full"
                    >
                      <TestAttempts />
                    </FeatureGate>
                  </PageWrapper>
                }
              />

              <Route
                path="categories"
                element={
                  <PageWrapper>
                    <FeatureGate
                      featureName="Categories"
                      userType="teacher"
                      variant="full"
                    >
                      <CategoryManagement />
                    </FeatureGate>
                  </PageWrapper>
                }
              />

              <Route
                path="testimonials"
                element={
                  <PageWrapper>
                    <FeatureGate
                      featureName="Add Testimonials"
                      userType="teacher"
                      variant="full"
                    >
                      <TestimonialManagement />
                    </FeatureGate>
                  </PageWrapper>
                }
              />
              <Route
                path="student-approval"
                element={
                  <PageWrapper>
                    <RegistrationRequestsDashboard />
                  </PageWrapper>
                }
              />

              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default AdminDashboard;
