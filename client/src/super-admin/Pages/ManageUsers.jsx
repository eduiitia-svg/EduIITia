import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Eye,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Clock,
  AlertCircle,
  Building2,
  UserCheck,
  RefreshCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "react-hot-toast";
import Table from "../Components/Table";
import CustomSelect from "../../ui/CustomSelect";
import { getAllUsers, deleteUser } from "../../slices/authSlice";
import { getAllPlans } from "../../slices/subscriptionSlice";
import { getAllAdmins } from "../../slices/adminSlice";
import { TableSkeleton } from "../../componets/skeleton/TableSkeleton";
import {
  getActiveSubscription,
  getTimeRemaining,
  formatTimeRemaining,
} from "../../../utils/subscriptionHelpers";

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { allUsers, loading: usersLoading } = useSelector(
    (state) => state.auth
  );

  const { plans: subscriptionPlans } = useSelector(
    (state) => state.subscription
  );

  const { admins } = useSelector((state) => state.admin);

  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getAllUsers()).unwrap(),
          dispatch(getAllPlans()).unwrap(),
          dispatch(getAllAdmins()).unwrap(),
        ]);
      } catch (err) {
        console.error("Fetch Data Error:", err);
        toast.error("Failed to load data.");
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (allUsers) {
      setUsers(allUsers);
      setOriginalUsers(allUsers);
    }
  }, [allUsers]);

  const planOptions = useMemo(() => {
    const defaultOptions = [
      { value: "all", label: "All Plans" },
      { value: "Free", label: "Free" },
    ];

    if (!subscriptionPlans) return defaultOptions;

    const dynamicOptions = subscriptionPlans.map((plan) => ({
      value: plan.name,
      label: plan.name,
    }));

    return [...defaultOptions, ...dynamicOptions];
  }, [subscriptionPlans]);

  const adminOptions = useMemo(() => {
    const defaultOptions = [
      { value: "all", label: "All Institutes" },
      { value: "direct", label: "Direct Registration" },
    ];

    if (!admins) return defaultOptions;

    const adminOpts = admins.map((admin) => ({
      value: admin.id,
      label: admin.name || admin.email,
    }));

    return [...defaultOptions, ...adminOpts];
  }, [admins]);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const getUserActiveSubscription = (user) => {
    return getActiveSubscription(user?.subscription);
  };

  useEffect(() => {
    let result = originalUsers;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== "all") {
      const needsActive = statusFilter === "active";
      result = result.filter((u) => {
        const activeSub = getUserActiveSubscription(u);
        const isActive = !!activeSub;
        return isActive === needsActive;
      });
    }

    if (planFilter && planFilter !== "all") {
      result = result.filter((u) => {
        const activeSub = getUserActiveSubscription(u);
        const userPlanName = activeSub?.plan || "Free";

        if (activeSub && subscriptionPlans) {
          const planDetails = subscriptionPlans.find(
            (p) => p.id === activeSub.plan
          );
          const actualPlanName = planDetails?.name || "Free";
          return actualPlanName === planFilter;
        }

        return (
          userPlanName === planFilter || (planFilter === "Free" && !activeSub)
        );
      });
    }

    if (adminFilter && adminFilter !== "all") {
      result = result.filter((u) => {
        if (adminFilter === "direct") {
          return !u.createdBy;
        }
        return u.createdBy === adminFilter;
      });
    }

    setUsers(result);
  }, [
    searchTerm,
    statusFilter,
    planFilter,
    adminFilter,
    originalUsers,
    subscriptionPlans,
  ]);

  const handleDeleteAction = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    toast.loading(`Deleting user ${user.name}...`, { id: "deleteToast" });

    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success("User deleted successfully!", { id: "deleteToast" });
    } catch (err) {
      console.error("Delete Execution Error:", err);
      toast.error("Failed to delete user.", { id: "deleteToast" });
    }
  };

  const openDetailModal = (user) => {
    setDetailUser(user);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserPlanDetails = (user) => {
    const activeSub = getUserActiveSubscription(user);

    if (!activeSub || !subscriptionPlans) {
      return { name: "Free", price: 0, isActive: false };
    }

    const planDetails = subscriptionPlans.find((p) => p.id === activeSub.plan);

    if (!planDetails) {
      return {
        name: "Unknown",
        price: 0,
        isActive: true,
        endDate: activeSub.endDate,
      };
    }

    return {
      name: planDetails.name,
      price: planDetails.price,
      isActive: true,
      endDate: activeSub.endDate,
    };
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <div className="font-semibold text-white">{u?.name || "N/A"}</div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u) => <div className="text-slate-400">{u?.email || "N/A"}</div>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (u) => <div className="text-slate-400">{u?.phone || "N/A"}</div>,
    },
    {
      key: "institute",
      header: "Institute",
      render: (u) => {
        if (!u.createdBy) {
          return (
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <UserCheck size={12} />
              Direct
            </span>
          );
        }

        return (
          <div className="flex items-center gap-1.5">
            <Building2 size={12} className="text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">
              {u.adminDetails?.instituteName || u.instituteName || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      key: "currentPlan",
      header: "Current Plan",
      render: (u) => {
        const planDetails = getUserPlanDetails(u);

        if (!planDetails.isActive) {
          return (
            <span className="text-slate-500 font-medium">
              Free <span className="text-xs">(₹0)</span>
            </span>
          );
        }

        return (
          <span className="text-cyan-300 font-medium">
            {planDetails.name}{" "}
            <span className="text-slate-500 text-xs">
              (₹{planDetails.price})
            </span>
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (u) => {
        const activeSub = getUserActiveSubscription(u);
        const timeRemaining = activeSub ? getTimeRemaining(activeSub) : null;

        if (!activeSub) {
          return (
            <span className="px-3 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 rounded-full">
              Inactive
            </span>
          );
        }

        if (timeRemaining?.isExpiringToday) {
          return (
            <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full">
              Expiring Today
            </span>
          );
        }

        if (timeRemaining?.isExpiringSoon) {
          return (
            <span className="px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full flex items-center gap-1">
              <Clock size={12} />
              Expiring Soon
            </span>
          );
        }

        return (
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full">
            Active
          </span>
        );
      },
    },
  ];

  const rowActions = (u) => (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all"
        onClick={() => openDetailModal(u)}
      >
        <Eye size={18} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-full transition-all"
        onClick={() => handleDeleteAction(u.id)}
      >
        <Trash2 size={18} />
      </motion.button>
    </div>
  );

  return (
    <div className="p-8 bg-[#020617] rounded-2xl min-h-screen">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-300">
        Manage Users
      </h1>

      <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="relative w-full xl:w-96">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full px-4 py-3.5 pl-10 bg-[#0f172a] outline-none text-slate-300 border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="w-full sm:w-56 z-30">
            <CustomSelect
              options={adminOptions}
              value={adminFilter}
              onChange={(val) => setAdminFilter(val || "all")}
              placeholder="Filter by Institute"
            />
          </div>

          <div className="w-full sm:w-56 z-20">
            <CustomSelect
              options={planOptions}
              value={planFilter}
              onChange={(val) => setPlanFilter(val || "all")}
              placeholder="Filter by Plan"
            />
          </div>

          <div className="w-full sm:w-56 z-10">
            <CustomSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val || "all")}
              placeholder="Filter by Status"
            />
          </div>

          {/* {(searchTerm ||
            statusFilter !== "all" ||
            planFilter !== "all" ||
            adminFilter !== "all") && (
            <div
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPlanFilter("all");
                setAdminFilter("all");
              }}
              className="p-3 "
            >
              <RefreshCcw size={20} />
            </div>
          )} */}
        </div>
      </div>

      {usersLoading ? (
        <TableSkeleton
          columns={columns}
          renderRowActions={rowActions}
          rowCount={4}
        />
      ) : (
        <Table
          columns={columns}
          data={users}
          renderRowActions={rowActions}
          onDeleteItem={handleDeleteAction}
        />
      )}

      <AnimatePresence>
        {isDetailModalOpen && detailUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl shadow-emerald-900/30 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-white/10 bg-linear-to-r from-emerald-500/10 to-cyan-500/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-lg shadow-lg">
                      {detailUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {detailUser.name}
                      </h2>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 font-medium">
                        Student
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Building2 size={12} />
                        {detailUser.createdBy
                          ? "Institute Information"
                          : "Registration Type"}
                      </h3>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        {detailUser.createdBy ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building2
                                size={16}
                                className="text-cyan-400 shrink-0"
                              />
                              <div className="flex-1">
                                <p className="text-xs text-slate-400">
                                  Registered Through
                                </p>
                                <p className="text-white font-semibold text-sm">
                                  {detailUser.adminDetails?.instituteName ||
                                    detailUser.instituteName ||
                                    "Unknown Institute"}
                                </p>
                              </div>
                            </div>
                            {detailUser.adminDetails?.name && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <p className="text-xs text-slate-400 mb-1">
                                  Admin Details
                                </p>
                                <p className="text-slate-300 text-sm">
                                  {detailUser.adminDetails.name}
                                </p>
                                {detailUser.adminDetails?.email && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {detailUser.adminDetails.email}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <UserCheck
                              size={18}
                              className="text-emerald-400 shrink-0"
                            />
                            <div>
                              <p className="text-xs text-slate-400">
                                Direct Registration
                              </p>
                              <p className="text-white font-semibold text-sm">
                                Self-registered user
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Mail size={12} />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-start gap-2">
                            <Mail
                              size={16}
                              className="text-cyan-400 mt-0.5 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 mb-0.5">
                                Email Address
                              </p>
                              <p className="text-white font-medium text-sm break-all">
                                {detailUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-start gap-2">
                            <Phone
                              size={16}
                              className="text-cyan-400 mt-0.5 shrink-0"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 mb-0.5">
                                Phone Number
                              </p>
                              <p className="text-white font-medium text-sm">
                                {detailUser.phone || (
                                  <span className="text-slate-500 italic">
                                    Not provided
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar size={12} />
                        Account Information
                      </h3>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={16}
                            className="text-purple-400 shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-0.5">
                              Account Created
                            </p>
                            <p className="text-white font-semibold text-sm">
                              {formatDate(detailUser.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CreditCard size={12} />
                      Subscription Details
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const activeSub = getUserActiveSubscription(detailUser);
                        const planDetails = getUserPlanDetails(detailUser);
                        const timeRemaining = activeSub
                          ? getTimeRemaining(activeSub)
                          : null;
                        const formattedTime = activeSub
                          ? formatTimeRemaining(activeSub)
                          : null;

                        return (
                          <>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <CreditCard
                                    size={18}
                                    className="text-amber-400 mt-0.5 shrink-0"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs text-slate-400 mb-1">
                                      Current Plan
                                    </p>
                                    <p className="text-white text-lg font-bold">
                                      {planDetails.name}
                                    </p>
                                    <p className="text-slate-400 text-sm mt-0.5">
                                      ₹{planDetails.price}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  {planDetails.isActive ? (
                                    <span
                                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
                                        timeRemaining?.isExpiringToday
                                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                          : timeRemaining?.isExpiringSoon
                                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      }`}
                                    >
                                      Active
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 text-[10px] font-semibold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {activeSub && timeRemaining?.isExpiringSoon && (
                              <div
                                className={`p-3 rounded-xl border ${
                                  timeRemaining.isExpiringToday
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-amber-500/10 border-amber-500/30"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <AlertCircle
                                    size={16}
                                    className={`mt-0.5 shrink-0 ${
                                      timeRemaining.isExpiringToday
                                        ? "text-red-400"
                                        : "text-amber-400"
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-bold mb-0.5 ${
                                        timeRemaining.isExpiringToday
                                          ? "text-red-400"
                                          : "text-amber-400"
                                      }`}
                                    >
                                      {timeRemaining.isExpiringToday
                                        ? "Expiring Today!"
                                        : "Expiring Soon"}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {timeRemaining.isExpiringToday
                                        ? "Subscription expires today. Renewal recommended."
                                        : "Subscription will expire within 7 days."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeSub && (
                              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-start gap-2">
                                  <Calendar
                                    size={16}
                                    className="text-slate-400 mt-0.5 shrink-0"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs text-slate-400 mb-1">
                                      Subscription Expires
                                    </p>
                                    <p className="text-white font-semibold text-sm">
                                      {activeSub.endDate
                                        ? new Date(
                                            activeSub.endDate.seconds
                                              ? activeSub.endDate.seconds * 1000
                                              : activeSub.endDate
                                          ).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "N/A"}
                                    </p>
                                    {timeRemaining && (
                                      <div className="mt-2 flex items-center gap-1.5">
                                        <Clock
                                          size={12}
                                          className="text-slate-500"
                                        />
                                        <p className="text-xs text-slate-500 font-medium">
                                          {formattedTime} remaining
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {!activeSub && (
                              <div className="p-3 bg-slate-500/10 rounded-xl border border-slate-500/30">
                                <div className="flex items-center gap-2">
                                  <AlertCircle
                                    size={16}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <div>
                                    <p className="text-sm font-semibold text-slate-300">
                                      No Active Subscription
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      User is on the Free plan
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-white/10 bg-[#0f172a]/95 backdrop-blur-sm flex justify-end">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;
