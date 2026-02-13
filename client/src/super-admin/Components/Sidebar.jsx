import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice";

const Sidebar = ({ open, setOpen }) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const links = [
    {
      name: "Dashboard",
      path: "/super/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Admins", path: "/super/admins", icon: <ShieldCheck size={20} /> },
    { name: "Users", path: "/super/users", icon: <Users size={20} /> },
    { name: "Plans", path: "/super/plans", icon: <CreditCard size={20} /> },
    { name: "Teacher Plans", path: "/super/teacher-plans", icon: <CreditCard size={20} /> },
    { name: "Orders", path: "/super/orders", icon: <FileText size={20} /> },
    {
      name: "Analytics",
      path: "/super/analytics",
      icon: <BarChart3 size={20} />,
    },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await dispatch(logout()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  const SidebarContent = (
    <motion.aside
      initial={false}
      animate={{ width: open ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[#020617] border-r border-white/5 text-slate-300 shadow-2xl shadow-emerald-900/10 overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex items-center h-20 px-4 mb-4">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            onClick={() => setOpen(!open)}
            className="min-w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <Zap size={22} fill="white" />
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-lg font-bold text-white tracking-wide truncate">
                  {user?.name || "Admin"}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase">
                  {user?.role === "superadmin"
                    ? "Super Admin"
                    : user?.role === "admin"
                    ? "Admin"
                    : "User"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className={`absolute right-[18px] top-8 bg-[#0f172a] border border-white/10 text-emerald-400 p-1 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-lg z-50 ${
            !open && "hidden"
          }`}
        >
          {open && <ChevronLeft size={14} />}
        </button>
      </div>

      <AnimatePresence>
        {open && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mx-3 mb-4 p-3 rounded-xl bg-linear-to-br from-white/5 to-white/2 border border-white/5 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent" />
            <div className="relative">
              <p className="text-xs text-slate-400 mb-1">Email</p>
              <p className="text-sm text-white font-medium truncate">
                {user.email}
              </p>
              {user.phone && (
                <>
                  <p className="text-xs text-slate-400 mt-2 mb-1">Phone</p>
                  <p className="text-sm text-white">{user.phone}</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="relative z-10 flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide">
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              to={link.path}
              key={link.name}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-linear-to-r from-emerald-500/20 to-cyan-500/5 border-l-2 border-emerald-400 rounded-r-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 50 }}
                />
              )}

              <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div
                className={`relative z-10 min-w-6 transition-colors duration-300 ${
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-400 group-hover:text-emerald-300"
                }`}
              >
                {link.icon}
              </div>

              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="relative z-10 font-medium whitespace-nowrap"
                  >
                    {link.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {!open && isActive && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 p-3 mt-auto">
        <button
          onClick={handleLogout}
          disabled={loggingOut || loading}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            open ? "justify-start" : "justify-center"
          }`}
        >
          <LogOut
            size={20}
            className="text-slate-400 group-hover:text-rose-400 transition-colors"
          />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-slate-400 group-hover:text-rose-400 font-medium whitespace-nowrap overflow-hidden"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );

  return (
    <>
      {SidebarContent}
    </>
  );
};

export default Sidebar;
