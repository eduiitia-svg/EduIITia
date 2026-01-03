import React, { useRef, useEffect, useContext, useState } from "react";
import { useLeaderboard } from "../../context/LeaderboardContext";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../slices/categorySlice";
import { useNavigate } from "react-router-dom";
import { TestContext } from "../../context/TestContext";
import {
  Trophy,
  Target,
  Users,
  Crown,
  Activity,
  ArrowRight,
  Loader,
  Filter,
  X,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeProvider";

const Leaderboard = () => {
  const {
    tests,
    selectedTest,
    leaderboard,
    loading,
    handleTestSelect,
    refetchTests,
    refetchStats,
  } = useLeaderboard();
  const { startTest, setTestnav } = useContext(TestContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const leaderboardRef = useRef(null);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { categories } = useSelector((state) => state.category);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const {theme} = useTheme()
  const darkMode = theme === "dark"

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTest && leaderboardRef.current) {
      setTimeout(() => {
        leaderboardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [selectedTest]);

  const getSubjectsForCategory = () => {
    if (!selectedCategory) return [];
    const category = categories.find((cat) => cat.name === selectedCategory);
    if (!category || !category.subjects) return [];

    return category.subjects.map((subj) =>
      typeof subj === "string" ? subj : subj.name
    );
  };

  const getSubcategoriesForSubject = () => {
    if (!selectedCategory || !selectedSubject) return [];
    const category = categories.find((cat) => cat.name === selectedCategory);
    if (!category || !category.subjects) return [];

    const subject = category.subjects.find(
      (subj) =>
        (typeof subj === "string" ? subj : subj.name) === selectedSubject
    );

    if (!subject || typeof subject === "string") return [];
    return subject.subcategories || [];
  };

  const availableCategories = categories.map((cat) => cat.name);
  const availableSubjects = getSubjectsForCategory();
  const availableSubcategories = getSubcategoriesForSubject();

  let filteredTests = tests.filter((test) => test.hasAttempts);

  if (selectedCategory) {
    filteredTests = filteredTests.filter(
      (test) => test.categoryName === selectedCategory
    );
  }
  if (selectedSubject) {
    filteredTests = filteredTests.filter(
      (test) => test.subject === selectedSubject
    );
  }
  if (selectedSubcategory) {
    filteredTests = filteredTests.filter(
      (test) => test.subcategory === selectedSubcategory
    );
  }

  const currentUserEntry = leaderboard.find((entry) => entry.isCurrentUser);

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubject(null);
    setSelectedSubcategory(null);
  };

  const hasActiveFilters =
    selectedCategory || selectedSubject || selectedSubcategory;

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await dispatch(getAllCategories()).unwrap();

      await refetchTests();

      if (refetchStats) {
        await refetchStats();
      }

      toast.success("Data synced successfully!");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync data");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartTest = async () => {
    if (!selectedTest) {
      toast.error("Please select a test first");
      return;
    }

    setIsStartingTest(true);
    try {
      const testId = selectedTest.testId;
      const result = await startTest(testId);

      toast.success(`${selectedTest.testName} started!`);
      setTestnav(true);
      navigate(`/test/${selectedTest?.testId}`);
    } catch (error) {
      console.error("❌ Error starting test:", error);
      toast.error(error || "Failed to start test. Please try again.");
    } finally {
      setIsStartingTest(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-black"
          : "bg-linear-to-br from-gray-50 via-white to-gray-100"
      } ${
        darkMode ? "text-slate-200" : "text-gray-900"
      } p-4 md:p-8 relative overflow-hidden`}
    >
      <div
        className={`absolute top-0 left-1/4 w-96 h-96 ${
          darkMode ? "bg-teal-600/10" : "bg-teal-300/20"
        } rounded-full blur-3xl -z-10 animate-pulse`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-96 h-96 ${
          darkMode ? "bg-emerald-600/10" : "bg-emerald-300/20"
        } rounded-full blur-3xl -z-10 animate-pulse`}
      />
      <div
        className={`absolute top-1/2 left-1/2 w-96 h-96 ${
          darkMode ? "bg-cyan-600/5" : "bg-cyan-200/10"
        } rounded-full blur-3xl -z-10`}
      />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
        <div className="animate-in fade-in duration-500">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b ${
              darkMode ? "border-white/5" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 ${
                  darkMode
                    ? "bg-teal-500/10 border-teal-500/20"
                    : "bg-teal-50 border-teal-200"
                } rounded-xl border`}
              >
                <Trophy
                  className={`w-6 h-6 ${
                    darkMode ? "text-teal-400" : "text-teal-600"
                  }`}
                />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Global Leaderboard
                </h1>
                <p
                  className={`${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  } text-xs`}
                >
                  Compete across the decentralized network
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className={`flex items-center gap-2 ${
                darkMode
                  ? "bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-cyan-500/20"
                  : "bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/30"
              } text-white px-4 py-2 rounded-lg font-medium transition-all text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync Data"}
            </button>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-slate-900/50 border-slate-800/50"
                : "bg-white border-gray-200"
            } border rounded-xl p-4 mt-4 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter
                  className={`w-4 h-4 ${
                    darkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
                <h3
                  className={`text-sm font-semibold ${
                    darkMode ? "text-slate-200" : "text-gray-900"
                  }`}
                >
                  Filters
                </h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className={`flex items-center gap-1 text-xs ${
                    darkMode
                      ? "text-red-400 hover:text-red-300"
                      : "text-red-600 hover:text-red-700"
                  } transition-colors`}
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selectedCategory || ""}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || null);
                  setSelectedSubject(null);
                  setSelectedSubcategory(null);
                }}
                className={`w-full ${
                  darkMode
                    ? "bg-slate-900/50 border-slate-700/50 text-slate-200"
                    : "bg-white border-gray-300 text-gray-900"
                } border text-xs rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 p-2 appearance-none cursor-pointer ${
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

              <select
                value={selectedSubject || ""}
                onChange={(e) => {
                  setSelectedSubject(e.target.value || null);
                  setSelectedSubcategory(null);
                }}
                disabled={!selectedCategory}
                className={`w-full ${
                  darkMode
                    ? "bg-slate-900/50 border-slate-700/50 text-slate-200"
                    : "bg-white border-gray-300 text-gray-900"
                } border text-xs rounded-lg focus:ring-2 focus:ring-cyan-500/50 p-2 disabled:opacity-50`}
              >
                <option value="">All Subjects</option>
                {availableSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>

              <select
                value={selectedSubcategory || ""}
                onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                disabled={!selectedSubject}
                className={`w-full ${
                  darkMode
                    ? "bg-slate-900/50 border-slate-700/50 text-slate-200"
                    : "bg-white border-gray-300 text-gray-900"
                } border text-xs rounded-lg focus:ring-2 focus:ring-cyan-500/50 p-2 disabled:opacity-50`}
              >
                <option value="">
                  {!selectedSubject
                    ? "Select Subject First"
                    : availableSubcategories.length === 0
                    ? "No Topics"
                    : "All Topics"}
                </option>
                {availableSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategory && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 ${
                      darkMode
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    } border rounded-md text-xs`}
                  >
                    {selectedCategory}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubject(null);
                        setSelectedSubcategory(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSubject && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 ${
                      darkMode
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    } border rounded-md text-xs`}
                  >
                    {selectedSubject}
                    <button
                      onClick={() => {
                        setSelectedSubject(null);
                        setSelectedSubcategory(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSubcategory && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 ${
                      darkMode
                        ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        : "bg-teal-50 text-teal-700 border-teal-200"
                    } border rounded-md text-xs`}
                  >
                    {selectedSubcategory}
                    <button onClick={() => setSelectedSubcategory(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-4">
            {selectedTest &&
              selectedTest.hasAttempts &&
              selectedTest.userHasAttempted &&
              currentUserEntry && (
                <div
                  className={`${
                    darkMode
                      ? "bg-linear-to-br from-slate-900/80 to-slate-900/40 border-slate-700/50"
                      : "bg-linear-to-br from-white to-gray-50 border-gray-200"
                  } backdrop-blur-md border rounded-xl p-5 relative overflow-hidden group`}
                >
                  <div
                    className={`absolute -top-10 -right-10 w-32 h-32 ${
                      darkMode
                        ? "bg-linear-to-br from-teal-500/20 to-cyan-500/20"
                        : "bg-linear-to-br from-teal-200/40 to-cyan-200/40"
                    } rounded-full blur-2xl`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2
                        className={`text-sm font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        } uppercase tracking-wider flex items-center gap-2`}
                      >
                        <Zap
                          className={`w-4 h-4 ${
                            darkMode ? "text-teal-400" : "text-teal-600"
                          }`}
                        />
                        Your Performance
                      </h2>
                      <div
                        className={`px-2 py-1 ${
                          darkMode
                            ? "bg-teal-500/20 border-teal-500/30"
                            : "bg-teal-50 border-teal-300"
                        } border rounded-md`}
                      >
                        <span
                          className={`text-xs font-bold ${
                            darkMode ? "text-teal-300" : "text-teal-700"
                          }`}
                        >
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        className={`${
                          darkMode
                            ? "bg-linear-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                            : "bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-300"
                        } border rounded-lg p-3 relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 opacity-10">
                          <Crown className="w-12 h-12 text-yellow-500" />
                        </div>
                        <div className="relative">
                          <div
                            className={`text-[10px] ${
                              darkMode
                                ? "text-yellow-300/70"
                                : "text-yellow-700"
                            } uppercase tracking-wider font-bold mb-1`}
                          >
                            Rank
                          </div>
                          <div
                            className={`text-3xl font-black ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {currentUserEntry.rank}
                          </div>
                          <div
                            className={`text-[10px] ${
                              darkMode
                                ? "text-yellow-300/50"
                                : "text-yellow-600"
                            } mt-1`}
                          >
                            of {selectedTest.totalParticipants}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${
                          darkMode
                            ? "bg-linear-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20"
                            : "bg-linear-to-br from-teal-50 to-cyan-50 border-teal-300"
                        } border rounded-lg p-3 relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 opacity-10">
                          <Target className="w-12 h-12 text-teal-500" />
                        </div>
                        <div className="relative">
                          <div
                            className={`text-[10px] ${
                              darkMode ? "text-teal-300/70" : "text-teal-700"
                            } uppercase tracking-wider font-bold mb-1`}
                          >
                            Score
                          </div>
                          <div
                            className={`text-3xl font-black ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {currentUserEntry.score}
                          </div>
                          <div
                            className={`text-[10px] ${
                              darkMode ? "text-teal-300/50" : "text-teal-600"
                            } mt-1`}
                          >
                            points
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${
                        darkMode
                          ? "bg-slate-800/50 border-slate-700/50"
                          : "bg-gray-100 border-gray-300"
                      } border rounded-lg p-3`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] ${
                            darkMode ? "text-slate-400" : "text-gray-600"
                          } uppercase tracking-wider font-bold`}
                        >
                          Percentile
                        </span>
                        <span
                          className={`text-lg font-black ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {selectedTest.totalParticipants > 1
                            ? `${Math.round(
                                ((selectedTest.totalParticipants -
                                  currentUserEntry.rank) /
                                  selectedTest.totalParticipants) *
                                  100
                              )}%`
                            : "-"}
                        </span>
                      </div>
                      <div
                        className={`w-full ${
                          darkMode ? "bg-slate-700/50" : "bg-gray-300"
                        } rounded-full h-2 overflow-hidden`}
                      >
                        <div
                          className={`h-full ${
                            darkMode
                              ? "bg-linear-to-r from-teal-500 to-cyan-500"
                              : "bg-linear-to-r from-teal-600 to-cyan-600"
                          } rounded-full transition-all duration-500`}
                          style={{
                            width:
                              selectedTest.totalParticipants > 1
                                ? `${Math.round(
                                    ((selectedTest.totalParticipants -
                                      currentUserEntry.rank) /
                                      selectedTest.totalParticipants) *
                                      100
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {selectedTest &&
              selectedTest.hasAttempts &&
              !selectedTest.userHasAttempted && (
                <div
                  className={`${
                    darkMode
                      ? "bg-linear-to-br from-amber-500/15 to-orange-600/15 border-amber-500/30"
                      : "bg-linear-to-br from-amber-50 to-orange-50 border-amber-300"
                  } border-2 rounded-xl p-5 relative overflow-hidden`}
                >
                  <div
                    className={`absolute -top-10 -right-10 w-32 h-32 ${
                      darkMode ? "bg-amber-500/20" : "bg-amber-300/40"
                    } rounded-full blur-2xl`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity
                        className={`w-5 h-5 ${
                          darkMode ? "text-amber-400" : "text-amber-600"
                        }`}
                      />
                      <h3
                        className={`font-bold ${
                          darkMode ? "text-amber-400" : "text-amber-700"
                        } text-sm uppercase tracking-wider`}
                      >
                        Ready to Compete
                      </h3>
                    </div>
                    <p
                      className={`${
                        darkMode ? "text-slate-300" : "text-gray-700"
                      } text-xs mb-4 leading-relaxed`}
                    >
                      Start this test to claim your position on the leaderboard.
                    </p>
                    <button
                      onClick={handleStartTest}
                      disabled={isStartingTest}
                      className={`w-full ${
                        darkMode
                          ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30"
                          : "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/40"
                      } text-black px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                      {isStartingTest ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Start Test <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            {filteredTests.length > 0 && (
              <div
                className={`${
                  darkMode
                    ? "bg-slate-900/50 border-slate-800/50"
                    : "bg-white border-gray-200"
                } backdrop-blur-md border rounded-xl p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2
                    className={`text-xs font-bold ${
                      darkMode ? "text-slate-300" : "text-gray-900"
                    } uppercase tracking-wider flex items-center gap-2`}
                  >
                    <TrendingUp
                      className={`w-4 h-4 ${
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    Test Modules
                  </h2>
                  <span
                    className={`text-xs ${
                      darkMode ? "text-slate-500" : "text-gray-500"
                    } font-bold`}
                  >
                    {filteredTests.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {filteredTests.map((test) => (
                    <div
                      key={test.testId}
                      onClick={() => handleTestSelect(test)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedTest?.testId === test.testId
                          ? darkMode
                            ? "bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-500/10"
                            : "bg-teal-50 border-teal-300"
                          : darkMode
                          ? "bg-slate-800/30 border-slate-700/50 hover:border-teal-500/30 hover:bg-slate-800/50"
                          : "bg-gray-50 border-gray-200 hover:border-teal-300 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                selectedTest?.testId === test.testId
                                  ? darkMode
                                    ? "bg-teal-400"
                                    : "bg-teal-600"
                                  : darkMode
                                  ? "bg-slate-600"
                                  : "bg-gray-400"
                              }`}
                            />
                            <span
                              className={`font-medium text-xs truncate ${
                                selectedTest?.testId === test.testId
                                  ? darkMode
                                    ? "text-teal-300"
                                    : "text-teal-700"
                                  : darkMode
                                  ? "text-slate-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {test.testName}
                            </span>
                          </div>
                          {test.subject && (
                            <span
                              className={`text-[10px] ${
                                darkMode ? "text-slate-500" : "text-gray-500"
                              } ml-4 block truncate`}
                            >
                              {test.subject}
                            </span>
                          )}
                        </div>
                        {test.userHasAttempted && (
                          <div
                            className={`p-1 rounded-md ${
                              selectedTest?.testId === test.testId
                                ? darkMode
                                  ? "bg-teal-500/20"
                                  : "bg-teal-100"
                                : darkMode
                                ? "bg-slate-700/50"
                                : "bg-gray-200"
                            }`}
                          >
                            <ArrowRight
                              className={`w-3 h-3 ${
                                selectedTest?.testId === test.testId
                                  ? darkMode
                                    ? "text-teal-400"
                                    : "text-teal-600"
                                  : darkMode
                                  ? "text-slate-500"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTests.length === 0 && hasActiveFilters && (
              <div
                className={`${
                  darkMode
                    ? "bg-slate-900/50 border-slate-800/50"
                    : "bg-white border-gray-200"
                } border rounded-xl p-6 text-center`}
              >
                <BarChart3
                  className={`w-10 h-10 ${
                    darkMode ? "text-slate-700" : "text-gray-300"
                  } mb-2 opacity-50 mx-auto`}
                />
                <p
                  className={`${
                    darkMode ? "text-slate-500" : "text-gray-500"
                  } text-xs mb-3`}
                >
                  No tests match your filters
                </p>
                <button
                  onClick={handleClearFilters}
                  className={`text-xs ${
                    darkMode
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-cyan-600 hover:text-cyan-700"
                  } underline`}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="xl:col-span-2">
            <div
              ref={leaderboardRef}
              className={`${
                darkMode
                  ? "bg-slate-900/50 border-slate-800/50"
                  : "bg-white border-gray-200"
              } backdrop-blur-md rounded-xl border shadow-2xl overflow-hidden`}
            >
              <div
                className={`px-5 py-4 border-b ${
                  darkMode
                    ? "border-slate-800/50 bg-slate-900/60"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedTest ? (
                      <>
                        <div
                          className={`p-2 ${
                            darkMode ? "bg-teal-500/10" : "bg-teal-50"
                          } rounded-lg`}
                        >
                          <Activity
                            className={`w-5 h-5 ${
                              darkMode ? "text-teal-400" : "text-teal-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h2
                            className={`text-base font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {selectedTest.testName}
                          </h2>
                          {selectedTest.categoryName && (
                            <p
                              className={`text-[10px] ${
                                darkMode ? "text-slate-500" : "text-gray-500"
                              } mt-0.5`}
                            >
                              {selectedTest.categoryName}{" "}
                              {selectedTest.subject &&
                                `• ${selectedTest.subject}`}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`p-2 ${
                            darkMode ? "bg-slate-800" : "bg-gray-200"
                          } rounded-lg`}
                        >
                          <BarChart3
                            className={`w-5 h-5 ${
                              darkMode ? "text-slate-600" : "text-gray-400"
                            }`}
                          />
                        </div>
                        <h2
                          className={`text-base font-bold ${
                            darkMode ? "text-slate-500" : "text-gray-400"
                          }`}
                        >
                          Select a test module
                        </h2>
                      </>
                    )}
                  </div>
                  {selectedTest?.hasAttempts && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        darkMode
                          ? "bg-teal-500/10 border-teal-500/20"
                          : "bg-teal-50 border-teal-200"
                      } border`}
                    >
                      <Users
                        className={`w-3.5 h-3.5 ${
                          darkMode ? "text-teal-400" : "text-teal-600"
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          darkMode ? "text-teal-300" : "text-teal-700"
                        }`}
                      >
                        {selectedTest.totalParticipants}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div
                  className={`flex flex-col items-center justify-center p-20 ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`animate-spin rounded-full h-10 w-10 border-2 ${
                      darkMode
                        ? "border-teal-500/30 border-t-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                        : "border-teal-300 border-t-teal-600"
                    }`}
                  />
                  <p
                    className={`mt-4 text-xs font-medium ${
                      darkMode ? "text-teal-500/80" : "text-teal-600/80"
                    } animate-pulse`}
                  >
                    Loading rankings...
                  </p>
                </div>
              ) : !selectedTest ? (
                <div
                  className={`p-20 text-center flex flex-col items-center justify-center ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  <Target
                    className={`w-14 h-14 ${
                      darkMode ? "text-slate-700" : "text-gray-300"
                    } mb-3 opacity-50`}
                  />
                  <p className="text-sm">
                    Select a test module to view rankings
                  </p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div
                  className={`p-20 text-center ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  <BarChart3
                    className={`w-14 h-14 ${
                      darkMode ? "text-slate-700" : "text-gray-300"
                    } mb-3 opacity-50 mx-auto`}
                  />
                  <p className="text-sm">No ranking data available</p>
                </div>
              ) : (
                <div
                  className={`divide-y ${
                    darkMode ? "divide-slate-800/50" : "divide-gray-200"
                  }`}
                >
                  <div
                    className={`px-5 py-3 ${
                      darkMode ? "bg-black/20" : "bg-gray-100/50"
                    } grid grid-cols-12 gap-3`}
                  >
                    <div
                      className={`col-span-2 text-center text-[10px] uppercase tracking-wider font-bold ${
                        darkMode ? "text-slate-500" : "text-gray-600"
                      }`}
                    >
                      Rank
                    </div>
                    <div
                      className={`col-span-7 text-[10px] uppercase tracking-wider font-bold ${
                        darkMode ? "text-slate-500" : "text-gray-600"
                      }`}
                    >
                      Participant
                    </div>
                    <div
                      className={`col-span-3 text-right text-[10px] uppercase tracking-wider font-bold ${
                        darkMode ? "text-slate-500" : "text-gray-600"
                      }`}
                    >
                      Score
                    </div>
                  </div>

                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`px-5 py-3.5 grid grid-cols-12 gap-3 items-center transition-all duration-200 ${
                        entry.isCurrentUser
                          ? darkMode
                            ? "bg-linear-to-r from-teal-500/15 to-cyan-500/10 border-l-2 border-teal-400"
                            : "bg-linear-to-r from-teal-50 to-cyan-50 border-l-2 border-teal-600"
                          : darkMode
                          ? "hover:bg-white/2"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="col-span-2 flex justify-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 font-black rounded-lg ${
                            entry.rank === 1
                              ? darkMode
                                ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                                : "text-yellow-700 bg-yellow-50 border-yellow-300"
                              : entry.rank === 2
                              ? darkMode
                                ? "text-slate-300 bg-slate-500/10 border-slate-500/20"
                                : "text-slate-700 bg-slate-100 border-slate-300"
                              : entry.rank === 3
                              ? darkMode
                                ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                                : "text-orange-700 bg-orange-50 border-orange-300"
                              : darkMode
                              ? "text-slate-500"
                              : "text-gray-400"
                          } ${entry.rank <= 3 ? "border" : ""}`}
                        >
                          {entry.rank <= 3 ? (
                            <Crown className="w-4 h-4" />
                          ) : (
                            `#${entry.rank}`
                          )}
                        </span>
                      </div>

                      <div className="col-span-7 flex items-center gap-2">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold text-sm ${
                              entry.isCurrentUser
                                ? darkMode
                                  ? "text-teal-300"
                                  : "text-teal-700"
                                : darkMode
                                ? "text-slate-200"
                                : "text-gray-900"
                            }`}
                          >
                            {entry.name}
                          </span>
                          {entry.isCurrentUser && (
                            <span
                              className={`text-[9px] ${
                                darkMode
                                  ? "text-teal-500/60"
                                  : "text-teal-600/60"
                              } uppercase tracking-widest font-black`}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 text-right">
                        <div className="inline-flex items-baseline gap-1">
                          <span
                            className={`font-mono font-black text-lg ${
                              entry.rank <= 3
                                ? darkMode
                                  ? "text-white"
                                  : "text-gray-900"
                                : darkMode
                                ? "text-slate-400"
                                : "text-gray-600"
                            }`}
                          >
                            {entry.score}
                          </span>
                          <span
                            className={`text-[10px] ${
                              darkMode ? "text-slate-600" : "text-gray-400"
                            } font-medium`}
                          >
                            pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
