import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  GraduationCap,
  Target,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";
import Table from "../../super-admin/Components/Table";
import {
  getAllTeacherPlans,
  createTeacherPlan,
  updateTeacherPlan,
  deleteTeacherPlan,
} from "../../slices/subscriptionSlice";

const AVAILABLE_TEACHER_FEATURES = [
  { id: "Dashboard", label: "Dashboard", icon: Target },
  { id: "Upload Questions", label: "Upload Questions", icon: Plus },
  { id: "Question Papers", label: "Question Papers", icon: BookOpen },
  { id: "Study Material", label: "Study Material", icon: Layers },
  { id: "Test Attempts", label: "Test Attempts", icon: Clock },
  { id: "Categories", label: "Categories", icon: Target },
  {
    id: "Approve/Reject Students",
    label: "Approve/Reject Students",
    icon: CheckCircle2,
  },
  { id: "Add Testimonials", label: "Add Testimonials", icon: Sparkles },
];

const MAIN_CATEGORIES = [
  { id: "school", label: "School (Classes 1-12)" },
  { id: "entrance", label: "Entrance Exams" },
  { id: "recruitment", label: "Recruitment Exams" },
];

const EXAM_TYPE_OPTIONS = {
  school: ["CBSE Board", "ICSE Board", "State Board"],
  entrance: ["Engineering Entrance", "Medical Entrance", "Law Entrance"],
  recruitment: ["Government Job", "Banking", "Railway", "Police"],
};
const PlanBadge = ({ icon: Icon, text, colorClass }) => {
  if (!text || text === "All" || text === "") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass}`}
    >
      <Icon size={12} />
      {text}
    </span>
  );
};

const TeacherPlanManagement = () => {
  const dispatch = useDispatch();
  const { teacherPlans, loading } = useSelector((state) => state.subscription);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    features: [],
    description: "",
    mockTestLimit: "",
    mainCategory: "",
    examType: "",
    subject: "",
    classLevel: "",
    subcategory: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      await dispatch(getAllTeacherPlans()).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teacher plans");
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
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        duration: Number(formData.duration),
        features: formData.features,
        description: formData.description,
        mockTestLimit: Number(formData.mockTestLimit) || 0,
        mainCategory: formData.mainCategory,
        examType: formData.examType || "All",
        subject: formData.subject || "All",
        classLevel: formData.classLevel || "All",
        subcategory: formData.subcategory || "All",
      };

      if (isEditing && selectedPlan) {
        await dispatch(
          updateTeacherPlan({ planId: selectedPlan.id, updates: payload }),
        ).unwrap();
        toast.success("Teacher plan updated successfully");
      } else {
        await dispatch(createTeacherPlan(payload)).unwrap();
        toast.success("Teacher plan created successfully");
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
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      description: plan.description || "",
      mockTestLimit: plan.mockTestLimit || "",
      mainCategory: plan.mainCategory || "",
      examType: plan.examType || "",
      subject: plan.subject || "",
      classLevel: plan.classLevel || "",
      subcategory: plan.subcategory || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await dispatch(deleteTeacherPlan(id)).unwrap();
      toast.success("Teacher plan deleted successfully");
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
      price: "",
      duration: "",
      features: [],
      description: "",
      mockTestLimit: "",
      mainCategory: "",
      examType: "",
      subject: "",
      classLevel: "",
      subcategory: "",
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
      header: "Plan Details",
      render: (plan) => (
        <div className="flex items-start gap-4 py-2">
          <div className="p-3 rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed max-w-[280px]">
              {plan.description || "No description provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "mainCategory",
      header: "Category",
      render: (plan) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            {plan.mainCategory === "school" && "School"}
            {plan.mainCategory === "entrance" && "Entrance"}
            {plan.mainCategory === "recruitment" && "Recruitment"}
          </span>
        </div>
      ),
    },
    {
      key: "restrictions",
      header: "Target & Scope",
      render: (plan) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 max-w-[280px]">
            {(!plan.examType || plan.examType === "All") &&
            (!plan.subject || plan.subject === "All") &&
            (!plan.classLevel || plan.classLevel === "All") &&
            (!plan.subcategory || plan.subcategory === "All") ? (
              <span className="text-xs text-gray-500 italic">
                No restrictions (Global)
              </span>
            ) : (
              <>
                <PlanBadge
                  icon={Target}
                  text={plan.examType}
                  colorClass="bg-blue-500/10 text-blue-400 border-blue-500/20"
                />
                <PlanBadge
                  icon={BookOpen}
                  text={plan.subject}
                  colorClass="bg-purple-500/10 text-purple-400 border-purple-500/20"
                />
                <PlanBadge
                  icon={GraduationCap}
                  text={plan.classLevel}
                  colorClass="bg-orange-500/10 text-orange-400 border-orange-500/20"
                />
                <PlanBadge
                  icon={Layers}
                  text={plan.subcategory}
                  colorClass="bg-teal-500/10 text-teal-400 border-teal-500/20"
                />
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "mockTestLimit",
      header: "Limits",
      render: (plan) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${plan.mockTestLimit === 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"}`}
          />
          <span className="text-sm font-medium text-gray-300">
            {plan.mockTestLimit === 0
              ? "Unlimited Tests"
              : `${plan.mockTestLimit} Tests`}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Pricing",
      render: (plan) => (
        <div className="flex flex-col">
          <span className="font-bold text-xl text-emerald-400 tracking-tight">
            ₹{plan.price}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <Clock size={10} />
            <span>{plan.duration} Days</span>
          </div>
        </div>
      ),
    },
  ];

  const rowActions = (plan) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => handleEdit(plan)}
        className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all active:scale-95"
        title="Edit Plan"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => handleDelete(plan.id)}
        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all active:scale-95"
        title="Delete Plan"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 pb-20">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <span className="h-8 w-1 bg-linear-to-b from-emerald-400 to-teal-600 rounded-full"></span>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Teacher Subscription Plans
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm ml-4 max-w-md"
            >
              Configure subscription packages that allow teachers to create and
              manage mock tests on the platform.
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-900/20 transition-all border border-emerald-500/50"
          >
            <Plus size={18} />
            <span>Create Plan</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <Table
              columns={columns}
              data={teacherPlans}
              renderRowActions={rowActions}
              isLoading={loading}
            />
          </div>

          {!loading && (
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500 px-2">
              <div>
                Showing{" "}
                <span className="text-emerald-400 font-semibold">
                  {teacherPlans.length}
                </span>{" "}
                active plans
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                System Operational
              </div>
            </div>
          )}
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-white/5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isEditing ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}
                  >
                    {isEditing ? <Edit2 size={18} /> : <Sparkles size={18} />}
                  </div>
                  {isEditing ? "Update Plan Details" : "Create New Plan"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
                <form
                  id="planForm"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                        Identity
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 outline-none transition-all"
                        placeholder="Plan Name (e.g. JEE Premium)"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                          Price & Duration
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            className="w-full pl-8 pr-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                            placeholder="499"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                          Validity
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-gray-500">
                            <Clock size={14} />
                          </span>
                          <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                            placeholder="Days (e.g. 30)"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                        Usage Limits
                      </label>
                      <div className="flex items-center gap-4 p-4 bg-[#020617] border border-white/10 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">
                            Total Mock Tests
                          </p>
                          <p className="text-xs text-gray-500">
                            Set to 0 for unlimited access
                          </p>
                        </div>
                        <input
                          type="number"
                          value={formData.mockTestLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mockTestLimit: e.target.value,
                            })
                          }
                          className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center text-white focus:border-emerald-500 outline-none"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                        Main Category *
                      </label>
                      <select
                        value={formData.mainCategory}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            mainCategory: e.target.value,
                            examType: "",
                          });
                        }}
                        className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white outline-none transition-all"
                        required
                      >
                        <option value="">Select Main Category</option>
                        {MAIN_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                        Exam Type *
                      </label>
                      <select
                        value={formData.examType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            examType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white outline-none transition-all"
                        required
                        disabled={!formData.mainCategory}
                      >
                        <option value="">
                          {formData.mainCategory
                            ? "Select Exam Type"
                            : "Select Main Category First"}
                        </option>
                        {formData.mainCategory &&
                          EXAM_TYPE_OPTIONS[formData.mainCategory]?.map(
                            (type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ),
                          )}
                      </select>
                      {!formData.mainCategory && (
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Select a main category first to see exam type
                          options
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                        Scope Restrictions (Optional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 ml-1">
                            Subject
                          </span>
                          <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#020617] border border-white/10 rounded-xl focus:border-purple-500 outline-none text-sm text-white"
                            placeholder="e.g. Chemistry"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 ml-1">
                            Class Level
                          </span>
                          <input
                            type="text"
                            value={formData.classLevel}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                classLevel: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#020617] border border-white/10 rounded-xl focus:border-orange-500 outline-none text-sm text-white"
                            placeholder="e.g. Class 12"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-xs text-gray-500 ml-1">
                            Subcategory
                          </span>
                          <input
                            type="text"
                            value={formData.subcategory}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subcategory: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#020617] border border-white/10 rounded-xl focus:border-teal-500 outline-none text-sm text-white"
                            placeholder="e.g. Organic"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 ml-1">
                        💡 Leave empty or type "All" for no restrictions on that
                        field
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Layers size={14} className="text-emerald-400" />
                          Admin Dashboard Access
                        </label>
                        <span className="text-xs text-gray-500">
                          {formData.features.length} selected
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 -mt-1">
                        Select which admin features teachers can access with
                        this plan
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#020617] border border-white/10 rounded-xl p-4">
                        {AVAILABLE_TEACHER_FEATURES.map((feature) => {
                          const isSelected = formData.features.includes(
                            feature.id,
                          );
                          const IconComponent = feature.icon;

                          return (
                            <div
                              key={feature.id}
                              onClick={() => toggleFeature(feature.id)}
                              className={`
                              relative group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]"
                                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                              }
                            `}
                            >
                              <div
                                className={`
                                p-2 rounded-lg transition-colors shrink-0
                                ${
                                  isSelected
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-300"
                                }
                              `}
                              >
                                <IconComponent size={16} />
                              </div>

                              <div className="flex flex-col flex-1 min-w-0">
                                <span
                                  className={`text-sm font-medium transition-colors truncate ${
                                    isSelected ? "text-white" : "text-gray-300"
                                  }`}
                                >
                                  {feature.label}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                                  Feature
                                </span>
                              </div>

                              <div
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                                  isSelected
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-75"
                                }`}
                              >
                                <div className="bg-emerald-500 rounded-full p-0.5">
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
                          className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                        >
                          <AlertCircle
                            size={16}
                            className="text-amber-400 mt-0.5 shrink-0"
                          />
                          <p className="text-xs text-amber-400">
                            Warning: No features selected. Teachers with this
                            plan will have limited admin access.
                          </p>
                        </motion.div>
                      )}

                      {formData.features.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                          {formData.features.length} admin feature
                          {formData.features.length !== 1 ? "s" : ""} enabled
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
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
                        className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:border-emerald-500 outline-none text-white text-sm resize-none"
                        placeholder="Describe the plan benefits..."
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#0f172a]">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="planForm"
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                  >
                    {isEditing ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                    {isEditing ? "Save Changes" : "Create Plan"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherPlanManagement;
