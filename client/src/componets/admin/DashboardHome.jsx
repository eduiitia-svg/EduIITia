import React, { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  FileText,
  HelpCircle,
  BrainCircuit,
  Users,
  UploadCloud,
  LayoutDashboard,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import { db } from "../../config/firebase";

const DashboardHome = () => {
  const { questionPapers, isAuthenticated, loading } = useAdmin();
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const calculateTotalAttempts = async () => {
      if (!questionPapers || questionPapers.length === 0) {
        setTotalAttempts(0);
        return;
      }

      try {
        let total = 0;
        const attemptsRef = collection(db, "testAttempts");

        const testIds = questionPapers.map((paper) => paper.id);

        for (let i = 0; i < testIds.length; i += 10) {
          const batch = testIds.slice(i, i + 10);
          const q = query(
            attemptsRef,
            where("testId", "in", batch),
            where("submittedAt", "!=", null)
          );
          const snapshot = await getDocs(q);
          total += snapshot.size;
        }

        setTotalAttempts(total);
      } catch (error) {
        console.error("Error calculating total attempts:", error);
        setTotalAttempts(0);
      }
    };

    if (isAuthenticated && !loading) {
      calculateTotalAttempts();
    }
  }, [questionPapers, isAuthenticated, loading]);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-emerald-500"
            size={48}
          />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "My Question Papers",
      value: questionPapers?.length || 0,
      icon: <FileText className="text-emerald-400" size={24} />,
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "group-hover:border-emerald-500/50",
      description: "Tests you created",
    },
    {
      title: "My Questions",
      value:
        questionPapers?.reduce(
          (acc, paper) => acc + (paper.questions?.length || 0),
          0
        ) || 0,
      icon: <HelpCircle className="text-cyan-400" size={24} />,
      color: "from-cyan-500/20 to-cyan-500/5",
      border: "group-hover:border-cyan-500/50",
      description: "Across your papers",
    },
    {
      title: "MCQ Tests",
      value:
        questionPapers?.filter(
          (p) => p.testType === "multiple_choice" || p.testType === "mock"
        ).length || 0,
      icon: <BrainCircuit className="text-purple-400" size={24} />,
      color: "from-purple-500/20 to-purple-500/5",
      border: "group-hover:border-purple-500/50",
      description: "Your MCQ papers",
    },
    {
      title: "Total Attempts",
      value: totalAttempts,
      icon: <Users className="text-amber-400" size={24} />,
      color: "from-amber-500/20 to-amber-500/5",
      border: "group-hover:border-amber-500/50",
      description: "Student submissions",
    },
  ];

  const recentPapers = questionPapers?.slice(0, 3) || [];

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

  return (
    <div className="min-h-screen rounded-2xl text-gray-900 dark:text-white bg-gray-50 dark:bg-[radial-linear(ellipse_at_top,var(--tw-linear-stops))] dark:from-emerald-900/20 dark:via-[#050505] dark:to-[#050505]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-10 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Welcome back,{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              {user?.name}
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            Manage your assessment protocols
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-white dark:bg-white/5 backdrop-blur-xl  dark:border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/[0.07] hover:transform hover:-translate-y-1 hover:border-gray-300 dark:${stat.border} shadow-sm hover:shadow-md`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${stat.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 font-mono tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 shadow-inner">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-gray-200 dark:border-white/10 relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Activity className="text-emerald-600 dark:text-emerald-400" />{" "}
              Quick Actions
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/admin/upload")}
                className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Upload New Questions
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Deploy via CSV protocol
                  </p>
                </div>
                <ArrowRight
                  className="text-gray-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                  size={20}
                />
              </button>

              <button
                onClick={() => navigate("/admin/papers")}
                className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <LayoutDashboard size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Manage My Papers
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Edit your configurations
                  </p>
                </div>
                <ArrowRight
                  className="text-gray-400 dark:text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                  size={20}
                />
              </button>

              <button
                onClick={() => navigate("/admin/attempts")}
                className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    View Attempts
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Analyze performance
                  </p>
                </div>
                <ArrowRight
                  className="text-gray-400 dark:text-gray-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                  size={20}
                />
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Layers className="text-purple-600 dark:text-purple-400" /> My
              Recent Uploads
            </h3>

            {recentPapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                <FileText size={40} className="mb-4 opacity-50" />
                <p className="text-center">
                  No papers found
                  <br />
                  <span className="text-sm">Upload your first test!</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-300"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {paper.testName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600 dark:text-gray-500 flex items-center gap-1">
                          <HelpCircle size={10} />{" "}
                          {paper.questions?.length || 0} Qs
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-500 border-l border-gray-300 dark:border-white/10 pl-3">
                          {paper.makeTime} mins
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${
                        paper.testType === "physical"
                          ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20"
                          : "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20"
                      }`}
                    >
                      {paper.testType}
                    </span>
                  </div>
                ))}

                {questionPapers.length > 3 && (
                  <button
                    onClick={() => navigate("/admin/papers")}
                    className="w-full mt-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    View All My Papers{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
