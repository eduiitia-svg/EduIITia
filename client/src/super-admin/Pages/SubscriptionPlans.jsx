import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  IndianRupee,
  Calendar,
  ListChecks,
  AlertCircle,
  BarChart,
  TrendingUp,
  Trophy,
  Check,
  BookOpen,
} from "lucide-react";
import Table from "../Components/Table";
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../slices/subscriptionSlice";
import { getAllCategories } from "../../slices/categorySlice";

const AVAILABLE_FEATURES = [
  { id: "Test History", label: "Test History", icon: Clock },
  { id: "Performance Overview", label: "Performance Overview", icon: BarChart },
  { id: "Test Analytics", label: "Test Analytics", icon: TrendingUp },
  { id: "Progress Tracking", label: "Progress Over Time", icon: TrendingUp },
  { id: "Leaderboard Access", label: "Leaderboard", icon: Trophy },
];

const SubscriptionPlans = () => {
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.subscription);
  const { categories } = useSelector((state) => state.category);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    duration: "",
    features: [],
    description: "",
    testLimit: "",
    subject: "All",
    subcategory: "All",
    mainCategory: "All",
  });

  useEffect(() => {
    fetchPlans();
  }, []);
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const fetchPlans = async () => {
    try {
      await dispatch(getAllPlans()).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch plans");
    }
  };

  const toggleFeature = (featureId) => {
    setFormData((prev) => {
      const features = prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId];
      return { ...prev, features };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.price) < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    if (Number(formData.duration) < 1) {
      toast.error("Duration must be at least 1 day");
      return;
    }

    if (Number(formData.testLimit) < 0) {
      toast.error("Test limit cannot be negative");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        duration: Number(formData.duration),
        features: formData.features,
        description: formData.description,
        testLimit: Number(formData.testLimit) || 0,
        subject: formData.subject,
        subcategory: formData.subcategory,
        mainCategory: formData.mainCategory,
      };

      if (isEditing && selectedPlan) {
        await dispatch(
          updatePlan({ planId: selectedPlan.id, updates: payload }),
        ).unwrap();
        toast.success("Plan updated successfully");
      } else {
        await dispatch(createPlan(payload)).unwrap();
        toast.success("Plan created successfully");
      }

      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err || "Failed to save plan");
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setFormData({
      name: plan.name,
      type: plan.type,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      description: plan.description || "",
      testLimit: plan.testLimit || "",
      subject: plan.subject || "All",
      subcategory: plan.subcategory || "All",
      mainCategory: plan.mainCategory || "All",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await dispatch(deletePlan(id)).unwrap();
      toast.success("Plan deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedPlan(null);
    setFormData({
      name: "",
      type: "",
      price: "",
      duration: "",
      features: [],
      description: "",
      testLimit: "",
      subject: "All",
      subcategory: "All",
      mainCategory: "All",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const columns = [
    {
      key: "name",
      header: "Plan Name",
      render: (plan) => (
        <div className="flex flex-col">
          <span className="font-semibold text-white text-base tracking-tight">
            {plan.name}
          </span>
          <span className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">
            {plan.description || "No description provided"}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Exam Type",
      render: (plan) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-300">
            {plan.type || "All Types"}
          </span>
          {plan.mainCategory && plan.mainCategory !== "All" && (
            <span className="text-[10px] text-slate-500 uppercase">
              {plan.mainCategory}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "mainCategory",
      header: "Category",
      render: (plan) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
            plan.mainCategory === "school"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : plan.mainCategory === "entrance"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : plan.mainCategory === "recruitment"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/20"
          }`}
        >
          {plan.mainCategory || "All"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (plan) => (
        <div className="font-mono text-emerald-400 font-medium">
          {plan.price === 0 ? "Free" : `₹${plan.price}`}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (plan) => (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock size={14} className="text-slate-500" />
          {plan.duration} Days
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (plan) => (
        <div className="flex items-center gap-2">
          {plan.isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Inactive
            </span>
          )}
        </div>
      ),
    },
  ];

  const rowActions = (plan) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleEdit(plan)}
        className="p-2 rounded-lg hover:bg-teal-500/20 text-slate-400 hover:text-teal-300 transition-all"
        title="Edit Plan"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => handleDelete(plan.id)}
        className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
        title="Delete Plan"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30 overflow-hidden relative rounded-3xl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-teal-900/10 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold text-white tracking-tight"
            >
              Subscription <span className="text-teal-400">Plans</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-2 text-base"
            >
              Manage pricing tiers and access controls for the platform.
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-xl shadow-teal-900/10 text-sm"
          >
            <Plus size={18} className="text-teal-600" />
            <span>Create New Plan</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          <Table
            columns={columns}
            data={plans}
            renderRowActions={rowActions}
            isLoading={loading}
          />
        </motion.div>

        {/* Footer Stats */}
        <div className="mt-6 flex justify-between items-center text-xs text-slate-500 font-mono px-2">
          <span>DB_SYNC: {plans.length} RECORDS</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            SYSTEM OPERATIONAL
          </span>
        </div>
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center shrink-0 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {isEditing ? (
                      <Edit2 size={20} className="text-teal-400" />
                    ) : (
                      <Sparkles size={20} className="text-emerald-400" />
                    )}
                    {isEditing ? "Edit Configuration" : "New Plan Protocol"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure the subscription details below.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
                <form
                  id="plan-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Plan Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Plan Name
                    </label>
                    <div className="relative group">
                      <Layers
                        size={18}
                        className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-teal-400 transition-colors"
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder-slate-600 outline-none transition-all"
                        placeholder="e.g. JEE Advanced Premium, NEET Foundation"
                        required
                      />
                    </div>
                  </div>

                  {/* Grid: Main Category & Exam Type */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Main Category *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.mainCategory}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              mainCategory: e.target.value,
                              type: "", // Reset exam type when main category changes
                            });
                          }}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white appearance-none outline-none transition-all cursor-pointer"
                          required
                        >
                          <option value="">Select Category...</option>
                          <option value="All">All Categories</option>
                          <option value="school">School (Classes 1-12)</option>
                          <option value="entrance">Entrance Exams</option>
                          <option value="recruitment">Recruitment Exams</option>
                        </select>
                        <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                          <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Exam Type *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white appearance-none outline-none transition-all cursor-pointer"
                          required
                          disabled={
                            !formData.mainCategory ||
                            formData.mainCategory === "All"
                          }
                        >
                          <option value="">
                            {!formData.mainCategory ||
                            formData.mainCategory === "All"
                              ? "Select Main Category First"
                              : "Select Exam Type..."}
                          </option>
                          {formData.mainCategory === "school" && (
                            <>
                              <option value="CBSE Board">CBSE Board</option>
                              <option value="ICSE Board">ICSE Board</option>
                              <option value="State Board">State Board</option>
                            </>
                          )}
                          {formData.mainCategory === "entrance" && (
                            <>
                              <option value="Engineering Entrance">
                                Engineering Entrance
                              </option>
                              <option value="Medical Entrance">
                                Medical Entrance
                              </option>
                              <option value="Law Entrance">Law Entrance</option>
                            </>
                          )}
                          {formData.mainCategory === "recruitment" && (
                            <>
                              <option value="Government Job">
                                Government Job
                              </option>
                              <option value="Banking">Banking</option>
                              <option value="Railway">Railway</option>
                              <option value="Police">Police</option>
                            </>
                          )}
                        </select>
                        <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                          <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      {(!formData.mainCategory ||
                        formData.mainCategory === "All") && (
                        <p className="text-xs text-slate-500 mt-1">
                          💡 Select a main category first
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grid: Price & Duration */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Price (INR)
                      </label>
                      <div className="relative group">
                        <IndianRupee
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 outline-none transition-all font-mono"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Duration (Days)
                      </label>
                      <div className="relative group">
                        <Calendar
                          size={18}
                          className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-teal-400 transition-colors"
                        />
                        <input
                          type="number"
                          min="1"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder-slate-600 outline-none transition-all"
                          placeholder="e.g. 30, 90, 365"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Test Limit
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-700 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white mb-1">
                          Total Tests Allowed
                        </p>
                        <p className="text-xs text-slate-500">
                          Set to 0 for unlimited access
                        </p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.testLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            testLimit: e.target.value,
                          })
                        }
                        className="w-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-center text-white focus:border-teal-500 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Scope Restrictions */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Scope Restrictions (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-500 ml-1">
                          Subject
                        </span>
                        <div className="relative group">
                          <BookOpen
                            size={18}
                            className="absolute left-3 top-3 text-slate-500 group-focus-within:text-teal-400 transition-colors"
                          />
                          <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 outline-none text-sm text-white"
                            placeholder="e.g. Physics, Chemistry"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-500 ml-1">
                          Subcategory
                        </span>
                        <div className="relative group">
                          <Layers
                            size={18}
                            className="absolute left-3 top-3 text-slate-500 group-focus-within:text-teal-400 transition-colors"
                          />
                          <input
                            type="text"
                            value={formData.subcategory}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subcategory: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 outline-none text-sm text-white"
                            placeholder="e.g. Organic, Mechanics"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 ml-1">
                      💡 Leave empty or type "All" for no restrictions
                    </p>
                  </div>

                  {/* Features Section - Keep as is */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <ListChecks size={16} className="text-teal-400" />
                        Dashboard Features
                      </label>
                      <span className="text-xs text-slate-500">
                        {formData.features.length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVAILABLE_FEATURES.map((feature) => {
                        const isSelected = formData.features.includes(
                          feature.id,
                        );
                        const IconComponent = feature.icon;

                        return (
                          <div
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`
              relative group flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "bg-teal-500/10 border-teal-500/50 shadow-[0_0_15px_-5px_rgba(20,184,166,0.3)]"
                  : "bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50"
              }
            `}
                          >
                            <div
                              className={`
                p-2 rounded-lg transition-colors
                ${
                  isSelected
                    ? "bg-teal-500 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                }
              `}
                            >
                              <IconComponent size={18} />
                            </div>

                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-semibold transition-colors ${
                                  isSelected ? "text-white" : "text-slate-300"
                                }`}
                              >
                                {feature.label}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase font-medium">
                                Module
                              </span>
                            </div>

                            <div
                              className={`absolute right-3 top-3.5 transition-all duration-300 ${
                                isSelected
                                  ? "opacity-100 scale-100"
                                  : "opacity-0 scale-75"
                              }`}
                            >
                              <div className="bg-teal-500 rounded-full p-0.5">
                                <Check size={12} className="text-white" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {formData.features.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-start gap-2 p-3 bg-amber-900/10 border border-amber-500/10 rounded-lg"
                      >
                        <AlertCircle
                          size={16}
                          className="text-amber-500 mt-0.5 shrink-0"
                        />
                        <p className="text-xs text-amber-500/80">
                          Warning: No features selected. Users with this plan
                          will have limited access.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder-slate-600 outline-none resize-none transition-all"
                      placeholder="Brief overview of the plan benefits..."
                    ></textarea>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-end gap-4 rounded-b-2xl shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="plan-form"
                  className="flex items-center gap-2 px-8 py-2.5 bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  {isEditing ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                  {isEditing ? "Update Plan" : "Deploy Plan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionPlans;
