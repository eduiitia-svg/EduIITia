import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../slices/categorySlice";
import {
  getAllQuestionPapersByCreator,
  deleteQuestionPaper as deleteQuestionPaperAction,
  deleteQuestionImage as deleteQuestionImageAction,
  deleteExplanationImage as deleteExplanationImageAction,
} from "../../slices/questionSlice";
import EditQuestionModal from "./EditQuestionModal";
import EditQuestionImages from "./EditQuestionImages";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Trash2,
  HelpCircle,
  Calendar,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Image as ImageIcon,
  Edit,
  Search,
  Layers,
  X,
  Trash,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const QuestionPapers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { papers, loading } = useSelector((state) => state.questions);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category,
  );
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [addingImages, setAddingImages] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [localFilteredPapers, setLocalFilteredPapers] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  useEffect(() => {
    dispatch(getAllCategories());
    if (user) {
      if (user.role === "superadmin") {
        dispatch(getAllQuestionPapersByCreator());
      } else {
        dispatch(getAllQuestionPapersByCreator());
      }
    }
  }, [dispatch, user]);
  useEffect(() => {
    let filtered = [...papers];
    if (selectedCategoryId !== "all") {
      const selectedCategory = categories.find(
        (cat) => cat.id === selectedCategoryId,
      );
      if (selectedCategory) {
        filtered = filtered.filter(
          (paper) =>
            paper.categoryId === selectedCategoryId ||
            paper.categoryName === selectedCategory.name,
        );
      }
    }
    if (selectedSubject !== "all") {
      filtered = filtered.filter((paper) => paper.subject === selectedSubject);
    }
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(
        (paper) => paper.subcategory === selectedSubcategory,
      );
    }
    setLocalFilteredPapers(filtered);
  }, [
    papers,
    selectedCategoryId,
    selectedSubject,
    selectedSubcategory,
    categories,
  ]);
  const selectedPaper = selectedPaperId
    ? papers.find((p) => p.id === selectedPaperId)
    : null;
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
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
  const handleDeletePaper = async (paperId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this entire test paper? This action cannot be undone.",
      )
    ) {
      try {
        const result = await dispatch(
          deleteQuestionPaperAction(paperId),
        ).unwrap();
        if (result.success) {
          toast.success("Question paper deleted successfully!");
          dispatch(getAllQuestionPapersByCreator());
        }
      } catch (error) {
        toast.error(error || "Failed to delete question paper");
        console.error(error);
      }
    }
  };

  const handleDeleteImage = async (
    paperId,
    questionIndex,
    imageIndex,
    type = "question",
  ) => {
    if (paperId && questionIndex !== null && imageIndex !== null) {
      try {
        let result;
        if (type === "explanation") {
          result = await dispatch(
            deleteExplanationImageAction({
              testId: paperId,
              questionIndex,
              imageIndex,
            }),
          ).unwrap();
        } else {
          result = await dispatch(
            deleteQuestionImageAction({
              testId: paperId,
              questionIndex,
              imageIndex,
            }),
          ).unwrap();
        }
        if (result.success) {
          toast.success("Image deleted successfully!");
          setViewingImage(null);
          dispatch(getAllQuestionPapersByCreator());
        }
      } catch (error) {
        toast.error(error || "Failed to delete image");
      }
    }
  };

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
  if (loading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-emerald-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  if (selectedPaper) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white"
      >
        <div className="bg-white/95 rounded-2xl dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 z-10 flex justify-between items-center p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedPaperId(null)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
            >
              <ArrowLeft
                size={22}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {selectedPaper.testName}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Active Protocol
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-500 font-mono border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5">
            Created: {formatDate(selectedPaper.createdAt)}
          </span>
        </div>
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers
                className="text-emerald-600 dark:text-emerald-400"
                size={18}
              />{" "}
              Test Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                <p className="text-gray-600 dark:text-gray-500 mb-1">Title</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">
                  {selectedPaper.title}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                <p className="text-gray-600 dark:text-gray-500 mb-1">
                  Category
                </p>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {selectedPaper.categoryName || "N/A"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                <p className="text-gray-600 dark:text-gray-500 mb-1">Subject</p>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-purple-700 dark:text-purple-400">
                    {selectedPaper.subject || "N/A"}
                  </p>
                  {selectedPaper.subcategory && (
                    <p className="text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1">
                      <ChevronRight size={12} />
                      {selectedPaper.subcategory}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                <p className="text-gray-600 dark:text-gray-500 mb-1">
                  Duration
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                  <Clock
                    size={14}
                    className="text-emerald-600 dark:text-emerald-500"
                  />{" "}
                  {selectedPaper.makeTime} mins
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
                <p className="text-gray-600 dark:text-gray-500 mb-1">
                  Total Questions
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-200">
                  {selectedPaper.questions?.length || 0}
                </p>
              </div>
            </div>
            {selectedPaper.instructions && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-100/80 text-sm">
                <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">
                  Instructions:
                </strong>{" "}
                {selectedPaper.instructions}
              </div>
            )}
          </div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-6 text-lg flex items-center gap-2">
            <HelpCircle className="text-purple-600 dark:text-purple-400" />{" "}
            Questions Database ({selectedPaper.questions?.length || 0})
          </h4>
          <div className="space-y-6">
            {selectedPaper.questions?.map((question, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={index}
                className="group border border-gray-200 dark:border-white/10 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/4 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500 dark:hover:border-emerald-500/30 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="font-medium text-gray-900 dark:text-gray-200 text-lg flex-1 mr-4">
                    <span className="text-emerald-600 dark:text-emerald-500 font-mono mr-2">
                      Q{index + 1}.
                    </span>
                    {question.questionText}
                  </p>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      question.questionLevel === "Easy"
                        ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20"
                        : question.questionLevel === "Medium"
                          ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/20"
                          : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20"
                    }`}
                  >
                    {question.questionLevel}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
                  {question.options?.map((option, optIndex) => {
                    const isCorrect =
                      question.correctAnswer ===
                      String.fromCharCode(65 + optIndex);
                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                          isCorrect
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
                            : "bg-gray-100 dark:bg-black/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-white/5"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            isCorrect
                              ? "bg-emerald-500 text-white dark:text-black"
                              : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        {option}
                      </div>
                    );
                  })}
                </div>

                {question.images && question.images.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon
                        className="text-purple-600 dark:text-purple-400"
                        size={16}
                      />
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                        Attached Media ({question.images.length})
                      </h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {question.images.map((imageUrl, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="relative group/img overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black/30 aspect-square hover:border-purple-500 dark:hover:border-purple-500/50 transition-all cursor-pointer"
                          onClick={() =>
                            setViewingImage({
                              url: imageUrl,
                              paperId: selectedPaper.id,
                              questionIndex: index,
                              imageIndex: imgIndex,
                            })
                          }
                        >
                          <img
                            src={imageUrl}
                            alt={`Question ${index + 1} - Image ${
                              imgIndex + 1
                            }`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon
                                className="mx-auto mb-2 text-purple-400"
                                size={24}
                              />
                              <p className="text-xs text-white font-medium">
                                Click to view
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                    <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                      <div className="shrink-0">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                          Explanation
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {question.explanation}
                        </p>

                        {question.explanationImages &&
                          question.explanationImages.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-500/20">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                                <ImageIcon size={12} /> Explanation Media (
                                {question.explanationImages.length})
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {question.explanationImages.map(
                                  (imageUrl, imgIndex) => (
                                    <div
                                      key={imgIndex}
                                      className="relative group/img overflow-hidden rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-100/50 dark:bg-black/30 aspect-square hover:border-blue-400 dark:hover:border-blue-400/50 transition-all cursor-pointer"
                                      onClick={() =>
                                        setViewingImage({
                                          url: imageUrl,
                                          paperId: selectedPaper.id,
                                          questionIndex: index,
                                          imageIndex: imgIndex,
                                          type: "explanation",
                                        })
                                      }
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={`Explanation ${index + 1} - Image ${imgIndex + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="text-center">
                                          <BookOpen
                                            className="mx-auto mb-2 text-blue-400"
                                            size={20}
                                          />
                                          <p className="text-xs text-white font-medium">
                                            View
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5 gap-4">
                  <div className="flex items-center space-x-6 text-xs text-gray-600 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      Correct Answer:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                        {question.correctAnswer}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon
                        size={12}
                        className="text-purple-600 dark:text-purple-400"
                      />
                      <strong className="text-gray-900 dark:text-white">
                        {question.images?.length || 0}
                      </strong>
                      {question.images?.length === 1 ? " Image" : " Images"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        setEditingQuestion({
                          paper: selectedPaper,
                          question,
                          index,
                        })
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20 rounded-lg text-xs hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-all"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() =>
                        setAddingImages({ paper: selectedPaper, index })
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-500/20 rounded-lg text-xs hover:bg-purple-200 dark:hover:bg-purple-500/20 transition-all"
                    >
                      <ImageIcon size={14} /> Add Media
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {viewingImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setViewingImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative max-w-2xl w-full max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-black/60 border-b border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    {viewingImage.type === "explanation" ? (
                      <BookOpen
                        className="text-blue-600 dark:text-blue-400"
                        size={18}
                      />
                    ) : (
                      <ImageIcon
                        className="text-purple-600 dark:text-purple-400"
                        size={18}
                      />
                    )}
                    <h3 className="text-gray-900 dark:text-white font-semibold text-sm">
                      {viewingImage.type === "explanation"
                        ? "Explanation"
                        : "Question"}{" "}
                      Image {viewingImage.imageIndex + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleDeleteImage(
                          viewingImage.paperId,
                          viewingImage.questionIndex,
                          viewingImage.imageIndex,
                          viewingImage.type || "question",
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all border border-red-300 dark:border-red-500/30 text-xs font-medium"
                      title="Delete Image"
                    >
                      <Trash size={14} />
                      Delete
                    </button>
                    <button
                      onClick={() => setViewingImage(null)}
                      className="p-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 min-h-[300px]">
                  <img
                    src={viewingImage.url}
                    alt="Full size"
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-md"
                  />
                </div>

                <div className="px-4 py-2.5 bg-gray-100 dark:bg-black/40 border-t border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 dark:text-gray-500 text-xs text-center">
                    Click outside to close
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {editingQuestion && (
          <EditQuestionModal
            paper={editingQuestion.paper}
            question={editingQuestion.question}
            index={editingQuestion.index}
            onClose={() => {
              setEditingQuestion(null);
              dispatch(getAllQuestionPapersByCreator());
            }}
          />
        )}
        {addingImages && (
          <EditQuestionImages
            paper={addingImages.paper}
            questionIndex={addingImages.index}
            onClose={() => {
              setAddingImages(null);
              dispatch(getAllQuestionPapersByCreator());
            }}
          />
        )}
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
            Question Archives
          </h2>
          <p className="text-gray-600 dark:text-gray-500 mt-2 flex items-center gap-2">
            <Layers
              size={16}
              className="text-emerald-600 dark:text-emerald-500"
            />
            Manage your test configurations
          </p>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto flex-wrap gap-3">
          {/* Category Filter */}
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
            {localFilteredPapers.length} Records
          </span>
        </div>
      </motion.div>
      {localFilteredPapers.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-3xl"
        >
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-600">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No questions found
          </h3>
          <p className="text-gray-600 dark:text-gray-500 mb-6">
            {selectedCategoryId !== "all" ||
            selectedSubject !== "all" ||
            selectedSubcategory !== "all"
              ? "Try changing your filter selections"
              : "Upload your first question set to get started"}
          </p>
          {selectedCategoryId === "all" &&
            selectedSubject === "all" &&
            selectedSubcategory === "all" && (
              <button
                onClick={() => navigate("/admin/upload")}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Upload Questions
              </button>
            )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localFilteredPapers.map((paper) => (
            <motion.div
              variants={itemVariants}
              key={paper.id}
              layoutId={paper.id}
              className="group relative bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-xl dark:hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              <div className="relative flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20">
                      {paper.categoryName || "Uncategorized"}
                    </span>
                    {paper.subject && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/20">
                        {paper.subject}
                      </span>
                    )}
                    {paper.subcategory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/20 flex items-center gap-1">
                        <ChevronRight size={10} />
                        {paper.subcategory}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {paper.testName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-500 text-xs mt-1 line-clamp-1 font-mono">
                    {paper.title}
                  </p>
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-2 bg-gray-100 dark:bg-black/40 rounded-xl p-3 mb-5 border border-gray-200 dark:border-white/5">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <HelpCircle
                    size={14}
                    className="text-emerald-600 dark:text-emerald-500"
                  />
                  <span className="text-xs">{paper.questions.length} Qs</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Clock
                    size={14}
                    className="text-amber-600 dark:text-amber-500"
                  />
                  <span className="text-xs">{paper.makeTime} min</span>
                </div>
                <div className="col-span-2 flex items-center space-x-2 text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-white/5 pt-2 mt-1">
                  <Calendar size={14} />
                  <span className="text-[10px]">
                    Created: {formatDate(paper.createdAt)}
                  </span>
                </div>
              </div>
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => setSelectedPaperId(paper.id)}
                  className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all border border-gray-200 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500"
                >
                  View Data
                </button>
                <button
                  onClick={() => handleDeletePaper(paper.id)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all border border-red-300 dark:border-red-500/20 hover:border-red-500 dark:hover:border-red-500"
                  title="Delete Protocol"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
export default QuestionPapers;
