import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllTestAttempts, getAttemptsByTest } from "../slices/attemptSlice";
const LeaderboardContext = createContext();
export const LeaderboardProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { attemptedTests, loading } = useSelector((state) => state.attempts);
  const { user } = useSelector((state) => state.auth);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const fetchTests = async () => {
    if (!user || !user.uid) {
      return;
    }
    if (user.role === "superadmin") {
      return;
    }
    try {
      const result = await dispatch(getAllTestAttempts()).unwrap();
      setTests(result);
      const testsWithAttempts = result.filter(t => t.hasAttempts);
      if (testsWithAttempts.length > 0) {
        setSelectedTest(testsWithAttempts[0]);
      }
    } catch (err) {
      console.error("❌ Failed test fetch:", err);
      toast.error("Failed to load tests");
    }
  };
  const fetchLeaderboard = async (testId) => {
    if (!testId) {
      return;
    }
    try {
      const result = await dispatch(getAttemptsByTest(testId)).unwrap();
      if (!result.data || result.data.length === 0) {
        setLeaderboard([]);
        setSelectedTest((prev) => ({
          ...prev,
          totalParticipants: 0,
        }));
        return;
      }
      const leaderboardData = result.data.map((attempt, index) => {
        const isCurrentUser = user?.uid === attempt.user._id;
        return {
          rank: index + 1,
          userId: attempt.user._id,
          name: attempt.user.name,
          email: attempt.user.email,
          score: attempt.score,
          submittedAt: attempt.submittedAt,
          isCurrentUser: isCurrentUser,
        };
      });
      const currentUserEntry = leaderboardData.find(entry => entry.isCurrentUser);
      setLeaderboard(leaderboardData);
      setSelectedTest((prev) => ({
        ...prev,
        totalParticipants: leaderboardData.length,
      }));
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
      setLeaderboard([]);
      setSelectedTest((prev) => ({
        ...prev,
        totalParticipants: 0,
      }));
    }
  };
  const fetchUserStats = async () => {
    try {
      if (user && leaderboard.length > 0) {
        const userAttempts = leaderboard.filter(
          (entry) => entry.userId === user.uid
        );
        setStats({
          totalAttempts: userAttempts.length,
          averageScore:
            userAttempts.length > 0
              ? userAttempts.reduce((sum, a) => sum + a.score, 0) /
                userAttempts.length
              : 0,
          bestScore:
            userAttempts.length > 0
              ? Math.max(...userAttempts.map((a) => a.score))
              : 0,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  };
  const handleTestSelect = (test) => {
    if (!test.hasAttempts) {
      toast.info(
        "No attempts found for this test. Be the first to attempt it!"
      );
      return;
    }
    setSelectedTest(test);
  };
  useEffect(() => {
    if (!user) {
      return;
    }
    if (!user.uid) {
      return;
    }
    if (user.role === "superadmin") {
      return;
    }
    fetchTests();
  }, [user]);
  useEffect(() => {
    if (selectedTest && selectedTest.hasAttempts && selectedTest.testId) {
      fetchLeaderboard(selectedTest.testId);
    }
  }, [selectedTest?.testId]);
  useEffect(() => {
    if (leaderboard.length > 0) {
      fetchUserStats();
    }
  }, [leaderboard, user]);
  const value = {
    tests,
    selectedTest,
    leaderboard,
    stats,
    loading,
    handleTestSelect,
    refetchTests: fetchTests,
    refetchStats: fetchUserStats,
  };
  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};
export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error("useLeaderboard must be used within LeaderboardProvider");
  }
  return context;
};