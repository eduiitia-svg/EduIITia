import {
  CheckCircle,
  Target,
  XCircle,
  Calendar,
  Clock,
  Award,
  ArrowLeft,
  Percent,
} from "lucide-react";
import { motion } from "framer-motion";
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

  const { currentAttempt, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (attemptId) {
      dispatch(getTestAttemptById(attemptId));
    }
  }, [attemptId, dispatch]);

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

  const totalPages = Math.ceil(
    (currentAttempt.questions?.length || 0) / questionsPerPage
  );
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions =
    currentAttempt.questions?.slice(startIndex, endIndex) || [];

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
                      currentAttempt.score
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
                    currentAttempt.score
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
            <p className={`text-3xl font-bold ${getScoreColor(currentAttempt.score)}`}>
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
              {Math.min(endIndex, currentAttempt.questions?.length || 0)} of{" "}
              {currentAttempt.questions?.length || 0}
            </span>
          </div>

          <div className="space-y-6">
            {currentQuestions.map((question, index) => {
              const globalIndex = startIndex + index;
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    darkMode ? "bg-slate-900/40" : "bg-white shadow-sm"
                  } border rounded-2xl p-6 backdrop-blur-sm transition-all hover:shadow-lg ${
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
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <div className="flex-1">
                      <span
                        className={`${
                          darkMode ? "text-emerald-500" : "text-emerald-600"
                        } font-mono text-sm mb-2 block`}
                      >
                        QUESTION {String(globalIndex + 1).padStart(2, "0")}
                      </span>
                      <p
                        className={`${
                          darkMode ? "text-slate-200" : "text-gray-900"
                        } font-medium leading-relaxed text-lg`}
                      >
                        {question.questionText}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 whitespace-nowrap ${
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
                          <XCircle size={16} /> Skipped
                        </>
                      ) : question.isCorrect ? (
                        <>
                          <CheckCircle size={16} /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle size={16} /> Wrong
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
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
                              darkMode ? "text-slate-400" : "text-gray-600"
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
                              : question.selectedAnswer || "Not Answered"}
                          </p>
                        </div>
                        {!question.isAttempted ? (
                          <XCircle
                            size={20}
                            className={
                              darkMode ? "text-yellow-400" : "text-yellow-600"
                            }
                          />
                        ) : (
                          !question.isCorrect && (
                            <XCircle
                              size={20}
                              className={darkMode ? "text-red-400" : "text-red-600"}
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
                              darkMode ? "text-emerald-300" : "text-emerald-700"
                            }`}
                          >
                            {question.correctAnswer}
                          </p>
                        </div>
                        <CheckCircle
                          size={20}
                          className={
                            darkMode ? "text-emerald-400" : "text-emerald-600"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {question.explanation && (
                    <div
                      className={`p-4 rounded-xl ${
                        darkMode
                          ? "bg-slate-800/50 border-slate-700"
                          : "bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <p
                        className={`text-xs ${
                          darkMode ? "text-slate-400" : "text-gray-600"
                        } mb-2 uppercase tracking-wider font-semibold`}
                      >
                        Explanation
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-slate-300" : "text-gray-700"
                        } leading-relaxed`}
                      >
                        {question.explanation || "No explanation provided"}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={currentAttempt.questions?.length || 0}
                itemsPerPage={questionsPerPage}
                onPageChange={setCurrentPage}
                maxVisiblePages={5}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestAnalysis;