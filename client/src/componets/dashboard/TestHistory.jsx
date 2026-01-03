import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Target,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getTestHistory } from "../../slices/dashboardSlice";
import Paginator from "../../ui/Paginator";
import { useNavigate } from "react-router";
import { useTheme } from "../../context/ThemeProvider";

const TestHistory = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 2;
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { testHistory, loading, error } = useSelector(
    (state) => state.dashboard
  );
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  useEffect(() => {
    if (user?.uid) {
      fetchTestHistory();
    }
  }, [user]);

  const fetchTestHistory = () => {
    if (user?.uid) {
      dispatch(getTestHistory({ userId: user.uid, testType: "all" }));
    }
  };

  const stats = {
    totalTests: testHistory?.length || 0,
    averageScore:
      testHistory && testHistory.length > 0
        ? Math.round(
            testHistory.reduce((acc, test) => acc + test.score, 0) /
              testHistory.length
          )
        : 0,
    bestScore:
      testHistory && testHistory.length > 0
        ? Math.max(...testHistory.map((test) => test.score))
        : 0,
  };

  const totalPages = Math.ceil((testHistory?.length || 0) / testsPerPage);
  const startIndex = (currentPage - 1) * testsPerPage;
  const endIndex = startIndex + testsPerPage;
  const currentTests = testHistory?.slice(startIndex, endIndex) || [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (startedAt, submittedAt) => {
    if (!submittedAt) return "Not completed";

    const start = startedAt.toDate ? startedAt.toDate() : new Date(startedAt);
    const end = submittedAt.toDate
      ? submittedAt.toDate()
      : new Date(submittedAt);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeStyles = (score) => {
    if (score >= 80)
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 60)
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const getPerformanceText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-black" : "bg-gray-50"
        } flex items-center justify-center rounded-2xl`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4 shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
          <p className="text-teal-400 text-lg font-medium tracking-wide animate-pulse">
            Loading Test History...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-black" : "bg-gray-50"
        } flex items-center justify-center p-4`}
      >
        <div className="text-center bg-slate-900/50 border border-red-500/30 p-8 rounded-2xl backdrop-blur-sm max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Connection Interrupted
          </h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchTestHistory}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-200 mx-auto w-full font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-in-out ${
        darkMode ? "bg-black text-slate-200" : "bg-slate-50 text-slate-900"
      } font-sans selection:bg-teal-500/30 flex flex-col rounded-2xl overflow-hidden relative`}
    >
      {/* Background Ambient Glows */}
      <div
        className={`fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${
          darkMode ? "bg-emerald-600/20" : "bg-emerald-400/20"
        }`}
      />
      <div
        className={`fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${
          darkMode ? "bg-teal-600/10" : "bg-teal-400/20"
        }`}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:py-12 w-full flex flex-col flex-1">
        {/* Header Section */}
        <div
          className={`flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8 transition-colors duration-300 ${
            darkMode ? "border-slate-800/60" : "border-slate-200"
          }`}
        >
          <div>
            <h1
              className={`text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r tracking-tight ${
                darkMode
                  ? "from-white to-slate-400"
                  : "from-slate-900 to-slate-600"
              }`}
            >
              Test History
            </h1>
            <p
              className={`mt-3 text-lg font-light tracking-wide ${
                darkMode ? "text-teal-400/80" : "text-teal-600"
              }`}
            >
              Analyze your performance metrics and decentralized learning
              progress.
            </p>
          </div>

          {/* Stats Box */}
          <div
            className={`grid grid-cols-3 gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-all duration-300 ${
              darkMode
                ? "bg-slate-900/40 border-slate-700/50"
                : "bg-white/80 border-white shadow-slate-200"
            }`}
          >
            <div
              className={`text-center px-4 border-r ${
                darkMode ? "border-slate-700/50" : "border-slate-200"
              }`}
            >
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Tests
              </p>
              <p
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {stats.totalTests}
              </p>
            </div>
            <div
              className={`text-center px-4 border-r ${
                darkMode ? "border-slate-700/50" : "border-slate-200"
              }`}
            >
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Avg Score
              </p>
              <p
                className={`text-xl font-bold ${getScoreColor(
                  stats.averageScore
                )}`}
              >
                {stats.averageScore}%
              </p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Best
              </p>
              <p
                className={`text-xl font-bold ${
                  darkMode ? "text-teal-400" : "text-teal-600"
                }`}
              >
                {stats.bestScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {testHistory?.length === 0 || !testHistory ? (
          /* Empty State */
          <div
            className={`text-center py-20 rounded-3xl border backdrop-blur-sm flex-1 flex items-center justify-center mt-10 transition-colors ${
              darkMode
                ? "bg-slate-900/30 border-slate-800"
                : "bg-white/60 border-slate-200 shadow-sm"
            }`}
          >
            <div>
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${
                  darkMode ? "bg-slate-800/50" : "bg-white text-teal-600"
                }`}
              >
                <FileText
                  className={`w-10 h-10 ${
                    darkMode ? "text-slate-500" : "text-teal-500"
                  }`}
                />
              </div>
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                No Data Available
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Initiate your first deployment to generate performance history.
              </p>
            </div>
          </div>
        ) : (
          /* Test List */
          <div className="flex flex-col flex-1 mt-10">
            <div className="grid gap-5 flex-1">
              {currentTests.map((attempt) => (
                <div
                  key={attempt.attemptId}
                  className={`group relative border transition-all duration-300 rounded-2xl backdrop-blur-md hover:-translate-y-1 ${
                    darkMode
                      ? "bg-slate-900/40 border-slate-800 hover:border-teal-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
                      : "bg-white border-slate-100 hover:border-teal-200 shadow-sm hover:shadow-xl hover:shadow-teal-900/5"
                  }`}
                >
                  <div className="p-6 lg:p-7">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Left Side: Test Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <h3
                            className={`text-xl lg:text-2xl font-bold transition-colors ${
                              darkMode
                                ? "text-white group-hover:text-teal-400"
                                : "text-slate-800 group-hover:text-teal-600"
                            }`}
                          >
                            {attempt.testName}
                          </h3>
                          <span
                            className={`px-3 py-1 border rounded-full text-xs font-semibold uppercase tracking-wider ${
                              darkMode
                                ? "bg-slate-800 border-slate-700 text-slate-300"
                                : "bg-slate-100 border-slate-200 text-slate-600"
                            }`}
                          >
                            {attempt.testType?.replace("_", " ") || "General"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 lg:gap-6 text-sm text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar
                              className={`w-4 h-4 ${
                                darkMode ? "text-teal-500" : "text-teal-600"
                              }`}
                            />
                            <span>{formatDate(attempt.startedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock
                              className={`w-4 h-4 ${
                                darkMode ? "text-teal-500" : "text-teal-600"
                              }`}
                            />
                            <span>
                              {calculateDuration(
                                attempt.startedAt,
                                attempt.submittedAt
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target
                              className={`w-4 h-4 ${
                                darkMode ? "text-teal-500" : "text-teal-600"
                              }`}
                            />
                            <span>{attempt.markingScheme}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Score & Action */}
                      <div
                        className={`flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 ${
                          darkMode ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
                        <div className="text-right">
                          <div
                            className={`text-4xl font-bold ${getScoreColor(
                              attempt.score
                            )} drop-shadow-sm`}
                          >
                            {attempt.score}%
                          </div>
                          <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold mt-1">
                            Score Efficiency
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/test-analysis/${attempt.attemptId}`)
                          }
                          className={`h-12 w-12 flex items-center justify-center rounded-full border transition-all duration-300 ${
                            darkMode
                              ? "bg-slate-800/50 text-teal-400 border-slate-700 hover:bg-teal-500 hover:text-black hover:border-teal-500"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-teal-500 hover:text-white hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/30"
                          }`}
                        >
                          <ChevronDown className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Footer Badges */}
                    <div className="mt-6 flex items-center gap-3">
                      <span
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${getScoreBadgeStyles(
                          attempt.score
                        )}`}
                      >
                        {attempt.score >= 70 ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {getPerformanceText(attempt.score)}
                      </span>

                      {!attempt.submittedAt && (
                        <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Incomplete
                        </span>
                      )}

                      <span className="ml-auto text-sm text-slate-500 font-mono font-medium">
                        {attempt.correctAnswers}/{attempt.totalQuestions}{" "}
                        Correct
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={testHistory?.length || 0}
                itemsPerPage={testsPerPage}
                onPageChange={setCurrentPage}
                maxVisiblePages={7}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistory;
