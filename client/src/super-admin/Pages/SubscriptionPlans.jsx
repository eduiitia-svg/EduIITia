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
} from "lucide-react";
import Table from "../Components/Table";
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../slices/subscriptionSlice"
const SubscriptionPlans = () => {
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.subscription);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    duration: "",
    features: "",
    description: "",
    testLimit: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      await dispatch(getAllPlans()).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch plans");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        duration: Number(formData.duration),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        description: formData.description,
        testLimit: Number(formData.testLimit) || 0,
      };

      if (isEditing && selectedPlan) {
        await dispatch(
          updatePlan({ planId: selectedPlan.id, updates: payload })
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
      features: plan.features?.join(", ") || "",
      description: plan.description || "",
      testLimit: plan.testLimit || "",
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
      features: "",
      description: "",
      testLimit: "",
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
          <span className="font-semibold text-white text-base">
            {plan.name}
          </span>
          <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
            {plan.description || "No description provided"}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tier Type",
      render: (plan) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
            plan.type === "pro" || plan.type === "premium"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-gray-700/30 text-gray-300 border-gray-600/30"
          }`}
        >
          {plan.type.toUpperCase()}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (plan) => (
        <div className="font-mono text-emerald-300">
          {plan.price === 0 ? "Free" : `₹${plan.price}`}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (plan) => (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock size={14} />
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
            <>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <span className="text-sm text-emerald-500">Active</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-500">Inactive</span>
            </>
          )}
        </div>
      ),
    },
  ];

  const rowActions = (plan) => (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleEdit(plan)}
        className="p-2 rounded-lg hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-colors"
        title="Edit Plan"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => handleDelete(plan.id)}
        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
        title="Delete Plan"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative rounded-2xl">
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
      
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-emerald-100 to-emerald-400"
            >
              Subscription Protocol
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 mt-2 text-lg"
            >
              System-wide access level configuration.
            </motion.p>
          </div>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 rounded-lg font-semibold shadow-lg shadow-emerald-900/20 border border-emerald-500/30 hover:border-emerald-400 transition-all text-sm uppercase tracking-wide"
          >
            <Plus size={18} />
            <span>Deploy Plan</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Table
            columns={columns}
            data={plans}
            renderRowActions={rowActions}
            isLoading={loading}
          />

          <div className="mt-4 px-6 py-4 border border-white/10 rounded-2xl bg-white/2 backdrop-blur-md flex justify-between items-center text-xs text-gray-500 shadow-xl shadow-black/20">
            <div>
              Total Plans: <span className="text-white">{plans.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Operational
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-emerald-900/20 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  {isEditing ? (
                    <Edit2 size={20} className="text-emerald-400" />
                  ) : (
                    <Sparkles size={20} className="text-emerald-400" />
                  )}
                  {isEditing ? "Edit Configuration" : "New Plan Protocol"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none transition-all"
                      placeholder="e.g. Premium Plan"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white outline-none appearance-none"
                        required
                      >
                        <option value="" className="bg-black">
                          Select Tier
                        </option>
                        <option value="free" className="bg-black">
                          Free
                        </option>
                        <option value="premium" className="bg-black">
                          Premium
                        </option>
                        <option value="pro" className="bg-black">
                          Pro
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
                      Duration
                    </label>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-3 top-3.5 text-gray-500"
                      />
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none"
                        placeholder="Days (e.g. 30)"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
                      Test Limit
                    </label>
                    <input
                      type="number"
                      value={formData.testLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, testLimit: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none"
                      placeholder="Number of tests (0 for unlimited)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
                      Features
                    </label>
                    <input
                      type="text"
                      value={formData.features}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none"
                      placeholder="Feature 1, Feature 2, Feature 3 (comma separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1.5">
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
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none resize-none"
                      placeholder="Brief overview of the plan..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95"
                  >
                    {isEditing ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                    {isEditing ? "Update Plan" : "Deploy Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionPlans;
