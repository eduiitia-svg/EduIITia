import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight, LockIcon, ArrowLeft } from "lucide-react";
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
  const { tests, allTestsLoading } = useSelector((state) => state.test);
  const { categories } = useSelector((state) => state.category);

  const [selectedTest, setSelectedTest] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [starting, setStarting] = useState(null);

  const categoryFromUrl = searchParams.get("category");

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

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

    if (
      sub.subject &&
      sub.subject !== "All" &&
      test.subject
    ) {
      if (
        test.subject.toLowerCase() !== sub.subject.toLowerCase()
      ) {
        return false;
      }
    }

    if (
      sub.subcategory &&
      sub.subcategory !== "All" &&
      test.subcategory
    ) {
      if (
        test.subcategory.toLowerCase() !== sub.subcategory.toLowerCase()
      ) {
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
      console.log(test)

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

            {/* Category Badge */}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp
                  className="text-emerald-600 dark:text-emerald-400"
                  size={28}
                />
                Available Tests
                {filteredTests.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({filteredTests.length}{" "}
                    {filteredTests.length === 1 ? "test" : "tests"})
                  </span>
                )}
              </h2>
            </div>

            {allTestsLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="mt-6 text-emerald-600/80 dark:text-emerald-400/80 font-mono text-sm tracking-widest animate-pulse">
                  INITIALIZING...
                </p>
              </div>
            ) : !tests || tests.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 max-w-2xl mx-auto border-dashed">
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Tests Found
                </p>
                <p className="text-gray-500 mb-6">
                  {categoryFromUrl
                    ? `No tests available for ${categoryFromUrl} category yet.`
                    : "System could not locate tests for this category."}
                </p>
                {categoryFromUrl && (
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                  >
                    Browse All Categories
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test, i) => {
                  const locked = !checkAccess(test);
                  const isDemo =
                    test.isDemo || test.testType?.toLowerCase() === "demo";
                  const isStarting = starting === test.id;
                  return (
                    <motion.div
                      key={`${test.id}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative bg-white dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm dark:shadow-none"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {!isDemo && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-linear-to-bl from-amber-400 to-orange-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-lg">
                            PRO ACCESS
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-start gap-2 mb-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getTypeColor(
                              test.testType,
                            )}`}
                          >
                            {test.testType}
                          </span>

                          {test.subject && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                              {test.subject}
                            </span>
                          )}

                          {test.subcategory && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 flex items-center gap-1">
                              <ChevronRight size={10} />
                              {test.subcategory}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {test.testName}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                          {test.title ||
                            test.description ||
                            "Standardized assessment protocol for chemistry evaluation."}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Questions
                            </div>
                            <div className="text-gray-900 dark:text-white font-mono font-semibold">
                              {test.totalQuestions ||
                                test.questions?.length ||
                                "00"}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Duration
                            </div>
                            <div className="text-gray-900 dark:text-white font-mono font-semibold">
                              {test.makeTime || test.timeLimit
                                ? `${test.makeTime || test.timeLimit}m`
                                : "--"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartClick(test)}
                        disabled={locked || isStarting}
                        className={`relative w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 overflow-hidden ${
                          locked
                            ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 cursor-not-allowed"
                            : isStarting
                              ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 cursor-wait"
                              : "bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 text-white dark:text-black shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:scale-[1.02]"
                        }`}
                      >
                        {isStarting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>INITIALIZING...</span>
                          </div>
                        ) : locked ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>LOCKED</span>
                            <LockIcon size={18} />
                          </div>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {isDemo ? "DEPLOY DEMO" : "DEPLOY TEST"}
                          </span>
                        )}
                      </button>
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
