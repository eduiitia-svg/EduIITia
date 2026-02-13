import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Home,
  UploadCloud,
  FileText,
  Users,
  LogOut,
  ChevronRight,
  Zap,
  FolderPlus,
  CloudCheck,
  BookAudioIcon,
  TrendingUpDown,
  Moon,
  Sun,
  Lock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { useTheme } from "../../context/ThemeProvider";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const { teacherSubscription } = useSelector((state) => state.subscription);


  const hasFeatureAccess = (featureName) => {
  if (
    !teacherSubscription?.isActive ||
    !teacherSubscription?.hasSubscription
  ) {
    return false;
  }
  
  const features = teacherSubscription?.features || []
  return features.includes(featureName);
};

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await dispatch(logout()).unwrap();
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      featureName: "Dashboard",
      alwaysAccessible: true,
    },
    {
      path: "/admin/upload",
      label: "Upload Questions",
      icon: <UploadCloud size={20} />,
      featureName: "Upload Questions",
    },
    {
      path: "/admin/papers",
      label: "Question Papers",
      icon: <FileText size={20} />,
      featureName: "Question Papers",
    },
    {
      path: "/admin/study-materials",
      label: "Study Material",
      icon: <BookAudioIcon size={20} />,
      featureName: "Study Material",
    },
    {
      path: "/admin/attempts",
      label: "Test Attempts",
      icon: <Users size={20} />,
      featureName: "Test Attempts",
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: <FolderPlus size={20} />,
      featureName: "Categories",
    },
    {
      path: "/admin/student-approval",
      label: "Approve/Reject Students",
      icon: <CloudCheck size={20} />,
      featureName: "Approve/Reject Students",
      alwaysAccessible: true,
    },
    {
      path: "/admin/testimonials",
      label: "Add Testimonials",
      icon: <TrendingUpDown size={20} />,
      featureName: "Add Testimonials",
    },
  ];

  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="left-0 top-0 h-full w-72 bg-white/80 dark:bg-transparent text-gray-700 dark:text-gray-300 flex flex-col justify-between border-r border-gray-200 dark:border-white/5 relative overflow-hidden backdrop-blur-xl"
    >
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-400/10 dark:bg-[#4FFFB0]/3 opacity-50 dark:opacity-100 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/3 opacity-50 dark:opacity-100 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#4FFFB0] to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,255,176,0.3)]">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:block p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
              ADMIN<span className="text-[#4FFFB0]">.PANEL</span>
            </h1>
          </div>

          {user && (
            <motion.div
              variants={itemVariants}
              className="mt-2 p-3 pr-5 rounded-2xl 
      bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] 
      dark:bg-white/5 dark:border-white/10 dark:shadow-none
      backdrop-blur-xl flex items-center gap-4 group cursor-pointer
      transition-all duration-300 
      hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-emerald-100 dark:hover:bg-white/10 dark:hover:border-white/20"
            >
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-full 
        bg-gray-50 border border-gray-100 
        dark:bg-white/5 dark:border-white/10 
        flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-emerald-500 dark:text-[#4FFFB0] font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#1a1a1a] shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-[15px] font-bold text-gray-800 dark:text-gray-100 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-[#4FFFB0] transition-colors">
                  {user.name}
                </h4>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                  {user.role === "superadmin" ? "Super Admin" : user.role}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <nav className="mt-2 px-4 space-y-1">
          {menuItems.map((item) => {
            const isLocked =
              !item.alwaysAccessible && !hasFeatureAccess(item.featureName);

            return (
              <NavLink
                key={item.path}
                to={isLocked ? "#" : item.path}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    toast.error(
                      `${item.label} requires an active subscription`,
                    );
                    navigate("/teacher-pricing");
                  }
                }}
                className={({ isActive }) =>
                  `relative group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 overflow-hidden ${
                    isLocked
                      ? "opacity-60 cursor-not-allowed"
                      : isActive
                        ? "text-[#020403] font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isLocked && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-linear-to-r from-[#4FFFB0] to-teal-400 rounded-xl"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-3 flex-1">
                      <span
                        className={`transition-transform duration-300 ${
                          isActive && !isLocked
                            ? "scale-110"
                            : "group-hover:scale-110"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="tracking-wide">{item.label}</span>
                    </span>

                    {isLocked ? (
                      <Lock
                        size={16}
                        className="ml-auto text-amber-500 dark:text-amber-400 relative z-10"
                      />
                    ) : !isActive ? (
                      <ChevronRight
                        size={16}
                        className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#4FFFB0]"
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/5 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={loggingOut || loading}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut
            size={18}
            className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors"
          />
          <span className="font-medium tracking-wide">
            {loggingOut ? "Disconnecting..." : "Disconnect"}
          </span>
        </motion.button>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-semibold">
            System v2.4.0
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
