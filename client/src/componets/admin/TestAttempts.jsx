import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import {
  Layers3,
  Gauge,
  User,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import CustomSelect from "../../ui/CustomSelect";
const TestAttempts = () => {
  const {
    questionPapers,
    testAttempts,
    fetchTestAttempts,
    loading,
    isAuthenticated,
  } = useAdmin();
  const [selectedTest, setSelectedTest] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const safeTestAttempts = Array.isArray(testAttempts) ? testAttempts : [];
  const handleTestSelect = async (testId) => {
    setSelectedTest(testId);
    if (testId) {
      setIsFetching(true);
      try {
        await fetchTestAttempts(testId);
      } catch (error) {
        console.error("❌ Failed to fetch attempts:", error);
      } finally {
        setIsFetching(false);
      }
    }
  };
  const getSelectedTestName = () => {
    const paper = questionPapers.find((p) => p.id === selectedTest);
    return paper?.testName || "";
  };
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };
  const selectOptions = questionPapers.map((paper) => ({
    value: paper.id,
    label: `${paper.testName} (${paper.questions?.length || 0} questions)`,
  }));
  const averageScore =
    selectedTest && safeTestAttempts.length > 0
      ? Math.round(
          safeTestAttempts.reduce(
            (acc, attempt) => acc + (attempt.score || 0),
            0
          ) / safeTestAttempts.length
        )
      : 0;
  if (!isAuthenticated || loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 bg-[#0f0f0f] rounded-xl border border-emerald-900/40">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-3" />
        <p className="text-gray-400">Loading admin data...</p>
      </div>
    );
  }
  if (questionPapers.length === 0) {
    return (
      <div className="text-gray-200 min-h-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
            <Layers3 className="text-emerald-500" size={24} />
            <span>Test Attempts & Analytics</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Analyze student performance for your tests.
          </p>
        </div>
        <div className="bg-[#0f0f0f] rounded-xl border border-emerald-900/40 p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto text-yellow-600/50 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            No Question Papers Found
          </h3>
          <p className="text-gray-400">
            You haven't uploaded any tests yet. Upload some question papers to
            view student attempts.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="text-gray-900 dark:text-gray-200 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Layers3
            className="text-emerald-600 dark:text-emerald-500"
            size={24}
          />
          <span>Test Attempts & Analytics</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analyze student performance for your tests.
        </p>
      </div>

      {!isAuthenticated || loading ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 shadow-sm">
          <Loader2 className="animate-spin h-8 w-8 text-emerald-600 dark:text-emerald-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading admin data...
          </p>
        </div>
      ) : questionPapers.length === 0 ? (
        <>
          <div className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 p-8 text-center shadow-sm">
            <AlertCircle
              className="mx-auto text-yellow-600 dark:text-yellow-600/50 mb-4"
              size={48}
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Question Papers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't uploaded any tests yet. Upload some question papers to
              view student attempts.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 shadow-sm p-6 mb-8">
            <CustomSelect
              label="Select Your Test to View Attempts"
              options={selectOptions}
              value={selectedTest}
              onChange={handleTestSelect}
              placeholder="Choose a test..."
            />
          </div>

          {isFetching && (
            <div className="flex flex-col justify-center items-center py-12 bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 shadow-sm">
              <Loader2 className="animate-spin h-8 w-8 text-emerald-600 dark:text-emerald-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading test attempts...
              </p>
            </div>
          )}

          {selectedTest && !isFetching && safeTestAttempts.length > 0 && (
            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 dark:bg-black/30 border-b border-gray-200 dark:border-emerald-900/40">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-4">
                      {getSelectedTestName()}
                    </h3>
                    <span className="text-sm text-gray-700 dark:text-gray-400 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700/50 px-3 py-1 rounded-full">
                      {safeTestAttempts.length} Attempts
                    </span>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <Gauge
                      className="text-purple-600 dark:text-purple-400"
                      size={24}
                    />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Average Score
                      </p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {averageScore}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-black/30 border-b border-gray-200 dark:border-emerald-900/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <User size={14} className="inline mr-1 text-gray-500" />{" "}
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <Calendar
                          size={14}
                          className="inline mr-1 text-gray-500"
                        />{" "}
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-emerald-900/40">
                    {safeTestAttempts.map((attempt) => (
                      <tr
                        key={attempt.id || attempt._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.userName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-500">
                            {attempt.userEmail || "User Email N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${getScoreColor(
                              attempt.score || 0
                            )}`}
                          >
                            {attempt.score || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-500">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTest && !isFetching && safeTestAttempts.length === 0 && (
            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 p-8 text-center shadow-sm">
              <div className="text-5xl mb-4 text-gray-400 dark:text-gray-500">
                <Gauge
                  className="mx-auto text-emerald-600 dark:text-emerald-600/50"
                  size={48}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Attempts Recorded
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No students have attempted this test yet. Share the test link to
                begin data collection.
              </p>
            </div>
          )}
          {!selectedTest && !isFetching && (
            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-emerald-900/40 p-8 text-center shadow-sm">
              <div className="text-5xl mb-4 text-gray-400 dark:text-gray-500">
                <Layers3
                  className="mx-auto text-purple-600 dark:text-purple-600/50"
                  size={48}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select a Test to Analyze
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose one of your question papers from the dropdown above to
                view student attempts.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default TestAttempts;
