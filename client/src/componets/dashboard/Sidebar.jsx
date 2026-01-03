import React from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Trophy,
  X,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

const Sidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: "history", label: "Test History", icon: Clock },
    { id: "overview", label: "Performance Overview", icon: BarChart3 },
    { id: "analytics", label: "Test Analytics", icon: PieChart },
    { id: "progress", label: "Progress Over Time", icon: TrendingUp },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 },
  };

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
        style={{ display: "none" }}
        id="mobile-overlay"
        onClick={() =>
          document.getElementById("sidebar").classList.add("-translate-x-full")
        }
      ></div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#050505] border-r border-gray-200 dark:border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[5px_0_30px_rgba(0,0,0,0.5)] z-50 transform lg:transform-none transition-transform duration-300 -translate-x-full lg:translate-x-0 overflow-hidden"
        id="sidebar"
      >
        <div className="absolute top-0 left-0 w-full h-64 bg-emerald-200/30 dark:bg-emerald-900/20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400 tracking-tight">
                Analytic
              </h2>
            </Link>

            <button
              className="lg:hidden text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() =>
                document
                  .getElementById("sidebar")
                  .classList.add("-translate-x-full")
              }
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <motion.li key={item.id} variants={itemVariants}>
                    <button
                      onClick={() => onSectionChange(item.id)}
                      className={`relative group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-white/5 border border-cyan-400/40 dark:border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-400 to-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                      )}

                      <Icon
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isActive
                            ? "scale-110 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                            : "group-hover:scale-105"
                        }`}
                      />

                      <span
                        className={`font-medium tracking-wide text-sm ${
                          isActive ? "font-semibold" : ""
                        }`}
                      >
                        {item.label}
                      </span>

                      {!isActive && (
                        <div className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                        </div>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-r from-gray-200 to-gray-300 dark:from-slate-800 dark:to-slate-700 border border-gray-300 dark:border-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                US
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                User Account
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
