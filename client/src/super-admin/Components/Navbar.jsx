import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const Navbar = ({ sidebarOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const getPageTitle = () => {
    return { title: "Dashboard", subtitle: "Overview & core analytics" };
  };

  const { title, subtitle } = getPageTitle();
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "SA";

  const userRole = user?.role || "Super Admin";

  return (
    <motion.header
      initial={false}
      animate={{ left: sidebarOpen ? 260 : 80 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="fixed right-0 top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300 shadow-xl shadow-black/20"
    >
      <div className="flex items-center justify-between px-8 h-16">
    
        <div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-slate-200 to-slate-400">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-6">
        
          <div className="h-6 w-px bg-white/10" />

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl transition-all hover:bg-white/5"
          >
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {user?.name || "Super Admin"}
              </div>
              <div className="text-xs text-emerald-400 font-mono tracking-wider">
                {userRole}
              </div>
            </div>

            <div className="min-w-10 h-10 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-emerald-500/30">
              {userInitials}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
