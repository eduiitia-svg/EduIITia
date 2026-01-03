import React, { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import PerformanceOverview from "./PerformanceOverview";
import TestAnalytics from "./TestAnalytics";
import ProgressChart from "./ProgressChart";

import Sidebar from "./Sidebar";
import TestHistory from "./TestHistory";
import Leaderboard from "./LeaderBoard";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("history");
  const { dashboardData, loading, error, refreshData } = useDashboard();
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <PerformanceOverview data={dashboardData?.performance} />;
      case "analytics":
        return <TestAnalytics data={dashboardData?.attempts} />;
      case "progress":
        return <ProgressChart data={dashboardData?.progress} />;
      case "history":
        return <TestHistory />;
      case "leaderboard":
        return <Leaderboard />;
      default:
        return <PerformanceOverview data={dashboardData?.performance} />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />

        <div className="text-center relative z-10">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-emerald-500 animate-spin-reverse opacity-70" />
          </div>
          <p className="text-slate-400 tracking-widest text-sm uppercase">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-slate-200 flex relative overflow-x-hidden selection:bg-cyan-500/30">
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-200/20 dark:bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 lg:ml-72 transition-all duration-300 flex flex-col max-h-screen">
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#050505]/10 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800/80 h-24 flex items-center">
          <div className="px-6 lg:px-10 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-end gap-2">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400">
                  Performance Nexus
                </h1>
                <p className="text-gray-600 dark:text-slate-500 mt-1 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Track and analyze your decentralized metrics
                </p>
              </div>

              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 dark:bg-slate-900/50 text-cyan-600 dark:text-cyan-400 px-5 py-2 rounded-xl border border-cyan-400/40 dark:border-cyan-500/20 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:border-cyan-500/70 dark:hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-md disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Sync Data
              </button>
            </div>
          </div>
        </header>

        <main className="overflow-y-auto flex-1 h-full">
          <div className="p-6 lg:p-10 pt-0 max-w-7xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-b from-gray-100/40 dark:from-slate-900/20 to-transparent rounded-3xl -z-10" />

              <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl shadow-gray-500/10 dark:shadow-black/50 p-6 lg:p-8 min-h-[600px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
