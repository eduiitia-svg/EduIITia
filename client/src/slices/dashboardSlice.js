import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const calculateStats = (attempts) => {
  if (attempts.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalSkipped: 0,
      totalTimeSpent: 0,
    };
  }

  let totalScore = 0;
  let bestScore = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalSkipped = 0;
  let totalTimeSpent = 0;

  attempts.forEach((attempt) => {
    totalScore += attempt.score || 0;
    bestScore = Math.max(bestScore, attempt.score || 0);
    totalCorrect += attempt.correctAnswers || 0;
    totalIncorrect += attempt.incorrectAnswers || 0;
    totalSkipped += attempt.skippedAnswers || 0;
    totalTimeSpent += attempt.timeSpent || 0;
  });

  return {
    averageScore: Math.round(totalScore / attempts.length),
    bestScore: Math.round(bestScore),
    totalCorrect,
    totalIncorrect,
    totalSkipped,
    totalTimeSpent,
  };
};

export const getTestHistory = createAsyncThunk(
  "dashboard/getTestHistory",
  async ({ userId, testType = "all" }, { rejectWithValue }) => {
    try {
      const attemptsRef = collection(db, "testAttempts");
      let querySnapshot;

      if (testType && testType !== "all") {
        const q = query(
          attemptsRef,
          where("userId", "==", userId),
          where("testType", "==", testType),
        );
        querySnapshot = await getDocs(q);
      } else {
        const q = query(attemptsRef, where("userId", "==", userId));
        querySnapshot = await getDocs(q);
      }

      const history = [];

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        let fullQuestions = [];

        if (data.testId) {
          try {
            const testDoc = await getDoc(doc(db, "questions", data.testId));
            if (testDoc.exists()) {
              const testData = testDoc.data();
              fullQuestions = testData.questions || [];
            }
          } catch (error) {
            console.error("Error fetching test questions:", error);
          }
        }

        const answersMap = {};
        (data.answers || []).forEach((answer) => {
          answersMap[answer.questionIndex] = answer;
        });

        const questions = fullQuestions.map((fullQuestion, index) => {
          const answer = answersMap[index];

          return {
            questionText: fullQuestion.questionText || "",
            selectedAnswer: answer ? answer.selectedAnswer || "" : "",
            correctAnswer: fullQuestion.correctAnswer || "",
            isCorrect: answer ? answer.isCorrect || false : false,
            isAttempted: !!answer,
            options: fullQuestion.options || [],
            images: fullQuestion.images || [],
            explanationImages: fullQuestion.explanationImages || [],
            explanation: fullQuestion.explanation || "",
            questionLevel: fullQuestion.questionLevel || "Medium",
          };
        });

        const actualCorrectAnswers = questions.filter(
          (q) => q.isCorrect,
        ).length;
        const actualIncorrectAnswers = questions.filter(
          (q) => q.isAttempted && !q.isCorrect,
        ).length;
        const actualSkippedAnswers = questions.filter(
          (q) => !q.isAttempted,
        ).length;

        history.push({
          attemptId: docSnapshot.id,
          testName: data.testName || "Untitled Test",
          testType: data.testType || "General",
          startedAt: data.startedAt,
          submittedAt: data.submittedAt || null,
          score: data.score || 0,
          totalQuestions: questions.length,
          correctAnswers: actualCorrectAnswers,
          incorrectAnswers: actualIncorrectAnswers,
          skippedAnswers: actualSkippedAnswers,
          markingScheme: "+4 for correct, -1 for wrong",
          timeSpent: data.timeSpent || 0,
          questions: questions,
        });
      }

      history.sort((a, b) => {
        const dateA = a.startedAt?.toDate
          ? a.startedAt.toDate()
          : new Date(a.startedAt || 0);
        const dateB = b.startedAt?.toDate
          ? b.startedAt.toDate()
          : new Date(b.startedAt || 0);
        return dateB - dateA;
      });

      return { history };
    } catch (error) {
      console.error("❌ Test history error:", error);
      return rejectWithValue(error.message || "Failed to fetch test history");
    }
  },
);

export const getPerformanceOverview = createAsyncThunk(
  "dashboard/getPerformanceOverview",
  async (userId, { rejectWithValue }) => {
    try {
      const attemptsRef = collection(db, "testAttempts");
      const q = query(attemptsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const attempts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attempts.push({ id: doc.id, ...data });
      });

      const totalTests = attempts.length;
      const stats = calculateStats(attempts);

      const testTypeMap = {};
      attempts.forEach((attempt) => {
        const testType = attempt.testType || "General";
        if (!testTypeMap[testType]) {
          testTypeMap[testType] = [];
        }
        testTypeMap[testType].push(attempt);
      });

      const testTypeStats = Object.keys(testTypeMap).map((testType) => {
        const typeAttempts = testTypeMap[testType];
        const typeStats = calculateStats(typeAttempts);
        return {
          type: testType,
          attemptCount: typeAttempts.length,
          averageScore: typeStats.averageScore,
          bestScore: typeStats.bestScore,
          totalTime: typeStats.totalTimeSpent,
        };
      });

      return {
        totalTests,
        averageScore: stats.averageScore,
        bestScore: stats.bestScore,
        correctAnswers: stats.totalCorrect,
        incorrectAnswers: stats.totalIncorrect,
        skippedAnswers: stats.totalSkipped,
        totalTimeSpent: stats.totalTimeSpent,
        testTypes: testTypeStats,
      };
    } catch (error) {
      console.error("❌ Performance overview error:", error);
      return rejectWithValue(
        error.message || "Failed to fetch performance data",
      );
    }
  },
);

export const getTestAttempts = createAsyncThunk(
  "dashboard/getTestAttempts",
  async ({ userId, testType }, { rejectWithValue }) => {
    try {
      const attemptsRef = collection(db, "testAttempts");
      let q;

      if (testType && testType !== "all") {
        q = query(
          attemptsRef,
          where("userId", "==", userId),
          where("testType", "==", testType),
          where("submittedAt", "!=", null),
          orderBy("submittedAt", "desc"),
        );
      } else {
        q = query(
          attemptsRef,
          where("userId", "==", userId),
          where("submittedAt", "!=", null),
          orderBy("submittedAt", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const attempts = [];

      for (const docSnapshot of querySnapshot.docs) {
        const attemptData = docSnapshot.data();

        let testDetails = {};
        if (attemptData.testId) {
          try {
            const testDoc = await getDoc(
              doc(db, "questions", attemptData.testId),
            );
            if (testDoc.exists()) {
              const testData = testDoc.data();
              testDetails = {
                categoryName: testData.categoryName,
                subject: testData.subject,
                subcategory: testData.subcategory || null,
              };
            }
          } catch (error) {
            console.error("Error fetching test details:", error);
          }
        }

        attempts.push({
          id: docSnapshot.id,
          testName: attemptData.testName,
          testType: attemptData.testType,
          score: attemptData.score || 0,
          correct: attemptData.correctAnswers || 0,
          incorrect: attemptData.incorrectAnswers || 0,
          skipped: attemptData.skippedAnswers || 0,
          totalQuestions: attemptData.totalQuestions || 0,
          timeSpent: attemptData.timeSpent || 0,
          date: attemptData.submittedAt?.toDate() || new Date(),

          categoryName: testDetails.categoryName || null,
          subject: testDetails.subject || null,
          subcategory: testDetails.subcategory || null,
        });
      }
      return attempts;
    } catch (error) {
      console.error("❌ Error fetching test attempts:", error);
      return rejectWithValue(error.message);
    }
  },
);

export const getTestAttemptById = createAsyncThunk(
  "dashboard/getTestAttemptById",
  async (attemptId, { rejectWithValue }) => {
    try {
      const attemptRef = doc(db, "testAttempts", attemptId);
      const attemptDoc = await getDoc(attemptRef);

      if (!attemptDoc.exists()) {
        throw new Error("Test attempt not found");
      }

      const data = attemptDoc.data();

      let fullQuestions = [];

      if (data.testId) {
        try {
          const testDoc = await getDoc(doc(db, "questions", data.testId));
          if (testDoc.exists()) {
            const testData = testDoc.data();
            fullQuestions = testData.questions || [];
          }
        } catch (error) {
          console.error("Error fetching test questions:", error);
        }
      }

      const answersMap = {};
      (data.answers || []).forEach((answer) => {
        answersMap[answer.questionIndex] = answer;
      });

      const questions = fullQuestions.map((fullQuestion, index) => {
        const answer = answersMap[index];

        return {
          questionText: fullQuestion.questionText || "",
          selectedAnswer: answer ? answer.selectedAnswer || "" : "",
          correctAnswer: fullQuestion.correctAnswer || "",
          isCorrect: answer ? answer.isCorrect || false : false,
          isAttempted: !!answer,
          options: fullQuestion.options || [],
          images: fullQuestion.images || [],
          explanationImages: fullQuestion.explanationImages || [],
          explanation: fullQuestion.explanation || "",
          questionLevel: fullQuestion.questionLevel || "Medium",
        };
      });

      const actualCorrectAnswers = questions.filter((q) => q.isCorrect).length;
      const actualIncorrectAnswers = questions.filter(
        (q) => q.isAttempted && !q.isCorrect,
      ).length;
      const actualSkippedAnswers = questions.filter(
        (q) => !q.isAttempted,
      ).length;

      return {
        attemptId: attemptDoc.id,
        testName: data.testName || "Untitled Test",
        testType: data.testType || "General",
        startedAt: data.startedAt,
        submittedAt: data.submittedAt || null,
        score: data.score || 0,
        totalQuestions: questions.length,
        correctAnswers: actualCorrectAnswers,
        incorrectAnswers: actualIncorrectAnswers,
        skippedAnswers: actualSkippedAnswers,
        markingScheme: "+4 for correct, -1 for wrong",
        timeSpent: data.timeSpent || 0,
        questions: questions,
      };
    } catch (error) {
      console.error("❌ Get test attempt by ID error:", error);
      return rejectWithValue(error.message || "Failed to fetch test attempt");
    }
  },
);

export const getProgressOverTime = createAsyncThunk(
  "dashboard/getProgressOverTime",
  async ({ userId, testType = "all" }, { rejectWithValue }) => {
    try {
      const attemptsRef = collection(db, "testAttempts");
      let q = query(
        attemptsRef,
        where("userId", "==", userId),
        where("submittedAt", "!=", null),
        orderBy("submittedAt", "asc"),
      );

      if (testType && testType !== "all") {
        q = query(
          attemptsRef,
          where("userId", "==", userId),
          where("testType", "==", testType),
          where("submittedAt", "!=", null),
          orderBy("submittedAt", "asc"),
        );
      }

      const querySnapshot = await getDocs(q);

      const progress = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        progress.push({
          score: data.score,
          testType: data.testType,
          testName: data.testName,
          submittedAt: data.submittedAt?.toDate(),
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
        });
      });

      const progressWithImprovement = progress.map((attempt, index) => {
        let improvement = 0;
        if (index > 0) {
          improvement = attempt.score - progress[index - 1].score;
        }

        return {
          date: attempt.submittedAt,
          score: attempt.score,
          testType: attempt.testType,
          testName: attempt.testName,
          accuracy:
            attempt.totalQuestions > 0
              ? Math.round(
                  (attempt.correctAnswers / attempt.totalQuestions) * 100,
                )
              : 0,
          improvement,
        };
      });

      const firstScore = progress.length > 0 ? progress[0].score : 0;
      const latestScore =
        progress.length > 0 ? progress[progress.length - 1].score : 0;
      const overallProgress = latestScore - firstScore;

      return {
        progress: progressWithImprovement,
        metrics: {
          overallProgress,
          totalTests: progress.length,
          firstScore,
          latestScore,
          improvementRate:
            progress.length > 1
              ? (overallProgress / progress.length).toFixed(1)
              : 0,
        },
      };
    } catch (error) {
      console.error("❌ Progress over time error:", error);
      return rejectWithValue(error.message || "Failed to fetch progress data");
    }
  },
);

export const getTestComparison = createAsyncThunk(
  "dashboard/getTestComparison",
  async (userId, { rejectWithValue }) => {
    try {
      const userAttemptsRef = collection(db, "testAttempts");
      const userQuery = query(userAttemptsRef, where("userId", "==", userId));
      const userSnapshot = await getDocs(userQuery);

      const userAttempts = [];
      userSnapshot.forEach((doc) => {
        userAttempts.push({ id: doc.id, ...doc.data() });
      });

      const userStatsMap = {};
      userAttempts.forEach((attempt) => {
        const testType = attempt.testType || "General";
        if (!userStatsMap[testType]) {
          userStatsMap[testType] = {
            scores: [],
            totalAttempts: 0,
          };
        }
        userStatsMap[testType].scores.push(attempt.score || 0);
        userStatsMap[testType].totalAttempts++;
      });

      const userStatsFormatted = {};
      Object.keys(userStatsMap).forEach((testType) => {
        const stats = userStatsMap[testType];
        const avgScore =
          stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
        const key = testType.toLowerCase().replace(/\s+/g, "_");
        userStatsFormatted[key] = Math.round(avgScore);
      });

      const allAttemptsRef = collection(db, "testAttempts");
      const allSnapshot = await getDocs(allAttemptsRef);

      const allAttempts = [];
      const uniqueUsers = new Set();

      allSnapshot.forEach((doc) => {
        const data = doc.data();
        allAttempts.push(data);
        uniqueUsers.add(data.userId);
      });

      const avgStatsMap = {};
      allAttempts.forEach((attempt) => {
        const testType = attempt.testType || "General";
        if (!avgStatsMap[testType]) {
          avgStatsMap[testType] = {
            scores: [],
          };
        }
        avgStatsMap[testType].scores.push(attempt.score || 0);
      });

      const averageStatsFormatted = {};
      Object.keys(avgStatsMap).forEach((testType) => {
        const stats = avgStatsMap[testType];
        const avgScore =
          stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
        const key = testType.toLowerCase().replace(/\s+/g, "_");
        averageStatsFormatted[key] = Math.round(avgScore);
      });

      const strengths = [];
      const weaknesses = [];

      Object.keys(userStatsFormatted).forEach((key) => {
        const userScore = userStatsFormatted[key];
        const avgScore = averageStatsFormatted[key] || 0;
        const difference = userScore - avgScore;

        const testType = Object.keys(userStatsMap).find(
          (type) => type.toLowerCase().replace(/\s+/g, "_") === key,
        );

        if (difference > 10) strengths.push(testType);
        else if (difference < -5) weaknesses.push(testType);
      });

      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const totalUsersCount = usersSnapshot.size;

      const userTestsCount = userAttempts.length;
      const percentile =
        totalUsersCount > 0
          ? Math.min(99, Math.round((userTestsCount / totalUsersCount) * 100))
          : 50;

      return {
        userStats: userStatsFormatted,
        averageStats: averageStatsFormatted,
        percentile,
        strengths,
        weaknesses,
        totalTestsTaken: userTestsCount,
      };
    } catch (error) {
      console.error("❌ Test comparison error:", error);
      return rejectWithValue(
        error.message || "Failed to fetch comparison data",
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    performanceOverview: null,
    testAttempts: [],
    testHistory: [],
    progressOverTime: null,
    testComparison: null,
    currentAttempt: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.performanceOverview = null;
      state.testAttempts = [];
      state.testHistory = [];
      state.progressOverTime = null;
      state.testComparison = null;
      state.currentAttempt = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTestHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.testHistory = action.payload.history;
      })
      .addCase(getTestHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getPerformanceOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPerformanceOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceOverview = action.payload;
      })
      .addCase(getPerformanceOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getTestAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.testAttempts = action.payload;
      })
      .addCase(getTestAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.testAttempts = [];
      });

    builder
      .addCase(getProgressOverTime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgressOverTime.fulfilled, (state, action) => {
        state.loading = false;
        state.progressOverTime = action.payload;
      })
      .addCase(getProgressOverTime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getTestComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.testComparison = action.payload;
      })
      .addCase(getTestComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getTestAttemptById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentAttempt = null;
      })
      .addCase(getTestAttemptById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
      })
      .addCase(getTestAttemptById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAttempt = null;
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
