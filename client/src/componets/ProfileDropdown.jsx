import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  BarChart3,
  ChevronDown,
  NotebookPen,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import toast from "react-hot-toast";

const ProfileDropdown = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      setOpen(false);

      await dispatch(logout()).unwrap();

      navigate("/");

      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className={`
        group flex items-center gap-3 px-1 py-1 pr-4 rounded-full border transition-all duration-300
        ${
          open
            ? "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/30 hover:bg-gray-200 dark:hover:bg-white/10"
        }
      `}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-tr from-emerald-500 to-cyan-500 rounded-full blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative w-9 h-9 bg-white dark:bg-black rounded-full flex items-center justify-center border border-gray-200 dark:border-black overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-cyan-500 dark:to-cyan-400 bg-clip-text text-transparent">
                {user?.name?.charAt(0).toUpperCase() || (
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </span>
            )}
          </div>

          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full shadow-[0_0_5px_#10b981]"></div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors tracking-wide">
            {user?.name || "Guest"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
              open
                ? "rotate-180 text-emerald-600 dark:text-emerald-400"
                : "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
            }`}
          />
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          ></div>

          <div className="absolute right-0 mt-3 w-64 origin-top-right z-50">
            <div className="absolute -inset-1 bg-linear-to-b from-emerald-500/20 to-transparent rounded-2xl blur-md opacity-50 pointer-events-none"></div>

            <div className="relative bg-white dark:bg-[#0a0a0a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-100 dark:ring-white/5">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                  Signed in as
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email || "User"}
                </p>
                {user?.role && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 capitalize">
                    {user.role === "superadmin" ? "Super Admin" : user.role}
                  </p>
                )}
              </div>

              <div className="py-2 space-y-1 px-2">
                <Link
                  to="/profilePage"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all group"
                >
                  <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  My Profile
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all group"
                >
                  <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  Dashboard
                </Link>

                <Link
                  to="/study-material"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all group"
                >
                  <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <NotebookPen className="w-4 h-4" />
                  </div>
                  Study Material
                </Link>
              </div>

              <div className="h-px bg-linear-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent my-1"></div>

              <div className="p-2">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  {loading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;
