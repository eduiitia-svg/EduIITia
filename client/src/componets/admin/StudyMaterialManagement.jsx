import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../slices/categorySlice";
import {
  getAllStudyMaterialsByCreator,
  uploadStudyMaterial,
  deleteStudyMaterial,
  updateStudyMaterial,
} from "../../slices/studyMaterialSlice";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Trash2,
  Calendar,
  Filter,
  Search,
  Layers,
  FileText,
  Download,
  Eye,
  Edit,
  X,
  ChevronRight,
  File,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Presentation,
  FileSpreadsheet,
  Video,
  Image,
} from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import toast from "react-hot-toast";

const StudyMaterialManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { materials, loading, uploadProgress } = useSelector(
    (state) => state.studyMaterial
  );
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [localFilteredMaterials, setLocalFilteredMaterials] = useState([]);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    categoryId: "",
    categoryName: "",
    subject: "",
    subcategory: "",
    title: "",
    description: "",
    file: null,
    isDemo: false,
  });
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    dispatch(getAllCategories());
    if (user) {
      dispatch(getAllStudyMaterialsByCreator());
    }
  }, [dispatch, user]);

  useEffect(() => {
    let filtered = [...materials];

    if (selectedCategoryId !== "all") {
      const selectedCategory = categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      if (selectedCategory) {
        filtered = filtered.filter(
          (material) =>
            material.categoryId === selectedCategoryId ||
            material.categoryName === selectedCategory.name
        );
      }
    }

    if (selectedSubject !== "all") {
      filtered = filtered.filter(
        (material) => material.subject === selectedSubject
      );
    }

    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(
        (material) => material.subcategory === selectedSubcategory
      );
    }

    setLocalFilteredMaterials(filtered);
  }, [
    materials,
    selectedCategoryId,
    selectedSubject,
    selectedSubcategory,
    categories,
  ]);

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const selectedSubjectObj = selectedCategory?.subjects.find((subj) => {
    const subjName = typeof subj === "string" ? subj : subj.name;
    return subjName === selectedSubject;
  });

  const availableSubcategories =
    selectedSubjectObj && typeof selectedSubjectObj === "object"
      ? selectedSubjectObj.subcategories || []
      : [];

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubject("all");
    setSelectedSubcategory("all");
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedSubcategory("all");
  };

  const handleUploadFormChange = (field, value) => {
    setUploadForm((prev) => ({ ...prev, [field]: value }));

    if (field === "categoryId") {
      const category = categories.find((cat) => cat.id === value);
      setUploadForm((prev) => ({
        ...prev,
        categoryName: category?.name || "",
        subject: "",
        subcategory: "",
      }));
    }

    if (field === "subject") {
      setUploadForm((prev) => ({ ...prev, subcategory: "" }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setUploadForm((prev) => ({ ...prev, file }));

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadForm.categoryId || !uploadForm.title || !uploadForm.file) {
      toast.error("Please fill all required fields");
      return;
    }

    setUploading(true);
    try {
      await dispatch(uploadStudyMaterial(uploadForm)).unwrap();
      toast.success("Study material uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({
        categoryId: "",
        categoryName: "",
        subject: "",
        subcategory: "",
        title: "",
        description: "",
        file: null,
        isDemo: false,
      });
      setFilePreview(null);
      dispatch(getAllStudyMaterialsByCreator());
    } catch (error) {
      toast.error(error || "Failed to upload study material");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this study material? This action cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteStudyMaterial(materialId)).unwrap();
        toast.success("Study material deleted successfully!");
        dispatch(getAllStudyMaterialsByCreator());
      } catch (error) {
        toast.error(error || "Failed to delete study material");
      }
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf"))
      return {
        icon: <FileText className="w-10 h-10" />,
        color: "text-red-400",
      };
    if (fileType?.includes("image"))
      return { icon: <Image className="w-10 h-10" />, color: "text-blue-400" };
    if (fileType?.includes("video"))
      return {
        icon: <Video className="w-10 h-10" />,
        color: "text-purple-400",
      };
    if (fileType?.includes("word") || fileType?.includes("document"))
      return {
        icon: <FileText className="w-10 h-10" />,
        color: "text-blue-400",
      };
    if (fileType?.includes("sheet") || fileType?.includes("excel"))
      return {
        icon: <FileSpreadsheet className="w-10 h-10" />,
        color: "text-green-400",
      };
    if (fileType?.includes("presentation") || fileType?.includes("powerpoint"))
      return {
        icon: <Presentation className="w-10 h-10" />,
        color: "text-orange-400",
      };
    return { icon: <File className="w-10 h-10" />, color: "text-gray-400" };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const uploadCategory = categories.find(
    (cat) => cat.id === uploadForm.categoryId
  );
  const uploadSubjectObj = uploadCategory?.subjects.find((subj) => {
    const subjName = typeof subj === "string" ? subj : subj.name;
    return subjName === uploadForm.subject;
  });
  const uploadAvailableSubcategories =
    uploadSubjectObj && typeof uploadSubjectObj === "object"
      ? uploadSubjectObj.subcategories || []
      : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-emerald-500"
            size={48}
          />
          <p className="text-gray-400">Loading Categories...</p>
        </div>
      </div>
    );
  }
  if (viewingMaterial) {
    const material = materials.find((m) => m.id === viewingMaterial);
    if (!material) {
      setViewingMaterial(null);
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white"
      >
        <div className="sticky top-0 bg-white/80 dark:bg-[#050505]/80 rounded-2xl backdrop-blur-xl border-b border-gray-200 dark:border-white/10 z-10 flex justify-between items-center p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewingMaterial(null)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
            >
              <ArrowLeft
                size={22}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {material.title}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Study Material
                </p>
                {material.isDemo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20">
                    DEMO
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-500 font-mono border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5">
            Uploaded: {formatDate(material.createdAt)}
          </span>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-8">
          <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative space-y-6">
              <div className="flex items-start gap-4">
                <div className={getFileIcon(material.fileType).color}>
                  {getFileIcon(material.fileType).icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {material.title}
                  </h4>
                  {material.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                  <p className="text-gray-600 dark:text-gray-500 mb-1">
                    Category
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {material.categoryName || "N/A"}
                  </p>
                </div>
                {material.subject && (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                    <p className="text-gray-600 dark:text-gray-500 mb-1">
                      Subject
                    </p>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-purple-600 dark:text-purple-400">
                        {material.subject}
                      </p>
                      {material.subcategory && (
                        <p className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          <ChevronRight size={12} />
                          {material.subcategory}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                  <p className="text-gray-600 dark:text-gray-500 mb-1">
                    File Size
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {formatFileSize(material.fileSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={18} /> View Material
                </a>
                <a
                  href={material.fileUrl}
                  download
                  className="flex-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20 py-3 rounded-xl text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download
                </a>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="px-6 py-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gray-50 dark:bg-[#050505] min-h-screen text-gray-900 dark:text-white p-8 rounded-2xl"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Study Materials
          </h2>
          <p className="text-gray-600 dark:text-gray-500 mt-2 flex items-center gap-2">
            <Layers
              size={16}
              className="text-emerald-600 dark:text-emerald-500"
            />
            Manage your study resources
          </p>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto flex-wrap gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter
                className="text-gray-500 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                size={16}
              />
            </div>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-500/50 appearance-none cursor-pointer min-w-[180px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <option value="all" className="bg-white dark:bg-gray-900">
                All Categories
              </option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="bg-white dark:bg-gray-900"
                >
                  {category.name} ({category.type})
                </option>
              ))}
            </select>
          </div>

          {selectedCategoryId !== "all" && selectedCategory && (
            <div className="relative group">
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-500/50 appearance-none cursor-pointer min-w-[150px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <option value="all" className="bg-white dark:bg-gray-900">
                  All Subjects
                </option>
                {selectedCategory.subjects.map((subject) => {
                  const subjName =
                    typeof subject === "string" ? subject : subject.name;
                  return (
                    <option
                      key={subjName}
                      value={subjName}
                      className="bg-white dark:bg-gray-900"
                    >
                      {subjName}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {selectedSubject !== "all" && availableSubcategories.length > 0 && (
            <div className="relative group">
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-teal-500 dark:focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-500/50 appearance-none cursor-pointer min-w-[150px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <option value="all" className="bg-white dark:bg-gray-900">
                  All Subcategories
                </option>
                {availableSubcategories.map((subcat) => (
                  <option
                    key={subcat}
                    value={subcat}
                    className="bg-white dark:bg-gray-900"
                  >
                    {subcat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-500/20">
            {localFilteredMaterials.length} Materials
          </span>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-500 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <Plus size={18} /> Upload Material
          </button>
        </div>
      </motion.div>

      {localFilteredMaterials.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-3xl"
        >
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-600">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No study materials found
          </h3>
          <p className="text-gray-600 dark:text-gray-500 mb-6">
            {selectedCategoryId !== "all" ||
            selectedSubject !== "all" ||
            selectedSubcategory !== "all"
              ? "Try changing your filter selections"
              : "Upload your first study material to get started"}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Upload Study Material
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localFilteredMaterials.map((material) => (
            <motion.div
              variants={itemVariants}
              key={material.id}
              className="group relative bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-xl dark:hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

              {material.isDemo && (
                <div className="absolute top-0 right-0">
                  <div className="bg-linear-to-bl from-emerald-400 to-teal-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-lg">
                    DEMO ACCESS
                  </div>
                </div>
              )}

              <div className="relative flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className={getFileIcon(material.fileType).color}>
                      {getFileIcon(material.fileType).icon}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20">
                      {material.categoryName || "Uncategorized"}
                    </span>
                    {material.subject && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/20">
                        {material.subject}
                      </span>
                    )}
                    {material.subcategory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/20 flex items-center gap-1">
                        <ChevronRight size={10} />
                        {material.subcategory}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {material.title}
                  </h3>
                  {material.description && (
                    <p className="text-gray-600 dark:text-gray-500 text-xs mt-2 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-2 bg-gray-100 dark:bg-black/40 rounded-xl p-3 mb-5 border border-gray-200 dark:border-white/5">
                <div className="col-span-2 flex items-center space-x-2 text-gray-600 dark:text-gray-400 truncate">
                  <File
                    size={14}
                    className="text-emerald-600 dark:text-emerald-500 shrink-0"
                  />
                  <span className="text-xs truncate">{material.fileName}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <FileText
                    size={14}
                    className="text-amber-600 dark:text-amber-500"
                  />
                  <span className="text-xs">
                    {formatFileSize(material.fileSize)}
                  </span>
                </div>
                <div className="col-span-2 flex items-center space-x-2 text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-white/5 pt-2 mt-1">
                  <Calendar size={14} />
                  <span className="text-[10px]">
                    Uploaded: {formatDate(material.createdAt)}
                  </span>
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => setViewingMaterial(material.id)}
                  className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all border border-gray-200 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500"
                >
                  View Details
                </button>
                <a
                  href={material.fileUrl}
                  download
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all border border-blue-300 dark:border-blue-500/20 hover:border-blue-500 dark:hover:border-blue-500"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all border border-red-300 dark:border-red-500/20 hover:border-red-500 dark:hover:border-red-500"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-emerald-900/20 rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/80 backdrop-blur-md p-6 border-b border-gray-200 dark:border-white/5 z-10">
                <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 shadow-lg dark:shadow-emerald-500/10">
                      <Upload
                        className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Upload Material
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm font-medium">
                        Share resources with your students
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => !uploading && setShowUploadModal(false)}
                    disabled={uploading}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <form onSubmit={handleUploadSubmit} className="p-8 space-y-6">
                <div className="bg-emerald-100 dark:bg-emerald-500/5 border border-emerald-300 dark:border-emerald-500/20 rounded-xl p-4 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-500/10">
                  <label className="flex items-start gap-3 cursor-pointer group relative">
                    <input
                      type="checkbox"
                      checked={uploadForm.isDemo}
                      onChange={(e) =>
                        handleUploadFormChange("isDemo", e.target.checked)
                      }
                      disabled={uploading}
                      className="peer sr-only"
                    />

                    <div
                      className="
                      mt-0.5 w-5 h-5 rounded-md border border-emerald-400 dark:border-emerald-500/30 bg-white dark:bg-slate-950 
                      flex items-center justify-center 
                      transition-all duration-200 ease-out 
                      shadow-sm 
                      group-hover:border-emerald-500 dark:group-hover:border-emerald-400/50 
                      
                      peer-checked:bg-emerald-500 
                      peer-checked:border-emerald-500 
                      peer-checked:shadow-emerald-500/20 
                      
                      peer-checked:[&_svg]:scale-100 
                      peer-checked:[&_svg]:opacity-100
                      
                      peer-focus:ring-2 peer-focus:ring-emerald-500/30 peer-focus:ring-offset-1 peer-focus:ring-offset-white dark:peer-focus:ring-offset-slate-950 
                      peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                  "
                    >
                      <svg
                        className="w-3.5 h-3.5 text-white dark:text-slate-950 transform scale-50 opacity-0 transition-all duration-200"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                        Make this a DEMO material
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 leading-relaxed">
                        Demo materials are accessible to all students, including
                        those without organization accounts
                      </p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider ml-1">
                      Category
                    </label>
                    <div className="relative group">
                      <select
                        value={uploadForm.categoryId}
                        onChange={(e) =>
                          handleUploadFormChange("categoryId", e.target.value)
                        }
                        required
                        disabled={uploading}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/10 transition-all disabled:opacity-50 appearance-none"
                      >
                        <option value="" className="bg-white dark:bg-slate-900">
                          Select category
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                            className="bg-white dark:bg-slate-900"
                          >
                            {category.name} ({category.type})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {uploadForm.categoryId && uploadCategory && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                        Subject
                      </label>
                      <div className="relative group">
                        <select
                          value={uploadForm.subject}
                          onChange={(e) =>
                            handleUploadFormChange("subject", e.target.value)
                          }
                          disabled={uploading}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/10 transition-all disabled:opacity-50 appearance-none"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-slate-900"
                          >
                            Select subject
                          </option>
                          {uploadCategory.subjects.map((subject) => {
                            const subjName =
                              typeof subject === "string"
                                ? subject
                                : subject.name;
                            return (
                              <option
                                key={subjName}
                                value={subjName}
                                className="bg-white dark:bg-slate-900"
                              >
                                {subjName}
                              </option>
                            );
                          })}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {uploadForm.subject &&
                  uploadAvailableSubcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                        Subcategory
                      </label>
                      <div className="relative group">
                        <select
                          value={uploadForm.subcategory}
                          onChange={(e) =>
                            handleUploadFormChange(
                              "subcategory",
                              e.target.value
                            )
                          }
                          disabled={uploading}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-teal-500 dark:focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-500/10 transition-all disabled:opacity-50 appearance-none"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-slate-900"
                          >
                            Select subcategory
                          </option>
                          {uploadAvailableSubcategories.map((subcat) => (
                            <option
                              key={subcat}
                              value={subcat}
                              className="bg-white dark:bg-slate-900"
                            >
                              {subcat}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) =>
                      handleUploadFormChange("title", e.target.value)
                    }
                    required
                    disabled={uploading}
                    placeholder="e.g. Advanced Calculus Notes Chapter 1"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/10 transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      handleUploadFormChange("description", e.target.value)
                    }
                    disabled={uploading}
                    placeholder="Add context about this material..."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/10 resize-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs mb-1 font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider ml-1">
                    File Attachment
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      required
                      disabled={uploading}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.avi,.mov"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`relative flex flex-col items-center justify-center w-full px-4 py-10 bg-gray-50 dark:bg-slate-950/30 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
                        uploading
                          ? "opacity-50 cursor-not-allowed border-gray-300 dark:border-white/10"
                          : "border-gray-300 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
                      }`}
                    >
                      <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 dark:group-hover:from-emerald-500/5 dark:group-hover:to-teal-500/5 transition-all duration-500" />
                      {filePreview ? (
                        <div className="relative z-10  text-center">
                          <div className="relative p-2 bg-white dark:bg-slate-900 rounded-lg mb-3 shadow-xl w-full h-36 flex items-center justify-center">
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="max-h-full max-w-full rounded-md object-contain"
                            />
                          </div>

                          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                            {uploadForm.file?.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 font-mono">
                            {formatFileSize(uploadForm.file?.size || 0)}
                          </p>
                        </div>
                      ) : uploadForm.file ? (
                        <div className="relative z-10 text-center">
                          <div
                            className={`mb-4 drop-shadow-lg flex items-center justify-center  transform group-hover:scale-110 transition-transform duration-300 ${
                              getFileIcon(uploadForm.file.type).color
                            }`}
                          >
                            {getFileIcon(uploadForm.file.type).icon}
                          </div>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                            {uploadForm.file.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 font-mono">
                            {formatFileSize(uploadForm.file.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="relative z-10 text-center space-y-3">
                          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-slate-900 rounded-full flex items-center justify-center border border-gray-300 dark:border-white/10 group-hover:border-emerald-500 dark:group-hover:border-emerald-500/30 group-hover:scale-110 transition-all duration-300 shadow-lg">
                            <Upload
                              className="text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                              size={28}
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                              PDF, Media (Max 50MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {uploading && uploadProgress > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider">
                      <span className="text-emerald-600 dark:text-emerald-400 animate-pulse">
                        Uploading...
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-950 rounded-full overflow-hidden border border-gray-300 dark:border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-400 shadow-lg dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="flex-1 px-6 py-3.5 bg-transparent text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors font-medium border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-6 py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg dark:shadow-emerald-900/40 hover:shadow-xl dark:hover:shadow-emerald-900/60 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="ml-1">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <span>Upload Material</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewingMaterial &&
        (() => {
          const material = materials.find((m) => m.id === viewingMaterial);
          if (!material) {
            setViewingMaterial(null);
            return null;
          }

          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed inset-0 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/95 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 z-10 flex justify-between items-center p-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setViewingMaterial(null)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
                  >
                    <ArrowLeft
                      size={22}
                      className="group-hover:-translate-x-1 transition-transform"
                    />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                      {material.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-emerald-700 dark:text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Study Material
                      </p>
                      {material.isDemo && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20">
                          DEMO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-500 font-mono border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5">
                  Uploaded: {formatDate(material.createdAt)}
                </span>
              </div>

              <div className="max-w-6xl mx-auto p-6 md:p-8">
                <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="relative space-y-6">
                    <div className="flex items-start gap-4">
                      <div className={getFileIcon(material.fileType).color}>
                        {getFileIcon(material.fileType).icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {material.title}
                        </h4>
                        {material.description && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                        <p className="text-gray-600 dark:text-gray-500 mb-1">
                          Category
                        </p>
                        <p className="font-medium text-emerald-700 dark:text-emerald-400">
                          {material.categoryName || "N/A"}
                        </p>
                      </div>
                      {material.subject && (
                        <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                          <p className="text-gray-600 dark:text-gray-500 mb-1">
                            Subject
                          </p>
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-purple-700 dark:text-purple-400">
                              {material.subject}
                            </p>
                            {material.subcategory && (
                              <p className="text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1">
                                <ChevronRight size={12} />
                                {material.subcategory}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                        <p className="text-gray-600 dark:text-gray-500 mb-1">
                          File Size
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {formatFileSize(material.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={18} /> View Material
                      </a>
                      <a
                        href={material.fileUrl}
                        download
                        className="flex-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20 py-3 rounded-xl text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> Download
                      </a>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="px-6 py-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
    </motion.div>
  );
};
export default StudyMaterialManagement;
