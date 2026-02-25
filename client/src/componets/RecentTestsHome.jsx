import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ChevronRight,
  LockIcon,
  ArrowLeft,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllTestsByCategory, startTest } from "../slices/testSlice";
import InstructionModal from "./test/InstructionModal";
import ExamCategorySelector from "../ui/ExamCategorySelector";
import AppLayout from "../layout/AppLayout";
import { useSubscription } from "../context/SubscriptionContext";
import { getAllCategories } from "../slices/categorySlice";

const RecentTestsHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { canTakeTest, getRemainingTests } = useSubscription();
  const { user } = useSelector((state) => state.auth);
  const { tests, allTestsLoading, history } = useSelector(
    (state) => state.test,
  );
  const { categories } = useSelector((state) => state.category);

  const [selectedTest, setSelectedTest] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [starting, setStarting] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const categoryFromUrl = searchParams.get("category");
  const hasAttemptedTest = (testId) =>
    history.some((h) => h.testId === testId && h.submittedAt);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((n) => n + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subjectFromUrl = searchParams.get("subject");

    if (subjectFromUrl) {
      dispatch(getAllTestsByCategory({ subject: subjectFromUrl }));
    } else if (categoryFromUrl) {
      dispatch(getAllTestsByCategory({ categoryName: categoryFromUrl }));
    } else {
      dispatch(getAllTestsByCategory({}));
    }
  }, [dispatch, categoryFromUrl, searchParams]);
  const handleCategorySelect = (category, subject, subcategory) => {
    const filters = {
      categoryName: category.name,
      subject: subject,
    };

    if (subcategory) {
      filters.subcategory = subcategory;
    }

    dispatch(getAllTestsByCategory(filters));
  };

  const checkAccess = (test) => {
    if (test.scheduledStartTime) {
      const now = new Date();
      const startTime = new Date(test.scheduledStartTime);
      if (now < startTime && !hasAttemptedTest(test.id)) {
        return false;
      }
    }

    if (test.isDemo || test.testType?.toLowerCase() === "demo") {
      return true;
    }

    if (!user) {
      return false;
    }

    const subscriptions = user.subscription || [];

    return subscriptions.some((sub) => {
      if (!sub.isActive || !sub.endDate) return false;

      const endDate = sub.endDate.toDate
        ? sub.endDate.toDate()
        : new Date(sub.endDate);

      if (new Date() >= endDate) return false;

      if (
        sub.mainCategory &&
        sub.mainCategory !== "All" &&
        test.categoryMainCategory
      ) {
        if (
          test.categoryMainCategory.toLowerCase() !==
          sub.mainCategory.toLowerCase()
        ) {
          return false;
        }
      }

      if (sub.subject && sub.subject !== "All" && test.subject) {
        if (test.subject.toLowerCase() !== sub.subject.toLowerCase()) {
          return false;
        }
      }

      if (sub.subcategory && sub.subcategory !== "All" && test.subcategory) {
        if (test.subcategory.toLowerCase() !== sub.subcategory.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  };

  const handleStartClick = async (test) => {
    if (!user) {
      toast.error("Please log in to start the test.");
      navigate("/login");
      return;
    }

    if (!checkAccess(test)) {
      if (
        test.scheduledStartTime &&
        new Date() < new Date(test.scheduledStartTime)
      ) {
        toast.error(
          `Test unlocks at ${new Date(test.scheduledStartTime).toLocaleString()}`,
        );
        return;
      }
      toast.error("Upgrade to PRO or Premium to access this test!");
      navigate("/pricing");
      return;
    }
    setSelectedTest(test);
    setShowInstructions(true);
  };

  const handleConfirmInstructions = async () => {
    if (!selectedTest) return;
    try {
      setStarting(selectedTest.id);
      const result = await dispatch(startTest(selectedTest.id)).unwrap();
      if (result?.attemptId) {
        navigate(`/test/${result.attemptId}`);
      } else {
        toast.error("Failed to initialize test.");
      }
    } catch (error) {
      console.error("Start test error:", error);
      toast.error(
        error || "Failed to start test. Please check your subscription.",
      );
      setShowInstructions(false);
      setStarting(null);
    }
  };

  const getTypeColor = (type) => {
    const map = {
      demo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      organic: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      inorganic: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      physical: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    return (
      map[type?.toLowerCase()] || "bg-white/5 text-gray-400 border-white/10"
    );
  };

  const getCategoryTitle = () => {
    const subjectFromUrl = searchParams.get("subject");

    if (subjectFromUrl) {
      return `${subjectFromUrl} Tests`;
    }

    switch (categoryFromUrl?.toLowerCase()) {
      case "school":
        return "School Tests";
      case "entrance":
        return "Entrance Exam Tests";
      case "recruitment":
        return "Recruitment Exam Tests";
      default:
        return "Available Tests";
    }
  };

  const getCategoryDescription = () => {
    const subjectFromUrl = searchParams.get("subject");

    if (subjectFromUrl) {
      return `Practice tests and quizzes for ${subjectFromUrl}`;
    }

    switch (categoryFromUrl?.toLowerCase()) {
      case "school":
        return "Comprehensive test series for Classes 1-12 covering all subjects";
      case "entrance":
        return "Prepare for JEE, NEET, UPSC, and other competitive entrance exams";
      case "recruitment":
        return "Government job exams including SSC, Banking, Railway & more";
      default:
        return "Experience decentralized learning. Start with free demo tests or unlock the full potential with our PRO network.";
    }
  };

  const recentTests = tests || [];

  const filteredTests = useMemo(() => {
    if (!user?.subscription) {
      return recentTests;
    }

    const activeSubscription = (user.subscription || []).find((sub) => {
      if (!sub.isActive || !sub.endDate) return false;
      const endDate = sub.endDate.toDate
        ? sub.endDate.toDate()
        : new Date(sub.endDate);
      return new Date() < endDate;
    });

    if (!activeSubscription) {
      return recentTests;
    }

    const filtered = recentTests.filter((test) => {
      console.log(test);

      if (test.isDemo || test.testType?.toLowerCase() === "demo") {
        return true;
      }

      if (
        activeSubscription.mainCategory &&
        activeSubscription.mainCategory !== "All" &&
        test.categoryMainCategory
      ) {
        if (
          test.categoryMainCategory.toLowerCase() !==
          activeSubscription.mainCategory.toLowerCase()
        ) {
          return false;
        }
      }

      if (
        activeSubscription.subject &&
        activeSubscription.subject !== "All" &&
        test.subject
      ) {
        if (
          test.subject.toLowerCase() !==
          activeSubscription.subject.toLowerCase()
        ) {
          return false;
        }
      }

      if (
        activeSubscription.subcategory &&
        activeSubscription.subcategory !== "All" &&
        test.subcategory
      ) {
        if (
          test.subcategory.toLowerCase() !==
          activeSubscription.subcategory.toLowerCase()
        ) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [tests, recentTests, user]);

  return (
    <AppLayout>
      <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-transparent">
        <div className="relative z-10 w-full max-w-7xl mx-auto py-12 px-6">
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                Library Live
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              {categoryFromUrl ? (
                getCategoryTitle()
              ) : (
                <>
                  Next-Gen Chemistry{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 dark:from-emerald-400 to-teal-600 dark:to-teal-500">
                    Testing
                  </span>
                </>
              )}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {getCategoryDescription()}
            </p>

            {(categoryFromUrl || searchParams.get("subject")) && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 backdrop-blur-md">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  📚 {searchParams.get("subject") || categoryFromUrl}
                </span>
              </div>
            )}
          </div>

          <div className="mb-12">
            <ExamCategorySelector
              onCategorySelect={handleCategorySelect}
              filterByCategory={categoryFromUrl}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp
                  className="text-emerald-500 dark:text-emerald-400"
                  size={28}
                />
                Available Tests
                {filteredTests.length > 0 && (
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                    {filteredTests.length}{" "}
                    {filteredTests.length === 1 ? "test" : "tests"}
                  </span>
                )}
              </h2>
            </div>

            {allTestsLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium tracking-wide animate-pulse">
                  Initializing Workspace...
                </p>
              </div>
            ) : !tests || tests.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 max-w-2xl mx-auto">
                <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                  No Tests Found
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
                  {categoryFromUrl
                    ? `No tests available for the ${categoryFromUrl} category yet.`
                    : "System could not locate tests for this category."}
                </p>
                {categoryFromUrl && (
                  <button
                    onClick={() => navigate("/")}
                    className="px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors text-sm"
                  >
                    Browse All Categories
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTests.map((test, i) => {
                  const locked = !checkAccess(test);
                  const isDemo =
                    test.isDemo || test.testType?.toLowerCase() === "demo";
                  const isStarting = starting === test.id;

                  return (
                    <motion.div
                      key={`${test.id}-${i}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl pointer-events-none" />

                      {!isDemo && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="bg-linear-to-r from-amber-100 to-amber-200 dark:from-amber-500/10 dark:to-orange-500/10 text-amber-800 dark:text-amber-400 border border-amber-300/50 dark:border-amber-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            PRO
                          </span>
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-1.5 mb-4 pr-12">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeColor(
                              test.testType,
                            )}`}
                          >
                            {test.testType}
                          </span>

                          {test.subject && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-600 px-0.5">
                                &bull;
                              </span>
                              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                                {test.subject}
                              </span>
                            </>
                          )}

                          {test.subcategory && (
                            <>
                              <ChevronRight
                                size={12}
                                className="text-zinc-400"
                              />
                              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[100px]">
                                {test.subcategory}
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {test.testName}
                        </h2>

                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                          {test.title ||
                            test.description ||
                            "Standardized assessment protocol for subject evaluation."}
                        </p>

                        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/80 mb-5">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                              Questions
                            </span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                              {test.totalQuestions ||
                                test.questions?.length ||
                                "00"}
                            </span>
                          </div>

                          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>

                          <div className="flex flex-col items-end">
                            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                              Duration
                            </span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                              {test.makeTime || test.timeLimit
                                ? `${test.makeTime || test.timeLimit} mins`
                                : "Untimed"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto relative z-10">
                        {test.scheduledStartTime &&
                          new Date() < new Date(test.scheduledStartTime) && (
                            <div className="mb-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
                              <Clock size={14} />
                              <span className="font-medium">Unlocks:</span>{" "}
                              {new Date(test.scheduledStartTime).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          )}

                        <button
                          onClick={() => handleStartClick(test)}
                          disabled={locked || isStarting}
                          className={`relative w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                            locked
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                              : isStarting
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-wait"
                                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          }`}
                        >
                          {isStarting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Initializing...</span>
                            </>
                          ) : locked ? (
                            <>
                              <LockIcon size={16} />
                              <span>Locked</span>
                            </>
                          ) : (
                            <span>{isDemo ? "Try Demo" : "Start Test"}</span>
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

        {showInstructions && (
          <InstructionModal
            test={selectedTest}
            onCancel={() => {
              setShowInstructions(false);
              setSelectedTest(null);
            }}
            onConfirm={handleConfirmInstructions}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default RecentTestsHome;
