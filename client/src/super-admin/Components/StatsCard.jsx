import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Users, DollarSign, ShieldCheck } from "lucide-react";

const getIconAndColor = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("revenue")) {
    return {
      icon: (
        <DollarSign
          size={24}
          className="text-emerald-400 group-hover:text-white"
        />
      ),
      color: "from-emerald-600/30 to-emerald-800/20",
      iconBg: "bg-emerald-500/10",
    };
  }
  if (lowerTitle.includes("users")) {
    return {
      icon: (
        <Users size={24} className="text-cyan-400 group-hover:text-white" />
      ),
      color: "from-cyan-600/30 to-cyan-800/20",
      iconBg: "bg-cyan-500/10",
    };
  }
  if (lowerTitle.includes("admins")) {
    return {
      icon: (
        <ShieldCheck
          size={24}
          className="text-violet-400 group-hover:text-white"
        />
      ),
      color: "from-violet-600/30 to-violet-800/20",
      iconBg: "bg-violet-500/10",
    };
  }
  return {
    icon: (
      <TrendingUp size={24} className="text-gray-400 group-hover:text-white" />
    ),
    color: "from-slate-600/30 to-slate-800/20",
    iconBg: "bg-slate-500/10",
  };
};

const StatsCard = ({ title, value, subtitle }) => {
  const { icon, color, iconBg } = getIconAndColor(title);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(6, 182, 212, 0.2)" }}
      className={`relative p-6 rounded-xl overflow-hidden cursor-pointer h-full
        bg-linear-to-br ${color} 
        border border-white/10
        shadow-lg
        transition-all duration-300
        group`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-white/5 blur-sm" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">
            {title}
          </div>
          <div className="text-4xl font-extrabold text-white">{value}</div>
        </div>

        <div
          className={`p-3 rounded-full ${iconBg} transition-colors duration-300`}
        >
          {icon}
        </div>
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-sm text-slate-500 flex items-center gap-1">
            <TrendingUp
              size={16}
              className={
                subtitle.startsWith("+")
                  ? "text-emerald-500"
                  : subtitle.startsWith("-")
                  ? "text-red-500"
                  : "text-slate-500"
              }
              style={{
                transform: subtitle.startsWith("-") ? "rotate(180deg)" : "none",
              }}
            />
            <span
              className={
                subtitle.startsWith("+")
                  ? "text-emerald-300 font-semibold"
                  : subtitle.startsWith("-")
                  ? "text-red-300 font-semibold"
                  : "text-slate-400"
              }
            >
              {subtitle}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
