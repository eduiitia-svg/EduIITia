import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Analytics from "./Pages/Analytics";
import Dashboard from "./Pages/Dashboard";
import ManageAdmins from "./Pages/ManageAdmins";
import ManageUsers from "./Pages/ManageUsers";
import Orders from "./Pages/Orders";
import SubscriptionPlans from "./Pages/SubscriptionPlans";
import { useState } from "react";
import { motion } from "motion/react";
import TeacherPlanManagement from "../componets/admin/TeacherPlanManagement";

function SuperApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 260 : 80 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="flex-1 min-h-screen"
      >
        <Navbar sidebarOpen={sidebarOpen} />
        <main className="p-6 pt-24">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="plans" element={<SubscriptionPlans />} />
            <Route
              path="teacher-plans"
              element={<TeacherPlanManagement />}
            />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </motion.div>
    </div>
  );
}

export default SuperApp;
