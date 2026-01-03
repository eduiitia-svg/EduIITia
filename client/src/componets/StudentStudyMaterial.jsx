import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../slices/categorySlice";
import { getAllStudyMaterialsByCreator } from "../slices/studyMaterialSlice";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  FileText,
  Download,
  Eye,
  X,
  Filter,
  Search,
  Play,
  Video,
  File,
  ChevronRight,
  Loader2,
  GraduationCap,
  Layers,
  Clock,
  ArrowLeft,
  Image,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentStudyMaterial = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { materials, loading } = useSelector((state) => state.studyMaterial);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [selectedType, setSelectedType] = useState("all");

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

    if (selectedType !== "all") {
      filtered = filtered.filter((material) => {
        if (selectedType === "video") {
          return material.fileType?.includes("video");
        } else if (selectedType === "document") {
          return (
            material.fileType?.includes("pdf") ||
            material.fileType?.includes("doc") ||
            material.fileType?.includes("ppt")
          );
        } else if (selectedType === "image") {
          return material.fileType?.includes("image");
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (material) =>
          material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          material.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          material.categoryName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          material.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  }, [
    materials,
    selectedCategoryId,
    selectedSubject,
    selectedSubcategory,
    searchQuery,
    selectedType,
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isVideo = (fileType) => fileType?.includes("video");
  const isImage = (fileType) => fileType?.includes("image");

  return (
    <>
      {/* Loading State */}
      {(loading || categoriesLoading) && (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <Loader2
              className="animate-spin mx-auto mb-4 text-emerald-600 dark:text-emerald-500"
              size={48}
            />
            <p className="text-gray-600 dark:text-gray-400">
              Loading Study Materials...
            </p>
          </div>
        </div>
      )}

      {/* Material Viewer */}
      {viewingMaterial &&
        (() => {
          const material = materials.find((m) => m.id === viewingMaterial);
          if (!material) {
            setViewingMaterial(null);
            return null;
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-slate-200 selection:bg-emerald-500/30"
            >
              <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => setViewingMaterial(null)}
                      className="group p-2.5 rounded-full bg-gray-100 dark:bg-white/3 border border-gray-200 dark:border-white/8 hover:bg-gray-200 dark:hover:bg-white/8 hover:border-gray-300 dark:hover:border-white/15 transition-all"
                    >
                      <ArrowLeft
                        size={20}
                        className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:-translate-x-0.5 transition-all"
                      />
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white/90">
                        {material.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                          <GraduationCap size={12} /> Study Material
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="relative group">
                      {isVideo(material.fileType) ? (
                        <div className="bg-gray-900 dark:bg-black/60 rounded-3xl overflow-hidden border border-gray-300 dark:border-white/8 shadow-2xl shadow-gray-200/20 dark:shadow-emerald-900/5">
                          <video
                            controls
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full aspect-video object-cover"
                            poster={material.thumbnailUrl}
                          >
                            <source
                              src={material.fileUrl}
                              type={material.fileType}
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : isImage(material.fileType) ? (
                        <div className="bg-gray-50 dark:bg-white/2 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/8 p-3 shadow-2xl">
                          <img
                            src={material.fileUrl}
                            alt={material.title}
                            className="w-full h-auto rounded-2xl"
                          />
                        </div>
                      ) : (
                        <div className="relative overflow-hidden bg-linear-to-br from-emerald-100 dark:from-emerald-500/[0.07] to-teal-100 dark:to-teal-500/[0.07] rounded-3xl border border-emerald-300 dark:border-emerald-500/20 p-20 flex flex-col items-center justify-center text-center">
                          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />

                          <div className="relative">
                            <div className="p-6 bg-white dark:bg-white/3 rounded-2xl border border-gray-200 dark:border-white/5 mb-6 inline-block shadow-lg dark:shadow-none">
                              <span className="text-7xl block transition-transform group-hover:scale-110 duration-500">
                                {getFileIcon(material.fileType).icon}
                              </span>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              {material.fileName}
                            </h4>
                            <p className="text-emerald-600 dark:text-emerald-400/60 font-medium tracking-wide">
                              {formatFileSize(material.fileSize)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {material.description && (
                      <div className="bg-white dark:bg-white/3 border border-gray-200 dark:border-white/8 rounded-3xl p-8 shadow-sm dark:shadow-none">
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                          <FileText
                            size={16}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          Description
                        </h5>
                        <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-base font-light">
                          {material.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-white/3 border border-gray-200 dark:border-white/8 rounded-3xl p-7 sticky top-28 shadow-sm dark:shadow-none">
                      <h5 className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.25em] mb-8">
                        Material Details
                      </h5>

                      <div className="space-y-6">
                        <DetailItem
                          label="Category"
                          value={material.categoryName || "Uncategorized"}
                        />

                        {material.subject && (
                          <DetailItem
                            label="Subject"
                            value={material.subject}
                          />
                        )}

                        {material.subcategory && (
                          <DetailItem
                            label="Subcategory"
                            value={material.subcategory}
                            icon={
                              <ChevronRight
                                size={12}
                                className="text-emerald-600 dark:text-emerald-500"
                              />
                            }
                          />
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                              Size
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                              {formatFileSize(material.fileSize)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                              Date
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
                              <Clock size={12} className="text-gray-500" />
                              {formatDate(material.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 space-y-3">
                        <Link
                          to={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 text-white py-4 rounded-2xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 font-semibold text-sm"
                        >
                          <Eye size={18} /> Open Material
                        </Link>

                        {!isVideo(material.fileType) && (
                          <Link
                            to={material.fileUrl}
                            download
                            className="w-full bg-gray-100 dark:bg-white/3 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/8 py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center gap-2.5 font-semibold text-sm"
                          >
                            <Download size={18} /> Download File
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </motion.div>
          );
        })()}

      {/* Main Materials List View */}
      {!loading && !categoriesLoading && !viewingMaterial && (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
            <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-500 rounded-full animate-pulse" />
                  LIBRARY LIVE
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  Next-Gen Mock{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Learning
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                  Access your study materials, watch video lectures, and
                  download resources to excel in your learning journey.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap
                    className="text-emerald-600 dark:text-emerald-400"
                    size={24}
                  />
                  <h2 className="text-2xl font-bold">Filter Materials</h2>
                </div>

                <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                      <Filter
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        size={16}
                      />
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                      >
                        <option
                          value="all"
                          className="bg-white dark:bg-gray-900"
                        >
                          All Categories
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                            className="bg-white dark:bg-gray-900"
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCategoryId !== "all" && selectedCategory && (
                      <div className="relative">
                        <select
                          value={selectedSubject}
                          onChange={(e) => handleSubjectChange(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                        >
                          <option
                            value="all"
                            className="bg-white dark:bg-gray-900"
                          >
                            All Subjects
                          </option>
                          {selectedCategory.subjects.map((subject) => {
                            const subjName =
                              typeof subject === "string"
                                ? subject
                                : subject.name;
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

                    {selectedSubject !== "all" &&
                      availableSubcategories.length > 0 && (
                        <div className="relative">
                          <select
                            value={selectedSubcategory}
                            onChange={(e) =>
                              setSelectedSubcategory(e.target.value)
                            }
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                          >
                            <option
                              value="all"
                              className="bg-white dark:bg-gray-900"
                            >
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

                    <div className="relative">
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                      >
                        <option
                          value="all"
                          className="bg-white dark:bg-gray-900"
                        >
                          All Types
                        </option>
                        <option
                          value="video"
                          className="bg-white dark:bg-gray-900"
                        >
                          Videos
                        </option>
                        <option
                          value="document"
                          className="bg-white dark:bg-gray-900"
                        >
                          Documents
                        </option>
                        <option
                          value="image"
                          className="bg-white dark:bg-gray-900"
                        >
                          Images
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search materials by title, description, or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 flex items-center justify-between"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Layers
                    className="text-emerald-600 dark:text-emerald-400"
                    size={24}
                  />
                  Available Materials
                </h2>
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-xl">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {filteredMaterials.length}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    Materials
                  </span>
                </div>
              </motion.div>

              {filteredMaterials.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-sm dark:shadow-none"
                >
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText
                      size={32}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No materials found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search query
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMaterials.map((material, index) => {
                    const fileInfo = getFileIcon(material.fileType);
                    return (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-300 shadow-sm dark:shadow-none"
                      >
                        <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{fileInfo.icon}</div>
                              <div className="flex flex-col gap-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20 w-fit">
                                  {material.categoryName || "Uncategorized"}
                                </span>
                                {material.subject && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/20 w-fit">
                                    {material.subject}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isVideo(material.fileType) && (
                              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30">
                                <Video
                                  size={16}
                                  className="text-purple-600 dark:text-purple-400"
                                />
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                            {material.title}
                          </h3>

                          {material.description && (
                            <p className="text-gray-600 dark:text-gray-500 text-sm mb-4 line-clamp-2">
                              {material.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200 dark:border-white/5">
                            <span className="flex items-center gap-1">
                              <File size={12} />
                              {formatFileSize(material.fileSize)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(material.createdAt)}
                            </span>
                          </div>

                          <button
                            onClick={() => setViewingMaterial(material.id)}
                            className="w-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-gray-200 dark:border-white/5 hover:border-emerald-500 font-medium flex items-center justify-center gap-2"
                          >
                            {isVideo(material.fileType) ? (
                              <>
                                <Play size={16} /> Watch Video
                              </>
                            ) : (
                              <>
                                <Eye size={16} /> View Material
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentStudyMaterial;

const DetailItem = ({ label, value, icon }) => (
  <div>
    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1.5">
      {label}
    </p>
    <p className="text-gray-900 dark:text-white font-medium text-base flex items-center gap-1">
      {icon}
      {value}
    </p>
  </div>
);
