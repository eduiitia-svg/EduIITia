import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  FolderPlus,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Check,
  Loader2,
  GraduationCap,
  Beaker,
  Target,
  Zap,
  ChevronDown,
  List,
} from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../slices/categorySlice";
import toast from "react-hot-toast";

const EXAM_TYPE_OPTIONS = {
  school: ["CBSE Board", "ICSE Board", "State Board"],
  entrance: ["Engineering Entrance", "Medical Entrance", "Law Entrance"],
  recruitment: ["Government Job", "Banking", "Railway", "Police"],
};
const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { categories, loading } = useSelector((state) => state.category);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [newCategory, setNewCategory] = useState({
    name: user?.teacherSubscription?.classLevel || "",
    type: user?.teacherSubscription?.examType || "",
    subjects: [
      {
        name: user?.teacherSubscription?.subject || "",
        subcategories:
          user?.teacherSubscription?.subcategory &&
          user.teacherSubscription.subcategory !== "All"
            ? [user.teacherSubscription.subcategory]
            : [],
      },
    ],
    icon: "BookOpen",
    mainCategory: user?.teacherSubscription?.mainCategory || "", 
  });
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    subjects: [],
    icon: "",
  });
  const [allowedExamTypes, setAllowedExamTypes] = useState(null);
  const [allowedSubjects, setAllowedSubjects] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const isSubjectAllowed = (subjectName) => {
    if (allowedSubjects === null) return true;
    return allowedSubjects.includes(subjectName.trim());
  };

  useEffect(() => {
    if (allowedExamTypes !== null && allowedExamTypes.length > 0) {
      setNewCategory((prev) => ({
        ...prev,
        type: allowedExamTypes[0],
      }));
    }

    if (user?.teacherSubscription?.classLevel) {
      setNewCategory((prev) => ({
        ...prev,
        name: user.teacherSubscription.classLevel,
      }));
    }
    if (
      user?.teacherSubscription?.subject &&
      user.teacherSubscription.subject !== "All"
    ) {
      setNewCategory((prev) => ({
        ...prev,
        subjects: [
          {
            name: user.teacherSubscription.subject,
            subcategories:
              user.teacherSubscription.subcategory &&
              user.teacherSubscription.subcategory !== "All"
                ? [user.teacherSubscription.subcategory]
                : [],
          },
        ],
      }));
    }
  }, [
    allowedExamTypes,
    user?.teacherSubscription?.classLevel,
    user?.teacherSubscription?.subject,
    user?.teacherSubscription?.subcategory,
  ]);

  useEffect(() => {
    const fetchAllowedPermissions = async () => {
      if (!user) {
        setLoadingPermissions(false);
        return;
      }

      try {
        if (user.role === "superadmin") {
          setAllowedExamTypes(null);
          setAllowedSubjects(null);
          setLoadingPermissions(false);
          return;
        }

        if (user.role === "admin" && user.teacherSubscription) {
          const subscription = user.teacherSubscription;
          if (subscription.isActive) {
            setAllowedExamTypes(
              subscription.examType ? [subscription.examType] : null,
            );

            setAllowedSubjects(
              subscription.subject && subscription.subject !== "All"
                ? [subscription.subject]
                : null,
            );
          } else {
            setAllowedExamTypes(null);
            setAllowedSubjects(null);
          }
        } else {
          setAllowedExamTypes(null);
          setAllowedSubjects(null);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setAllowedExamTypes(null);
        setAllowedSubjects(null);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchAllowedPermissions();
  }, [user]);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (editingCategory) {
      setEditForm({
        name: editingCategory.name,
        type: editingCategory.type,
        subjects: editingCategory.subjects.map((subj) =>
          typeof subj === "string"
            ? { name: subj, subcategories: [] }
            : { ...subj },
        ),
        icon: editingCategory.icon,
        mainCategory: editingCategory.mainCategory || "",
      });
    }
  }, [editingCategory]);

  const handleAddSubject = () => {
    setNewCategory({
      ...newCategory,
      subjects: [...newCategory.subjects, { name: "", subcategories: [] }],
    });
  };

  const handleRemoveSubject = (index) => {
    const updated = newCategory.subjects.filter((_, i) => i !== index);
    setNewCategory({ ...newCategory, subjects: updated });
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...newCategory.subjects];
    updated[index] = { ...updated[index], name: value };
    setNewCategory({ ...newCategory, subjects: updated });
  };

  const handleAddSubcategory = (subjectIndex) => {
    const updated = [...newCategory.subjects];
    updated[subjectIndex].subcategories.push("");
    setNewCategory({ ...newCategory, subjects: updated });
  };

  const handleRemoveSubcategory = (subjectIndex, subcatIndex) => {
    const updated = [...newCategory.subjects];
    updated[subjectIndex].subcategories = updated[
      subjectIndex
    ].subcategories.filter((_, i) => i !== subcatIndex);
    setNewCategory({ ...newCategory, subjects: updated });
  };

  const handleSubcategoryChange = (subjectIndex, subcatIndex, value) => {
    const updated = [...newCategory.subjects];
    updated[subjectIndex].subcategories[subcatIndex] = value;
    setNewCategory({ ...newCategory, subjects: updated });
  };

  const handleEditAddSubject = () => {
    setEditForm({
      ...editForm,
      subjects: [...editForm.subjects, { name: "", subcategories: [] }],
    });
  };

  const handleEditRemoveSubject = (index) => {
    const updated = editForm.subjects.filter((_, i) => i !== index);
    setEditForm({ ...editForm, subjects: updated });
  };

  const handleEditSubjectChange = (index, value) => {
    const updated = [...editForm.subjects];
    updated[index] = { ...updated[index], name: value };
    setEditForm({ ...editForm, subjects: updated });
  };

  const handleEditAddSubcategory = (subjectIndex) => {
    const updated = editForm.subjects.map((subj, idx) =>
      idx === subjectIndex
        ? { ...subj, subcategories: [...subj.subcategories, ""] }
        : { ...subj, subcategories: [...subj.subcategories] },
    );
    setEditForm({ ...editForm, subjects: updated });
  };

  const handleEditRemoveSubcategory = (subjectIndex, subcatIndex) => {
    const updated = [...editForm.subjects];
    updated[subjectIndex].subcategories = updated[
      subjectIndex
    ].subcategories.filter((_, i) => i !== subcatIndex);
    setEditForm({ ...editForm, subjects: updated });
  };

  const handleEditSubcategoryChange = (subjectIndex, subcatIndex, value) => {
    const updated = [...editForm.subjects];
    updated[subjectIndex].subcategories[subcatIndex] = value;
    setEditForm({ ...editForm, subjects: updated });
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }


    const validSubjects = newCategory.subjects.filter(
      (s) => s.name.trim() !== "",
    );
    if (validSubjects.length === 0) {
      setMessage({ type: "error", text: "At least one subject is required" });
      return;
    }

    const cleanedSubjects = validSubjects.map((subj) => ({
      name: subj.name.trim(),
      subcategories: subj.subcategories.filter((sc) => sc.trim() !== ""),
    }));

    try {
      let mainCategory = user?.teacherSubscription?.mainCategory;

      if (!mainCategory || mainCategory === "All") {
        if (!newCategory.mainCategory || newCategory.mainCategory === "") {
          setMessage({ type: "error", text: "Please select a main category" });
          return;
        }
        mainCategory = newCategory.mainCategory;
      }

      await dispatch(
        createCategory({
          ...newCategory,
          subjects: cleanedSubjects,
          mainCategory: mainCategory,
        }),
      ).unwrap();

      setMessage({ type: "success", text: "Category created successfully!" });
      toast.success("Category created successfully!");
      setShowAddCategory(false);
      setNewCategory({
        name: user?.teacherSubscription?.classLevel || "",
        type: user?.teacherSubscription?.examType || "Competitive",
        subjects: [
          {
            name: user?.teacherSubscription?.subject || "",
            subcategories:
              user?.teacherSubscription?.subcategory &&
              user.teacherSubscription.subcategory !== "All"
                ? [user.teacherSubscription.subcategory]
                : [],
          },
        ],
        icon: "BookOpen",
        mainCategory: user?.teacherSubscription?.mainCategory || "",
      });
    } catch (error) {
      setMessage({ type: "error", text: error });
      toast.error(error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editForm.name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }

    if (!editForm.mainCategory || editForm.mainCategory === "") {
      setMessage({ type: "error", text: "Main category is required" });
      return;
    }

    const validSubjects = editForm.subjects.filter((s) => s.name.trim() !== "");
    if (validSubjects.length === 0) {
      setMessage({ type: "error", text: "At least one subject is required" });
      return;
    }

    const cleanedSubjects = validSubjects.map((subj) => ({
      name: subj.name.trim(),
      subcategories: subj.subcategories.filter((sc) => sc.trim() !== ""),
    }));

    try {
      await dispatch(
        updateCategory({
          categoryId: editingCategory.id,
          updates: {
            ...editForm,
            subjects: cleanedSubjects,
            mainCategory: editForm.mainCategory,
          },
        }),
      ).unwrap();
      setMessage({ type: "success", text: "Category updated successfully!" });
      toast.success("Category updated successfully!");
      setEditingCategory(null);
    } catch (error) {
      setMessage({ type: "error", text: error });
      toast.error(error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone if there are no tests using this category.",
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error(error);
      setMessage({ type: "error", text: error });
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      BookOpen,
      GraduationCap,
      Beaker,
      Target,
      Zap,
    };
    return icons[iconName] || BookOpen;
  };

  const iconOptions = [
    { name: "BookOpen", component: BookOpen },
    { name: "GraduationCap", component: GraduationCap },
    { name: "Beaker", component: Beaker },
    { name: "Target", component: Target },
    { name: "Zap", component: Zap },
  ];

  const allTypeOptions = ["Competitive", "School", "Quiz"];
  const typeOptions =
    user?.role === "superadmin"
      ? allTypeOptions
      : allowedExamTypes !== null
        ? allowedExamTypes
        : allTypeOptions;
  const toggleSubject = (categoryId, subjectIndex) => {
    const key = `${categoryId}-${subjectIndex}`;
    setExpandedSubjects((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSubjectForm = (subject, index, isEdit = false) => {
    const handlers = isEdit
      ? {
          onSubjectChange: handleEditSubjectChange,
          onRemoveSubject: handleEditRemoveSubject,
          onAddSubcategory: handleEditAddSubcategory,
          onRemoveSubcategory: handleEditRemoveSubcategory,
          onSubcategoryChange: handleEditSubcategoryChange,
          subjects: editForm.subjects,
        }
      : {
          onSubjectChange: handleSubjectChange,
          onRemoveSubject: handleRemoveSubject,
          onAddSubcategory: handleAddSubcategory,
          onRemoveSubcategory: handleRemoveSubcategory,
          onSubcategoryChange: handleSubcategoryChange,
          subjects: newCategory.subjects,
        };

    return (
      <div
        key={index}
        className="border border-gray-300 dark:border-white/10 rounded-xl p-4 bg-gray-100 dark:bg-black/20"
      >
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={subject.name}
              onChange={(e) => handlers.onSubjectChange(index, e.target.value)}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value !== "" && !isSubjectAllowed(value)) {
                  toast.error(
                    `Subject "${value}" is not allowed. Your subscription only allows: ${allowedSubjects.join(", ")}`,
                  );

                  handlers.onSubjectChange(index, "");
                }
              }}
              placeholder={
                allowedSubjects !== null
                  ? `Allowed: ${allowedSubjects.join(", ")}`
                  : "e.g., Physics, Chemistry, Mathematics"
              }
              className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 placeholder:text-gray-500"
            />
            {allowedSubjects !== null && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Your subscription allows: {allowedSubjects.join(", ")}
              </p>
            )}
          </div>
          {handlers.subjects.length > 1 && (
            <button
              onClick={() => handlers.onRemoveSubject(index)}
              className="px-4 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="ml-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600 dark:text-gray-500 flex items-center gap-1">
              <List size={14} />
              Subcategories (Optional)
            </label>
            <button
              onClick={() => handlers.onAddSubcategory(index)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <Plus size={14} /> Add Subcategory
            </button>
          </div>

          {subject.subcategories.map((subcat, subcatIdx) => (
            <div key={subcatIdx} className="flex gap-2">
              <div className="flex items-center text-gray-500 dark:text-gray-600">
                <ChevronRight size={16} />
              </div>
              <input
                type="text"
                value={subcat}
                onChange={(e) =>
                  handlers.onSubcategoryChange(index, subcatIdx, e.target.value)
                }
                placeholder="e.g., Inorganic, Organic, Physical"
                className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/5 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-gray-500"
              />
              <button
                onClick={() => handlers.onRemoveSubcategory(index, subcatIdx)}
                className="px-3 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-white p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
            Category Management
          </h1>
          <p className="text-gray-600 dark:text-gray-500">
            Create and manage exam categories, subjects, and subcategories
          </p>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
                message.type === "error"
                  ? "bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-400"
                  : "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <Check size={20} />
              )}
              {message.text}
              <button
                onClick={() => setMessage({ type: "", text: "" })}
                className="ml-auto hover:text-gray-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowAddCategory(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all font-semibold text-white"
        >
          <Plus size={20} />
          Create New Category
        </button>

        <AnimatePresence>
          {showAddCategory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl p-6 mb-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <FolderPlus className="text-emerald-600 dark:text-emerald-400" />
                  New Category
                </h2>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategory({
                      name: "",
                      type: "Competitive",
                      subjects: [{ name: "", subcategories: [] }],
                      icon: "BookOpen",
                    });
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Main Category *
                  </label>
                  <select
                    value={
                      newCategory.mainCategory ||
                      user?.teacherSubscription?.mainCategory ||
                      ""
                    }
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        mainCategory: e.target.value,
                      })
                    }
                    disabled={
                      user?.teacherSubscription?.mainCategory &&
                      user.teacherSubscription.mainCategory !== "All"
                    }
                    className={`w-full bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 ${
                      user?.teacherSubscription?.mainCategory &&
                      user.teacherSubscription.mainCategory !== "All"
                        ? "cursor-not-allowed opacity-75"
                        : ""
                    }`}
                    required
                  >
                    <option value="">Select Main Category</option>
                    <option value="school">School</option>
                    <option value="entrance">Entrance</option>
                    <option value="recruitment">Recruitment</option>
                  </select>
                  {user?.teacherSubscription?.mainCategory &&
                    user.teacherSubscription.mainCategory !== "All" && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        🔒 Locked to your subscription:{" "}
                        {user.teacherSubscription.mainCategory}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="e.g., JEE Mains, NEET, SSC CGL"
                    className={`w-full bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 placeholder:text-gray-500`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Exam Type
                </label>
                <select
                  value={newCategory.type}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, type: e.target.value })
                  }
                  disabled={allowedExamTypes !== null}
                  className={`w-full bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 ${
                    allowedExamTypes !== null
                      ? "cursor-not-allowed opacity-75"
                      : ""
                  }`}
                >
                  <option value="">Select Exam Type</option>
                  {typeOptions.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-white dark:bg-gray-900"
                    >
                      {type}
                    </option>
                  ))}
                </select>
                {allowedExamTypes !== null && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    🔒 Locked to your subscription exam type
                  </p>
                )}
              </div>

              {(allowedSubjects !== null ||
                user?.teacherSubscription?.classLevel) && (
                <div className="col-span-2 p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    📋 Your Subscription Limits:
                  </p>
                  {user?.teacherSubscription?.examType && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-300">
                      • Exam Type: {user.teacherSubscription.examType}
                    </p>
                  )}
                  {user?.teacherSubscription?.classLevel && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-300">
                      • Class Level: {user.teacherSubscription.classLevel}
                    </p>
                  )}
                  {allowedSubjects && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-300">
                      • Allowed Subject(s): {allowedSubjects.join(", ")}
                    </p>
                  )}
                  {user?.teacherSubscription?.subcategory &&
                    user.teacherSubscription.subcategory !== "All" && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-300">
                        • Subcategory: {user.teacherSubscription.subcategory}
                      </p>
                    )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Note: Category name is{" "}
                    {user?.teacherSubscription?.classLevel
                      ? "locked to your class level"
                      : "customizable"}
                    , but subjects
                    {user?.teacherSubscription?.subcategory &&
                    user.teacherSubscription.subcategory !== "All"
                      ? " and subcategories are"
                      : " are"}{" "}
                    restricted to your subscription.
                  </p>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {iconOptions.map(({ name, component: Icon }) => (
                    <button
                      key={name}
                      onClick={() =>
                        setNewCategory({ ...newCategory, icon: name })
                      }
                      className={`p-3 rounded-lg border transition-all ${
                        newCategory.icon === name
                          ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/20"
                      }`}
                    >
                      <Icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Subjects & Subcategories
                  </label>
                  <button
                    onClick={handleAddSubject}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Subject
                  </button>
                </div>

                <div className="space-y-3">
                  {newCategory.subjects.map((subject, index) =>
                    renderSubjectForm(subject, index, false),
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategory({
                      name: user?.teacherSubscription?.classLevel || "",
                      type:
                        user?.teacherSubscription?.examType || "Competitive",
                      subjects: [
                        {
                          name: user?.teacherSubscription?.subject || "",
                          subcategories:
                            user?.teacherSubscription?.subcategory &&
                            user.teacherSubscription.subcategory !== "All"
                              ? [user.teacherSubscription.subcategory]
                              : [],
                        },
                      ],
                      icon: "BookOpen",
                    });
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-300 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={loading}
                  className="flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all font-semibold disabled:opacity-50 text-white"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Creating...
                    </div>
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setEditingCategory(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Edit2 className="text-emerald-600 dark:text-emerald-400" />
                    Edit Category
                  </h2>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Main Category *
                    </label>
                    <select
                      value={editForm.mainCategory || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          mainCategory: e.target.value,
                        })
                      }
                      disabled={
                        user?.role === "admin" &&
                        user?.teacherSubscription?.mainCategory &&
                        user.teacherSubscription.mainCategory !== "All"
                      }
                      className={`w-full bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 ${
                        user?.role === "admin" &&
                        user?.teacherSubscription?.mainCategory &&
                        user.teacherSubscription.mainCategory !== "All"
                          ? "cursor-not-allowed opacity-75"
                          : ""
                      }`}
                      required
                    >
                      <option value="">Select Main Category</option>
                      <option value="school">School</option>
                      <option value="entrance">Entrance</option>
                      <option value="recruitment">Recruitment</option>
                    </select>
                    {user?.role === "admin" &&
                      user?.teacherSubscription?.mainCategory &&
                      user.teacherSubscription.mainCategory !== "All" && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          🔒 Locked to subscription:{" "}
                          {user.teacherSubscription.mainCategory}
                        </p>
                      )}
                  </div>

                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Exam Type
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, type: e.target.value })
                      }
                      className="w-full bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
                    >
                      {typeOptions.map((type) => (
                        <option
                          key={type}
                          value={type}
                          className="bg-white dark:bg-gray-900"
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Icon
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map(({ name, component: Icon }) => (
                      <button
                        key={name}
                        onClick={() => setEditForm({ ...editForm, icon: name })}
                        className={`p-3 rounded-lg border transition-all ${
                          editForm.icon === name
                            ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/20"
                        }`}
                      >
                        <Icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Subjects & Subcategories
                    </label>
                    <button
                      onClick={handleEditAddSubject}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Subject
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editForm.subjects.map((subject, index) =>
                      renderSubjectForm(subject, index, true),
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 py-3 bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-300 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    disabled={loading}
                    className="flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all font-semibold disabled:opacity-50 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Updating...
                      </div>
                    ) : (
                      "Update Category"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {loading && categories.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-500">
              <Loader2 className="animate-spin mx-auto mb-2" size={32} />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-white/5 rounded-2xl border border-gray-300 dark:border-white/10">
              <BookOpen className="mx-auto mb-2 text-gray-500" size={48} />
              <p className="text-gray-600 dark:text-gray-500">
                No categories created yet
              </p>
            </div>
          ) : (
            categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);

              const normalizedSubjects = category.subjects.map((subj) =>
                typeof subj === "string"
                  ? { name: subj, subcategories: [] }
                  : subj,
              );

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center">
                        <IconComponent
                          className="text-emerald-600 dark:text-emerald-400"
                          size={24}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <span className="text-xs text-gray-600 dark:text-gray-500 font-medium">
                          {category.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">
                      Subjects:
                    </p>
                    <div className="space-y-2">
                      {normalizedSubjects.map((subject, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1 flex-1">
                              <ChevronRight size={14} />
                              {subject.name}
                            </span>
                            {subject.subcategories &&
                              subject.subcategories.length > 0 && (
                                <button
                                  onClick={() =>
                                    toggleSubject(category.id, idx)
                                  }
                                  className="p-1.5 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform ${
                                      expandedSubjects[`${category.id}-${idx}`]
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              )}
                          </div>

                          <AnimatePresence>
                            {expandedSubjects[`${category.id}-${idx}`] &&
                              subject.subcategories &&
                              subject.subcategories.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-8 mt-2 flex flex-wrap gap-2"
                                >
                                  {subject.subcategories.map(
                                    (subcat, subcatIdx) => (
                                      <span
                                        key={subcatIdx}
                                        className="px-2 py-1 bg-teal-100 dark:bg-teal-500/10 border border-teal-300 dark:border-teal-500/20 rounded-md text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1"
                                      >
                                        <ChevronRight size={12} />
                                        {subcat}
                                      </span>
                                    ),
                                  )}
                                </motion.div>
                              )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryManagement;
