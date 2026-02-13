import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardHome from "../componets/admin/DashboardHome";
import UploadCSV from "../componets/admin/UploadCSV";
import TestAttempts from "../componets/admin/TestAttempts";
import QuestionPapers from "../componets/admin/QuestionPapers";
 
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/upload" element={<UploadCSV/>} />
          <Route path="/papers" element={<QuestionPapers/>} />
          <Route path="/attempts" element={<TestAttempts/>}/>
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
