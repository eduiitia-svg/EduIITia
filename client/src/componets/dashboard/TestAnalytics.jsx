import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getTestAttempts } from "../../slices/dashboardSlice";
import { getAllCategories } from "../../slices/categorySlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Activity,
  Search,
  TrendingUp,
  Clock,
  Filter,
  BarChart3,
  List,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeProvider";

const TestAnalytics = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { testAttempts, loading, error } = useSelector(
    (state) => state.dashboard
  );

  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (user?.uid) {
      dispatch(getTestAttempts({ userId: user.uid, testType: "all" }));
    }
  }, [user, dispatch]);

  const handleSyncData = () => {
    if (user?.uid) {
      dispatch(getTestAttempts({ userId: user.uid, testType: "all" }));
    }
  };

  const handleClearFilters = () => {
    setSelectedTest(null);
    setSelectedCategory(null);
    setSelectedSubject(null);
    setSelectedSubcategory(null);
  };

  const COLORS = {
    primary: "#06B6D4",
    secondary: "#10B981",
    accent: "#8B5CF6",
    warn: "#F59E0B",
    danger: "#EF4444",
    slate: "#64748b",
    grid: "#334155",
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-linear-to-br from-slate-950 via-slate-900 to-black"
            : "bg-white"
        } rounded-2xl  p-6`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1
                className={`text-4xl font-bold ${
                  darkMode ? "text-white" : "text-black"
                } mb-2`}
              >
                Test Analytics
              </h1>
              <p className="text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                Deep dive into your performance metrics
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-cyan-400 text-lg font-medium">
                Loading Analytics...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-linear-to-br from-slate-950 via-slate-900 to-black"
            : "bg-white"
        } p-6`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1
                className={`text-4xl font-bold ${
                  darkMode ? "text-white" : "text-black"
                } mb-2`}
              >
                Test Analytics
              </h1>
              <p className="text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Deep dive into your performance metrics
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center h-96">
            <div
              className={`text-center ${
                darkMode
                  ? "bg-slate-900/50 border border-red-500/30"
                  : "bg-gray-200 border border-dotted border-black "
              } p-8 rounded-2xl max-w-md`}
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-red-400" />
              </div>
              <h3
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-black"
                } mb-2`}
              >
                Failed to Load Analytics
              </h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={handleSyncData}
                className="bg-linear-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!testAttempts || testAttempts.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Test Analytics
              </h1>
              <p className="text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Deep dive into your performance metrics
              </p>
            </div>

            <button
              onClick={handleSyncData}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-all border border-cyan-500/50 hover:border-cyan-400"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Data
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <BarChart3 className="w-16 h-16 mb-4 opacity-30 text-cyan-400" />
            <p className="text-xl font-light text-slate-300">
              Analytics Offline
            </p>
            <p className="text-sm mt-2 font-mono text-cyan-500/60">
              No test data available for analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  let filteredAttempts = testAttempts;

  if (selectedCategory) {
    filteredAttempts = filteredAttempts.filter(
      (attempt) => attempt.categoryName === selectedCategory
    );
  }

  if (selectedSubject) {
    filteredAttempts = filteredAttempts.filter(
      (attempt) => attempt.subject === selectedSubject
    );
  }

  if (selectedSubcategory) {
    filteredAttempts = filteredAttempts.filter(
      (attempt) => attempt.subcategory === selectedSubcategory
    );
  }

  if (selectedTest) {
    filteredAttempts = filteredAttempts.filter(
      (attempt) => attempt.testName === selectedTest
    );
  }

  const attempts = filteredAttempts;
  const tests = [...new Set(attempts.map((attempt) => attempt.testName))];

  const availableCategories = [
    ...new Set(testAttempts.map((a) => a.categoryName).filter(Boolean)),
  ];
  const availableSubjects = selectedCategory
    ? [
        ...new Set(
          testAttempts
            .filter((a) => a.categoryName === selectedCategory)
            .map((a) => a.subject)
            .filter(Boolean)
        ),
      ]
    : [];
  const availableSubcategories = selectedSubject
    ? [
        ...new Set(
          testAttempts
            .filter(
              (a) =>
                a.categoryName === selectedCategory &&
                a.subject === selectedSubject
            )
            .map((a) => a.subcategory)
            .filter(Boolean)
        ),
      ]
    : [];

  const testStats = tests.map((testName) => {
    const testAttempts = attempts.filter(
      (attempt) => attempt.testName === testName
    );
    const latestAttempt = testAttempts[testAttempts.length - 1];
    const averageScore =
      testAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
      testAttempts.length;

    const totalTime = testAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeSpent || 0),
      0
    );

    const avgSeconds = Math.round(totalTime / testAttempts.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    const remainingSeconds = avgSeconds % 60;

    return {
      name: testName,
      attempts: testAttempts.length,
      averageScore: Math.round(averageScore),
      latestScore: latestAttempt.score,
      bestScore: Math.max(...testAttempts.map((attempt) => attempt.score)),
      improvement:
        testAttempts.length > 1
          ? latestAttempt.score - testAttempts[0].score
          : 0,
      totalTime,
      avgTime: `${avgMinutes}m ${remainingSeconds}s`,
    };
  });

  const selectedTestData = selectedTest
    ? attempts.filter((attempt) => attempt.testName === selectedTest)
    : attempts.slice(0, 5);

  const latestAttempt = selectedTestData[selectedTestData.length - 1];

  const pieData = [
    { name: "Correct", value: latestAttempt?.correct || 0 },
    { name: "Incorrect", value: latestAttempt?.incorrect || 0 },
    { name: "Skipped", value: latestAttempt?.skipped || 0 },
  ];

  const accuracyData = selectedTestData.map((attempt, index) => ({
    id: index,
    date: `${new Date(attempt.date).toLocaleDateString()} #${index + 1}`,
    score: attempt.score,
    accuracy: Math.round((attempt.correct / attempt.totalQuestions) * 100),
    correct: attempt.correct,
    incorrect: attempt.incorrect,
    skipped: attempt.skipped,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`${
            darkMode
              ? "bg-slate-900/90 border-slate-700"
              : "bg-white/95 border-gray-300"
          } border p-4 rounded-xl shadow-xl backdrop-blur-md`}
        >
          <p
            className={`${
              darkMode ? "text-slate-200" : "text-gray-900"
            } font-bold mb-2 text-sm`}
          >
            {label}
          </p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs font-mono mb-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.stroke || entry.fill }}
              ></span>
              <span className={darkMode ? "text-slate-400" : "text-gray-600"}>
                {entry.name}:
              </span>
              <span
                className={`${
                  darkMode ? "text-white" : "text-gray-900"
                } font-bold`}
              >
                {entry.value}
                {entry.unit || ""}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasActiveFilters =
    selectedCategory || selectedSubject || selectedSubcategory || selectedTest;

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-black"
          : "bg-linear-to-br from-gray-50 via-white to-gray-100"
      } rounded-2xl p-6`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity
                  className={`w-5 h-5 ${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } tracking-tight`}
                >
                  Test Analytics
                </h2>
              </div>
              <p
                className={`${
                  darkMode ? "text-slate-400" : "text-gray-600"
                } text-sm`}
              >
                Deep dive into your performance metrics
              </p>
            </div>

            <button
              onClick={handleSyncData}
              className={`flex items-center gap-2 ${
                darkMode
                  ? "bg-cyan-600 hover:bg-cyan-500"
                  : "bg-cyan-600 hover:bg-cyan-700"
              } text-white px-4 py-2 rounded-xl font-medium transition-all border ${
                darkMode
                  ? "border-cyan-500/50 hover:border-cyan-400"
                  : "border-cyan-600 hover:border-cyan-700"
              } text-sm shadow-lg ${
                darkMode ? "shadow-cyan-500/20" : "shadow-cyan-600/20"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Sync Data
            </button>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800"
                : "bg-white border-gray-200 shadow-sm"
            } border rounded-2xl p-6 mb-8 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter
                className={`w-5 h-5 ${
                  darkMode ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-slate-200" : "text-gray-900"
                }`}
              >
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className={`ml-auto flex items-center gap-1 text-xs ${
                    darkMode
                      ? "text-red-400 hover:text-red-300"
                      : "text-red-600 hover:text-red-700"
                  } transition-colors`}
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative group">
                <label
                  className={`block text-xs font-medium ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  } mb-2`}
                >
                  Category
                </label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value || null);
                    setSelectedSubject(null);
                    setSelectedSubcategory(null);
                  }}
                  className={`w-full ${
                    darkMode
                      ? "bg-slate-900/50 border-slate-700 text-slate-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } border text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block p-2.5 appearance-none cursor-pointer ${
                    darkMode ? "hover:bg-slate-800/50" : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative group">
                <label
                  className={`block text-xs font-medium ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  } mb-2`}
                >
                  Subject
                </label>
                <select
                  value={selectedSubject || ""}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value || null);
                    setSelectedSubcategory(null);
                  }}
                  disabled={!selectedCategory}
                  className={`w-full ${
                    darkMode
                      ? "bg-slate-900/50 border-slate-700 text-slate-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } border text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block p-2.5 appearance-none cursor-pointer ${
                    darkMode ? "hover:bg-slate-800/50" : "hover:bg-gray-50"
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative group">
                <label
                  className={`text-xs font-medium ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  } mb-2 flex items-center gap-1`}
                >
                  <ChevronRight className="w-3 h-3" />
                  Topic
                </label>
                <select
                  value={selectedSubcategory || ""}
                  onChange={(e) =>
                    setSelectedSubcategory(e.target.value || null)
                  }
                  disabled={!selectedSubject}
                  className={`w-full ${
                    darkMode
                      ? "bg-slate-900/50 border-slate-700 text-slate-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } border text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block p-2.5 appearance-none cursor-pointer ${
                    darkMode ? "hover:bg-slate-800/50" : "hover:bg-gray-50"
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {!selectedSubject
                      ? "Select Subject First"
                      : availableSubcategories.length === 0
                      ? "No Topics Available"
                      : "All Topics"}
                  </option>
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
                {selectedSubject && availableSubcategories.length === 0 && (
                  <p
                    className={`text-xs ${
                      darkMode ? "text-amber-400/70" : "text-amber-600/80"
                    } mt-1`}
                  >
                    No topics found for this subject
                  </p>
                )}
              </div>

              <div className="relative group">
                <label
                  className={`block text-xs font-medium ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  } mb-2`}
                >
                  Test
                </label>
                <select
                  value={selectedTest || ""}
                  onChange={(e) => setSelectedTest(e.target.value || null)}
                  className={`w-full ${
                    darkMode
                      ? "bg-slate-900/50 border-slate-700 text-slate-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } border text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block p-2.5 appearance-none cursor-pointer ${
                    darkMode ? "hover:bg-slate-800/50" : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <option value="">All Tests</option>
                  {tests.map((test) => (
                    <option key={test} value={test}>
                      {test}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategory && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 ${
                      darkMode
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    } border rounded-full text-xs font-medium`}
                  >
                    {selectedCategory}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubject(null);
                        setSelectedSubcategory(null);
                      }}
                      className={
                        darkMode
                          ? "hover:text-emerald-300"
                          : "hover:text-emerald-800"
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSubject && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 ${
                      darkMode
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    } border rounded-full text-xs font-medium`}
                  >
                    {selectedSubject}
                    <button
                      onClick={() => {
                        setSelectedSubject(null);
                        setSelectedSubcategory(null);
                      }}
                      className={
                        darkMode
                          ? "hover:text-purple-300"
                          : "hover:text-purple-800"
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSubcategory && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 ${
                      darkMode
                        ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        : "bg-teal-50 text-teal-700 border-teal-200"
                    } border rounded-full text-xs font-medium`}
                  >
                    {selectedSubcategory}
                    <button
                      onClick={() => setSelectedSubcategory(null)}
                      className={
                        darkMode ? "hover:text-teal-300" : "hover:text-teal-800"
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTest && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 ${
                      darkMode
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        : "bg-cyan-50 text-cyan-700 border-cyan-200"
                    } border rounded-full text-xs font-medium`}
                  >
                    {selectedTest}
                    <button
                      onClick={() => setSelectedTest(null)}
                      className={
                        darkMode ? "hover:text-cyan-300" : "hover:text-cyan-800"
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`${
                darkMode
                  ? "bg-slate-900/40 border-cyan-500/20"
                  : "bg-white border-cyan-200 shadow-sm"
              } border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors`}
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${
                  darkMode ? "text-cyan-500" : "text-cyan-400"
                }`}
              >
                <BarChart3 className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-1 ${
                    darkMode
                      ? "group-hover:text-cyan-400"
                      : "group-hover:text-cyan-600"
                  } transition-colors`}
                >
                  {attempts.length}
                </div>
                <div
                  className={`${
                    darkMode ? "text-cyan-500/80" : "text-cyan-600"
                  } text-xs font-mono uppercase tracking-wider`}
                >
                  Total Attempts
                </div>
              </div>
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-slate-900/40 border-emerald-500/20"
                  : "bg-white border-emerald-200 shadow-sm"
              } border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors`}
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${
                  darkMode ? "text-emerald-500" : "text-emerald-400"
                }`}
              >
                <TrendingUp className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-1 ${
                    darkMode
                      ? "group-hover:text-emerald-400"
                      : "group-hover:text-emerald-600"
                  } transition-colors`}
                >
                  {attempts.length > 0
                    ? Math.round(
                        attempts.reduce(
                          (sum, attempt) => sum + attempt.score,
                          0
                        ) / attempts.length
                      )
                    : 0}
                  %
                </div>
                <div
                  className={`${
                    darkMode ? "text-emerald-500/80" : "text-emerald-600"
                  } text-xs font-mono uppercase tracking-wider`}
                >
                  Mean Accuracy
                </div>
              </div>
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-slate-900/40 border-purple-500/20"
                  : "bg-white border-purple-200 shadow-sm"
              } border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors`}
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${
                  darkMode ? "text-purple-500" : "text-purple-400"
                }`}
              >
                <Activity className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-1 ${
                    darkMode
                      ? "group-hover:text-purple-400"
                      : "group-hover:text-purple-600"
                  } transition-colors`}
                >
                  {attempts.length > 0
                    ? Math.max(...attempts.map((attempt) => attempt.score))
                    : 0}
                  %
                </div>
                <div
                  className={`${
                    darkMode ? "text-purple-500/80" : "text-purple-600"
                  } text-xs font-mono uppercase tracking-wider`}
                >
                  Peak Score
                </div>
              </div>
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-slate-900/40 border-amber-500/20"
                  : "bg-white border-amber-200 shadow-sm"
              } border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors`}
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${
                  darkMode ? "text-amber-500" : "text-amber-400"
                }`}
              >
                <List className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-1 ${
                    darkMode
                      ? "group-hover:text-amber-400"
                      : "group-hover:text-amber-600"
                  } transition-colors`}
                >
                  {tests.length}
                </div>
                <div
                  className={`${
                    darkMode ? "text-amber-500/80" : "text-amber-600"
                  } text-xs font-mono uppercase tracking-wider`}
                >
                  Unique Modules
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div
              className={`${
                darkMode
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-white border-gray-200 shadow-sm"
              } border rounded-2xl p-6 backdrop-blur-sm ${
                darkMode ? "hover:border-slate-700" : "hover:border-gray-300"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp
                  className={`w-5 h-5 ${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-slate-200" : "text-gray-900"
                  }`}
                >
                  {selectedTest
                    ? `${selectedTest} Trend`
                    : "Performance Trajectory"}
                </h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? COLORS.grid : "#e5e7eb"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={darkMode ? COLORS.slate : "#9ca3af"}
                      tick={{
                        fill: darkMode ? COLORS.slate : "#6b7280",
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: darkMode ? COLORS.grid : "#d1d5db" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke={darkMode ? COLORS.slate : "#9ca3af"}
                      tick={{
                        fill: darkMode ? COLORS.slate : "#6b7280",
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: darkMode ? COLORS.grid : "#d1d5db" }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{
                        fill: darkMode ? "#000" : "#fff",
                        stroke: COLORS.primary,
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{ r: 6, fill: COLORS.primary }}
                      name="Score (%)"
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-white border-gray-200 shadow-sm"
              } border rounded-2xl p-6 backdrop-blur-sm ${
                darkMode ? "hover:border-slate-700" : "hover:border-gray-300"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3
                  className={`w-5 h-5 ${
                    darkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-slate-200" : "text-gray-900"
                  }`}
                >
                  {selectedTest ? "Attempt Analysis" : "Global Distribution"}
                </h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={COLORS.secondary} />
                      <Cell fill={COLORS.danger} />
                      <Cell fill={COLORS.slate} />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span
                          className={`${
                            darkMode ? "text-slate-400" : "text-gray-600"
                          } ml-2 text-sm`}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/40 border-slate-800"
                : "bg-white border-gray-200 shadow-sm"
            } border rounded-2xl p-6 backdrop-blur-sm overflow-hidden`}
          >
            <div className="flex items-center gap-2 mb-6">
              <List
                className={`w-5 h-5 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-slate-200" : "text-gray-900"
                }`}
              >
                Module Summary
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode ? "border-slate-700" : "border-gray-200"
                    }`}
                  >
                    <th
                      className={`text-left py-4 px-4 text-xs font-bold ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      } uppercase tracking-wider`}
                    >
                      Test Module
                    </th>
                    <th
                      className={`text-left py-4 px-4 text-xs font-bold ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      } uppercase tracking-wider`}
                    >
                      Attempts
                    </th>
                    <th
                      className={`text-left py-4 px-4 text-xs font-bold ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      } uppercase tracking-wider`}
                    >
                      Avg. Score
                    </th>
                    <th
                      className={`text-left py-4 px-4 text-xs font-bold ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      } uppercase tracking-wider`}
                    >
                      Peak Score
                    </th>
                    <th
                      className={`text-left py-4 px-4 text-xs font-bold ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      } uppercase tracking-wider`}
                    >
                      Delta
                    </th>
                    <th
                      className={`text-left py-4 px-4 text-xs font-bold ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      } uppercase tracking-wider flex items-center gap-1`}
                    >
                      <Clock className="w-3 h-3" /> Duration
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode ? "divide-slate-800" : "divide-gray-200"
                  }`}
                >
                  {testStats.map((test, index) => (
                    <tr
                      key={test.name}
                      className={`${
                        darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                      } transition-colors group`}
                    >
                      <td
                        className={`py-4 px-4 text-sm font-medium ${
                          darkMode
                            ? "text-slate-200 group-hover:text-cyan-400"
                            : "text-gray-900 group-hover:text-cyan-600"
                        } transition-colors`}
                      >
                        {test.name}
                      </td>
                      <td
                        className={`py-4 px-4 text-sm ${
                          darkMode ? "text-slate-400" : "text-gray-600"
                        } font-mono`}
                      >
                        {test.attempts}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            test.averageScore >= 80
                              ? darkMode
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : test.averageScore >= 60
                              ? darkMode
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                              : darkMode
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-red-50 text-red-700 border-red-200"
                          } border`}
                        >
                          {test.averageScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-sm font-bold ${
                            darkMode ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          {test.bestScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            test.improvement > 0
                              ? darkMode
                                ? "text-emerald-400"
                                : "text-emerald-600"
                              : test.improvement < 0
                              ? darkMode
                                ? "text-red-400"
                                : "text-red-600"
                              : darkMode
                              ? "text-slate-500"
                              : "text-gray-400"
                          }`}
                        >
                          {test.improvement > 0 && (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {test.improvement > 0 ? "+" : ""}
                          {test.improvement}%
                        </div>
                      </td>
                      <td
                        className={`py-4 px-4 text-sm ${
                          darkMode ? "text-slate-400" : "text-gray-600"
                        } font-mono`}
                      >
                        {test.avgTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics;
