import {
  CheckCircle,
  Target,
  XCircle,
  Calendar,
  Clock,
  Award,
  ArrowLeft,
  Percent,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getTestAttemptById } from "../slices/dashboardSlice";
import Paginator from "../ui/Paginator";
import { useTheme } from "../context/ThemeProvider";

const TestAnalysis = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const [filter, setFilter] = useState("all");
  const [showExplanations, setShowExplanations] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [viewingImage, setViewingImage] = useState(null);

  const { currentAttempt, loading } = useSelector((state) => state.dashboard);
  useEffect(() => {
    if (attemptId) {
      dispatch(getTestAttemptById(attemptId));
    }
  }, [attemptId, dispatch]);

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleAllQuestions = () => {
    if (expandedQuestions.size === filteredQuestions.length) {
      setExpandedQuestions(new Set());
    } else {
      const allIndices = filteredQuestions.map((_, idx) =>
        currentAttempt.questions.indexOf(filteredQuestions[idx]),
      );
      setExpandedQuestions(new Set(allIndices));
    }
  };

  if (loading || !currentAttempt) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-black"
            : "bg-linear-to-br from-gray-50 via-white to-gray-100"
        } flex items-center justify-center rounded-2xl`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              darkMode ? "border-emerald-400" : "border-emerald-600"
            } mx-auto mb-4`}
          ></div>
          <p
            className={`${
              darkMode ? "text-emerald-400" : "text-emerald-600"
            } text-lg font-medium`}
          >
            Loading Analysis...
          </p>
        </div>
      </div>
    );
  }

  // Filter questions based on selected filter
  const filteredQuestions = currentAttempt.questions.filter((q) => {
    if (filter === "all") return true;
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return q.isAttempted && !q.isCorrect;
    if (filter === "skipped") return !q.isAttempted;
    return true;
  });

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  const getScoreColor = (score) => {
    if (darkMode) {
      if (score >= 80) return "text-emerald-400";
      if (score >= 60) return "text-yellow-400";
      return "text-red-400";
    } else {
      if (score >= 80) return "text-emerald-600";
      if (score >= 60) return "text-yellow-600";
      return "text-red-600";
    }
  };

  const getScoreBadge = (score) => {
    if (darkMode) {
      if (score >= 80)
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      if (score >= 60)
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      return "bg-red-500/20 text-red-300 border-red-500/30";
    } else {
      if (score >= 80)
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      if (score >= 60) return "bg-yellow-50 text-yellow-700 border-yellow-200";
      return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getPerformanceText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    return "Needs Improvement";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-black text-slate-200"
          : "bg-linear-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      {darkMode && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 ${
              darkMode
                ? "text-slate-400 hover:text-emerald-400"
                : "text-gray-600 hover:text-emerald-600"
            } transition-colors mb-6 group`}
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800"
                : "bg-white border-gray-200 shadow-sm"
            } border rounded-2xl p-6 backdrop-blur-sm`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div
                className={`w-20 h-20 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center ${
                  darkMode ? "text-black" : "text-white"
                } font-bold text-3xl shadow-lg shadow-emerald-500/30`}
              >
                <Percent size={25} />
              </div>

              <div className="flex-1">
                <h1
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-2`}
                >
                  {currentAttempt.testName}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className={`px-3 py-1 border rounded-full text-sm font-medium ${getScoreBadge(
                      currentAttempt.score,
                    )}`}
                  >
                    {getPerformanceText(currentAttempt.score)}
                  </span>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    {currentAttempt.correctAnswers}/
                    {currentAttempt.totalQuestions} Correct Answers
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-5xl font-bold ${getScoreColor(
                    currentAttempt.score,
                  )} drop-shadow-lg`}
                >
                  {currentAttempt.score}%
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-slate-500" : "text-gray-500"
                  } mt-1`}
                >
                  Final Score
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800 hover:border-emerald-500/30"
                : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
            } border rounded-xl p-5 backdrop-blur-sm transition-all`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target
                className={darkMode ? "text-emerald-500" : "text-emerald-600"}
                size={24}
              />
              <span
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                } uppercase tracking-wider`}
              >
                Score
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${getScoreColor(currentAttempt.score)}`}
            >
              {currentAttempt.score}%
            </p>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800 hover:border-emerald-500/30"
                : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
            } border rounded-xl p-5 backdrop-blur-sm transition-all`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Award
                className={darkMode ? "text-emerald-500" : "text-emerald-600"}
                size={24}
              />
              <span
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                } uppercase tracking-wider`}
              >
                Questions
              </span>
            </div>
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {currentAttempt.totalQuestions}
            </p>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800 hover:border-emerald-500/30"
                : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
            } border rounded-xl p-5 backdrop-blur-sm transition-all`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock
                className={darkMode ? "text-emerald-500" : "text-emerald-600"}
                size={24}
              />
              <span
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                } uppercase tracking-wider`}
              >
                Test Type
              </span>
            </div>
            <p
              className={`text-lg font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              } truncate`}
            >
              {currentAttempt.markingScheme}
            </p>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800 hover:border-emerald-500/30"
                : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
            } border rounded-xl p-5 backdrop-blur-sm transition-all`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar
                className={darkMode ? "text-emerald-500" : "text-emerald-600"}
                size={24}
              />
              <span
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                } uppercase tracking-wider`}
              >
                Completed
              </span>
            </div>
            <p
              className={`text-sm font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {formatDate(currentAttempt.startedAt)}
            </p>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${
            darkMode
              ? "bg-slate-900/40 border-slate-800"
              : "bg-white border-gray-200 shadow-sm"
          } border rounded-2xl p-6 backdrop-blur-sm mb-8`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter
                className={`w-5 h-5 ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                }`}
              />
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "all"
                    ? darkMode
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-cyan-100 text-cyan-700 border border-cyan-200"
                    : darkMode
                      ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                All ({currentAttempt.totalQuestions})
              </button>
              <button
                onClick={() => {
                  setFilter("correct");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "correct"
                    ? darkMode
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : darkMode
                      ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                Correct ({currentAttempt.correctAnswers})
              </button>
              <button
                onClick={() => {
                  setFilter("incorrect");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "incorrect"
                    ? darkMode
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-red-100 text-red-700 border border-red-200"
                    : darkMode
                      ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                Incorrect ({currentAttempt.incorrectAnswers})
              </button>
              <button
                onClick={() => {
                  setFilter("skipped");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "skipped"
                    ? darkMode
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                    : darkMode
                      ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                Skipped ({currentAttempt.skippedAnswers})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  darkMode
                    ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {showExplanations ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showExplanations ? "Hide" : "Show"} Explanations
              </button>

              <button
                onClick={toggleAllQuestions}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  darkMode
                    ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {expandedQuestions.size === filteredQuestions.length ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Collapse All
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Expand All
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Detailed Analysis
            </h2>
            <span
              className={`text-sm ${
                darkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredQuestions.length)} of{" "}
              {filteredQuestions.length}
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div
              className={`text-center py-20 rounded-2xl border ${
                darkMode
                  ? "bg-slate-900/30 border-slate-800"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <AlertCircle
                className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-slate-600" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                No questions match this filter
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentQuestions.map((question, index) => {
                const originalIndex =
                  currentAttempt.questions.indexOf(question);
                const isExpanded = expandedQuestions.has(originalIndex);

                return (
                  <motion.div
                    key={originalIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${
                      darkMode ? "bg-slate-900/40" : "bg-white shadow-sm"
                    } border rounded-2xl backdrop-blur-sm transition-all ${
                      !question.isAttempted
                        ? darkMode
                          ? "border-yellow-500/20 hover:border-yellow-500/40"
                          : "border-yellow-200 hover:border-yellow-300"
                        : question.isCorrect
                          ? darkMode
                            ? "border-emerald-500/20 hover:border-emerald-500/40"
                            : "border-emerald-200 hover:border-emerald-300"
                          : darkMode
                            ? "border-red-500/20 hover:border-red-500/40"
                            : "border-red-200 hover:border-red-300"
                    }`}
                  >
                    {/* Question Header - Clickable */}
                    <button
                      onClick={() => toggleQuestion(originalIndex)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span
                            className={`${
                              darkMode ? "text-emerald-500" : "text-emerald-600"
                            } font-mono text-sm mb-2 block`}
                          >
                            QUESTION{" "}
                            {String(originalIndex + 1).padStart(2, "0")}
                          </span>
                          <p
                            className={`${
                              darkMode ? "text-slate-200" : "text-gray-900"
                            } font-medium leading-relaxed text-lg`}
                          >
                            {question.questionText}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span
                              className={`px-3 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 ${
                                !question.isAttempted
                                  ? darkMode
                                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : question.isCorrect
                                    ? darkMode
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : darkMode
                                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                                      : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {!question.isAttempted ? (
                                <>
                                  <AlertCircle size={16} /> Skipped
                                </>
                              ) : question.isCorrect ? (
                                <>
                                  <CheckCircle size={16} /> Correct
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} /> Incorrect
                                </>
                              )}
                            </span>

                            {question.questionLevel && (
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  question.questionLevel === "Easy"
                                    ? darkMode
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : question.questionLevel === "Medium"
                                      ? darkMode
                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                      : darkMode
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {question.questionLevel}
                              </span>
                            )}

                            {question.images && question.images.length > 0 && (
                              <span
                                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                                  darkMode
                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}
                              >
                                <ImageIcon className="w-3 h-3" />{" "}
                                {question.images.length} Image
                                {question.images.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronDown
                          className={`w-5 h-5 transition-transform shrink-0 ${
                            darkMode ? "text-slate-400" : "text-gray-400"
                          } ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Question Details (Expanded) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`px-6 pb-6 border-t ${
                            darkMode ? "border-slate-800" : "border-gray-200"
                          }`}
                        >
                          {/* Question Images */}
                          {question.images && question.images.length > 0 && (
                            <div className="mt-6 mb-6">
                              <h4
                                className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                                  darkMode ? "text-slate-300" : "text-gray-700"
                                }`}
                              >
                                <ImageIcon className="w-4 h-4" />
                                Question Images
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {question.images.map((imageUrl, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className={`relative group overflow-hidden rounded-xl border cursor-pointer aspect-square ${
                                      darkMode
                                        ? "bg-slate-800 border-slate-700 hover:border-purple-500/50"
                                        : "bg-gray-100 border-gray-200 hover:border-purple-300"
                                    }`}
                                    onClick={() =>
                                      setViewingImage({
                                        url: imageUrl,
                                        questionIndex: originalIndex,
                                        imageIndex: imgIdx,
                                      })
                                    }
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Question ${originalIndex + 1} - Image ${
                                        imgIdx + 1
                                      }`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-5">
                            <div
                              className={`p-4 rounded-xl border transition-all ${
                                !question.isAttempted
                                  ? darkMode
                                    ? "bg-yellow-500/5 border-yellow-500/20"
                                    : "bg-yellow-50 border-yellow-200"
                                  : question.isCorrect
                                    ? darkMode
                                      ? "bg-emerald-500/5 border-emerald-500/20"
                                      : "bg-emerald-50 border-emerald-200"
                                    : darkMode
                                      ? "bg-red-500/5 border-red-500/20"
                                      : "bg-red-50 border-red-200"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p
                                    className={`text-xs ${
                                      darkMode
                                        ? "text-slate-400"
                                        : "text-gray-600"
                                    } mb-2 uppercase tracking-wider font-semibold`}
                                  >
                                    Your Answer
                                  </p>
                                  <p
                                    className={`text-base font-medium ${
                                      !question.isAttempted
                                        ? darkMode
                                          ? "text-yellow-300"
                                          : "text-yellow-700"
                                        : question.isCorrect
                                          ? darkMode
                                            ? "text-emerald-300"
                                            : "text-emerald-700"
                                          : darkMode
                                            ? "text-red-300"
                                            : "text-red-700"
                                    }`}
                                  >
                                    {!question.isAttempted
                                      ? "Not Attempted"
                                      : question.selectedAnswer ||
                                        "Not Answered"}
                                  </p>
                                </div>
                                {!question.isAttempted ? (
                                  <AlertCircle
                                    size={20}
                                    className={
                                      darkMode
                                        ? "text-yellow-400"
                                        : "text-yellow-600"
                                    }
                                  />
                                ) : (
                                  !question.isCorrect && (
                                    <XCircle
                                      size={20}
                                      className={
                                        darkMode
                                          ? "text-red-400"
                                          : "text-red-600"
                                      }
                                    />
                                  )
                                )}
                              </div>
                            </div>

                            <div
                              className={`p-4 rounded-xl ${
                                darkMode
                                  ? "bg-emerald-500/5 border-emerald-500/20"
                                  : "bg-emerald-50 border-emerald-200"
                              } border`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p
                                    className={`text-xs ${
                                      darkMode
                                        ? "text-emerald-400/80"
                                        : "text-emerald-700"
                                    } mb-2 uppercase tracking-wider font-semibold`}
                                  >
                                    Correct Answer
                                  </p>
                                  <p
                                    className={`text-base font-medium ${
                                      darkMode
                                        ? "text-emerald-300"
                                        : "text-emerald-700"
                                    }`}
                                  >
                                    {question.correctAnswer}
                                  </p>
                                </div>
                                <CheckCircle
                                  size={20}
                                  className={
                                    darkMode
                                      ? "text-emerald-400"
                                      : "text-emerald-600"
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {showExplanations && question.explanation && (
                            <div
                              className={`p-5 rounded-xl border ${
                                darkMode
                                  ? "bg-blue-500/10 border-blue-500/30"
                                  : "bg-blue-50 border-blue-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <BookOpen
                                  className={`w-5 h-5 mt-0.5 shrink-0 ${
                                    darkMode ? "text-blue-400" : "text-blue-600"
                                  }`}
                                />
                                <div className="flex-1">
                                  <h4
                                    className={`text-sm font-semibold mb-2 ${
                                      darkMode
                                        ? "text-blue-400"
                                        : "text-blue-700"
                                    }`}
                                  >
                                    Explanation
                                  </h4>
                                  <p
                                    className={`text-sm leading-relaxed ${
                                      darkMode
                                        ? "text-slate-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {question.explanation}
                                  </p>

                                  {question.explanationImages &&
                                    question.explanationImages.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/20">
                                        <p
                                          className={`text-xs font-semibold mb-3 flex items-center gap-1 ${
                                            darkMode
                                              ? "text-blue-400"
                                              : "text-blue-600"
                                          }`}
                                        >
                                          <ImageIcon className="w-3 h-3" />
                                          Explanation Images (
                                          {question.explanationImages.length})
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                          {question.explanationImages.map(
                                            (imageUrl, imgIdx) => (
                                              <div
                                                key={imgIdx}
                                                className={`relative group overflow-hidden rounded-xl border cursor-pointer aspect-square ${
                                                  darkMode
                                                    ? "bg-slate-800 border-blue-500/30 hover:border-blue-400/60"
                                                    : "bg-blue-100/50 border-blue-200 hover:border-blue-400"
                                                }`}
                                                onClick={() =>
                                                  setViewingImage({
                                                    url: imageUrl,
                                                    questionIndex:
                                                      originalIndex,
                                                    imageIndex: imgIdx,
                                                    type: "explanation",
                                                  })
                                                }
                                              >
                                                <img
                                                  src={imageUrl}
                                                  alt={`Explanation ${originalIndex + 1} - Image ${imgIdx + 1}`}
                                                  className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                  <Eye className="w-5 h-5 text-white" />
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
                          {showExplanations && !question.explanation && (
                            <div
                              className={`p-4 rounded-xl text-center ${
                                darkMode
                                  ? "bg-slate-800/30 text-slate-500"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <p className="text-sm">
                                No explanation available for this question.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredQuestions.length}
                itemsPerPage={questionsPerPage}
                onPageChange={setCurrentPage}
                maxVisiblePages={5}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl ${
                darkMode ? "bg-slate-900" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`flex items-center justify-between px-4 py-3 border-b ${
                  darkMode
                    ? "bg-black/40 border-slate-700"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {viewingImage.type === "explanation" ? (
                    <BookOpen
                      className={darkMode ? "text-blue-400" : "text-blue-600"}
                      size={18}
                    />
                  ) : (
                    <ImageIcon
                      className={
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }
                      size={18}
                    />
                  )}
                  <h3
                    className={`font-semibold text-sm ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {viewingImage.type === "explanation"
                      ? "Explanation"
                      : "Question"}{" "}
                    Image {viewingImage.imageIndex + 1}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingImage(null)}
                  className={`p-1.5 rounded-lg transition-all ${
                    darkMode
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className={`flex items-center justify-center p-6 min-h-[300px] ${
                  darkMode ? "bg-slate-950" : "bg-gray-50"
                }`}
              >
                <img
                  src={viewingImage.url}
                  alt="Full size"
                  className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-md"
                />
              </div>

              {/* Footer */}
              <div
                className={`px-4 py-2.5 border-t ${
                  darkMode
                    ? "bg-black/40 border-slate-700"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <p
                  className={`text-xs text-center ${
                    darkMode ? "text-slate-500" : "text-gray-500"
                  }`}
                >
                  Click outside to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestAnalysis;
