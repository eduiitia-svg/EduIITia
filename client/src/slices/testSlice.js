import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const formatTimeSpent = (timeSpent) => {
  if (!timeSpent) return "N/A";
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const calculateAccuracy = (questions) => {
  const totalQuestions = questions?.length || 0;
  if (totalQuestions === 0) return "0%";
  const correctAnswers = questions?.filter((q) => q.isCorrect).length || 0;
  const accuracy = (correctAnswers / totalQuestions) * 100;
  return `${Math.round(accuracy)}%`;
};

const getAllowedCreatorIds = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const userRole = userData.role;

    if (userRole === "superadmin") {
      return null;
    }

    if (userRole === "admin") {
      return [userId];
    }
    if (userRole === "student") {
      if (userData.createdBy) {
        return [userData.createdBy];
      }
      return null;
    }

    return [];
  } catch (error) {
    console.error("Error getting allowed creator IDs:", error);
    return [];
  }
};

export const getAllTestsByCategory = createAsyncThunk(
  "test/getAllTestsByCategory",
  async ({ categoryName, subject, subcategory }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const allowedCreatorIds = await getAllowedCreatorIds(userId);

      const questionsRef = collection(db, "questions");
      let constraints = [];

      const normalizedCategory = categoryName
        ? categoryName.charAt(0).toUpperCase() +
          categoryName.slice(1).toLowerCase()
        : null;

      if (subcategory) {
        constraints.push(where("categoryName", "==", normalizedCategory));
        constraints.push(where("subject", "==", subject));
        constraints.push(where("subcategory", "==", subcategory));
      } else if (subject) {
        constraints.push(where("categoryName", "==", normalizedCategory));
        constraints.push(where("subject", "==", subject));
      } else if (normalizedCategory) {
        constraints.push(where("categoryName", "==", normalizedCategory));
      }

      if (allowedCreatorIds !== null && allowedCreatorIds.length > 0) {
        constraints.push(where("createdBy", "in", allowedCreatorIds));
      }

      const q = query(questionsRef, ...constraints);
      const querySnapshot = await getDocs(q);


      if (querySnapshot.empty) {
        return [];
      }

      const tests = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tests.push({
          id: doc.id,
          ...data,
          totalQuestions: data.questions?.length || 0,
          isDemo:
            data.testType?.toLowerCase() === "demo" || data.isDemo || false,
        });
      });

      return tests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllTests = createAsyncThunk(
  "test/getAllTests",
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const allowedCreatorIds = await getAllowedCreatorIds(userId);

      const questionsRef = collection(db, "questions");
      let q;

      if (allowedCreatorIds !== null && allowedCreatorIds.length > 0) {
        q = query(questionsRef, where("createdBy", "in", allowedCreatorIds));
      } else {
        q = query(questionsRef);
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const tests = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tests.push({
          id: doc.id,
          ...data,
          totalQuestions: data.questions?.length || 0,
          isDemo:
            data.testType?.toLowerCase() === "demo" || data.isDemo || false,
        });
      });

      return tests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkTestAccess = createAsyncThunk(
  "test/checkTestAccess",
  async ({ userId, testId }, { rejectWithValue }) => {
    try {
      const testDoc = await getDoc(doc(db, "questions", testId));
      if (!testDoc.exists()) {
        return rejectWithValue("Test not found");
      }

      const test = testDoc.data();

      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        return rejectWithValue("User not found");
      }

      const userData = userDoc.data();

      if (userData.role === "superadmin") {
        return {
          hasAccess: true,
          reason: "Superadmin access",
        };
      }

      if (userData.role === "admin") {
        if (test.createdBy !== userId) {
          return {
            hasAccess: false,
            reason: "You can only access tests you created",
          };
        }
      }

      if (userData.role === "student" && userData.createdBy) {
        if (test.createdBy !== userData.createdBy) {
          return {
            hasAccess: false,
            reason: "This test is not available for your institute",
          };
        }
      }

      if (["demo", "Demo", "DEMO"].includes(test.testType) || test.isDemo) {
        return {
          hasAccess: true,
          reason: "Demo test - no subscription required",
        };
      }

      if (!userId) {
        return {
          hasAccess: false,
          reason: "Please login to access this test",
        };
      }

      const subscriptions = userData.subscription || [];

      const hasActiveSubscription = subscriptions.some((sub) => {
        if (!sub.isActive || !sub.endDate) return false;
        const endDate = sub.endDate.toDate
          ? sub.endDate.toDate()
          : new Date(sub.endDate);
        return new Date() < endDate;
      });

      if (hasActiveSubscription) {
        return {
          hasAccess: true,
          reason: "Active subscription",
        };
      }

      return {
        hasAccess: false,
        reason: "Please upgrade to PRO or Premium to access this test",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startTest = createAsyncThunk(
  "test/startTest",
  async (testId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const testDoc = await getDoc(doc(db, "questions", testId));
      if (!testDoc.exists()) throw new Error("Test not found");

      const test = testDoc.data();

      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) throw new Error("User not found");

      const userData = userDoc.data();

      if (userData.role === "student" && userData.createdBy) {
        if (test.createdBy !== userData.createdBy) {
          throw new Error("You don't have access to this test");
        }
      }

      if (userData.role === "admin") {
        if (test.createdBy !== userId) {
          throw new Error("You can only access tests you created");
        }
      }

      const safeQuestions = test.questions.map((q, index) => ({
        index,
        questionText: q.questionText,
        options: q.options,
        images: q.images || [],
        questionLevel: q.questionLevel || "Medium",
      }));

      const attemptData = {
        userId,
        testName: test.testName,
        testId: testId,
        testType: test.testType || "unknown",
        totalQuestions: safeQuestions.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        skippedAnswers: 0,
        timeSpent: 0,
        score: 0,
        startedAt: serverTimestamp(),
        submittedAt: null,
        answers: [],
      };

      const attemptRef = await addDoc(
        collection(db, "testAttempts"),
        attemptData
      );

      return {
        attemptId: attemptRef.id,
        testId,
        testName: test.testName,
        testType: test.testType,
        totalQuestions: safeQuestions.length,
        timeLimit: test.timeLimit || test.makeTime || null,
        questions: safeQuestions,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getQuestionByIndex = createAsyncThunk(
  "test/getQuestionByIndex",
  async ({ testId, index }, { rejectWithValue }) => {
    try {
      const testDoc = await getDoc(doc(db, "questions", testId));

      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const test = testDoc.data();

      if (index < 0 || index >= test.questions.length) {
        throw new Error("Invalid question index");
      }

      const question = test.questions[index];

      return {
        index: parseInt(index),
        questionText: question.questionText,
        options: question.options,
        images: question.images || [],
        questionLevel: question.questionLevel || "Medium",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const answerQuestion = createAsyncThunk(
  "test/answerQuestion",
  async (
    { attemptId, questionIndex, selectedAnswer, status },
    { rejectWithValue }
  ) => {
    try {
      const attemptRef = doc(db, "testAttempts", attemptId);
      const attemptDoc = await getDoc(attemptRef);

      if (!attemptDoc.exists()) {
        throw new Error("Attempt not found");
      }

      const attempt = attemptDoc.data();

      const testDoc = await getDoc(doc(db, "questions", attempt.testId));
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const test = testDoc.data();
      const question = test.questions[questionIndex];

      if (!question) {
        throw new Error("Invalid question index");
      }

      const isCorrect = selectedAnswer
        ? question.correctAnswer === selectedAnswer
        : false;

      let answers = attempt.answers || [];
      const existingIndex = answers.findIndex(
        (a) => a.questionIndex === questionIndex
      );

      const answerData = {
        questionIndex,
        questionText: question.questionText,
        selectedAnswer: selectedAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        status: status || "answered",
      };

      if (existingIndex !== -1) {
        answers[existingIndex] = answerData;
      } else {
        answers.push(answerData);
      }

      await updateDoc(attemptRef, { answers });

      return {
        questionIndex,
        selectedAnswer,
        status,
        isCorrect,
        totalAnswered: answers.length,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitTest = createAsyncThunk(
  "test/submitTest",
  async (testId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("userId", "==", userId),
        where("testId", "==", testId),
        where("submittedAt", "==", null)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No attempt found for this test");
      }

      const attemptDoc = querySnapshot.docs[0];
      const attempt = attemptDoc.data();

      const positiveMark = 4;
      const negativeMark = 1;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unattempted = 0;
      let reviewedButNotAnswered = 0;
      let totalScore = 0;

      attempt.answers.forEach((a) => {
        if (!a.selectedAnswer) {
          if (a.status === "review") {
            reviewedButNotAnswered++;
          }
          unattempted++;
        } else {
          if (a.isCorrect) {
            correctAnswers++;
            totalScore += positiveMark;
          } else {
            wrongAnswers++;
            totalScore -= negativeMark;
          }
        }
      });

      const timeSpent = attempt.startedAt
        ? Math.round((Date.now() - attempt.startedAt.toMillis()) / 1000)
        : 0;

      await updateDoc(doc(db, "testAttempts", attemptDoc.id), {
        correctAnswers,
        incorrectAnswers: wrongAnswers,
        skippedAnswers: unattempted,
        timeSpent,
        score: totalScore,
        submittedAt: serverTimestamp(),
      });

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        testStatus: "completed",
        lastTestScore: totalScore,
        totalLearningTime: increment(Math.round(timeSpent / 60)),
        updatedAt: serverTimestamp(),
      });

      return {
        message: "Test submitted successfully",
        totalQuestions: attempt.totalQuestions,
        correct: correctAnswers,
        wrong: wrongAnswers,
        unattempted,
        reviewedButNotAnswered,
        finalScore: totalScore,
        timeSpent: Math.round(timeSpent / 60),
        markingScheme: "+4 for correct, -1 for wrong",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserTestHistory = createAsyncThunk(
  "test/getUserTestHistory",
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("userId", "==", userId),
        orderBy("submittedAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { message: "No test history found", count: 0, history: [] };
      }

      const history = [];

      for (const docSnapshot of querySnapshot.docs) {
        const attempt = docSnapshot.data();

        let testDetails = {};
        if (attempt.testId) {
          const testDoc = await getDoc(doc(db, "questions", attempt.testId));
          if (testDoc.exists()) {
            testDetails = testDoc.data();
          }
        }

        history.push({
          attemptId: docSnapshot.id,
          testName: testDetails.testName || attempt.testName || "Unknown Test",
          testType:
            testDetails.testType || attempt.testType || "multiple_choice",
          totalQuestions:
            testDetails.totalQuestions || attempt.totalQuestions || 0,
          correctAnswers: attempt.correctAnswers || 0,
          score: attempt.score || 0,
          startedAt: attempt.startedAt?.toDate(),
          submittedAt: attempt.submittedAt?.toDate(),
          markingScheme: "+4 for correct, -1 for wrong",
          questions:
            attempt.answers?.map((a, index) => ({
              questionIndex:
                a.questionIndex !== undefined ? a.questionIndex : index,
              questionText: a.questionText || "Question not available",
              selectedAnswer: a.selectedAnswer,
              correctAnswer: a.correctAnswer,
              isCorrect: a.isCorrect,
              status: a.status || "answered",
            })) || [],
        });
      }

      return {
        message: "Test history fetched successfully",
        count: history.length,
        history,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserSummary = createAsyncThunk(
  "test/getUserSummary",
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("userId", "==", userId),
        where("submittedAt", "!=", null)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No test history found");
      }

      const attempts = [];
      querySnapshot.forEach((doc) => {
        attempts.push(doc.data());
      });

      const totalTests = attempts.length;
      const totalScore = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
      const averageScore = (totalScore / totalTests).toFixed(2);
      const bestScore = Math.max(...attempts.map((a) => a.score || 0));
      const worstScore = Math.min(...attempts.map((a) => a.score || 0));
      const lastAttempt = attempts[attempts.length - 1]?.submittedAt?.toDate();

      return {
        totalTests,
        averageScore,
        bestScore,
        worstScore,
        lastAttempt,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const testSlice = createSlice({
  name: "test",
  initialState: {
    tests: [],
    allTestsLoading: false,

    currentTest: null,
    currentQuestion: null,
    currentQuestionIndex: 0,
    answers: {},
    questions: [],
    attemptId: null,
    testId: null,
    testName: null,
    testType: null,
    totalQuestions: 0,
    timeLimit: null,
    startedAt: null,

    submissionResult: null,
    history: [],
    summary: null,

    testAccess: null,

    loading: false,
    error: null,
  },
  reducers: {
    setCurrentQuestionIndex: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    saveAnswerLocally: (state, action) => {
      const { questionIndex, selectedAnswer, status } = action.payload;
      state.answers[questionIndex] = {
        selectedAnswer,
        status,
        timestamp: new Date().toISOString(),
      };
    },
    clearTest: (state) => {
      state.currentTest = null;
      state.currentQuestion = null;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.questions = [];
      state.attemptId = null;
      state.testId = null;
      state.submissionResult = null;
      state.testAccess = null;
    },
    resetError: (state) => {
      state.error = null;
    },
    clearTests: (state) => {
      state.tests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTestsByCategory.pending, (state) => {
        state.allTestsLoading = true;
        state.error = null;
      })
      .addCase(getAllTestsByCategory.fulfilled, (state, action) => {
        state.allTestsLoading = false;
        state.tests = action.payload;
      })
      .addCase(getAllTestsByCategory.rejected, (state, action) => {
        state.allTestsLoading = false;
        state.error = action.payload;
        state.tests = [];
      })

      .addCase(checkTestAccess.fulfilled, (state, action) => {
        state.testAccess = action.payload;
      })
      .addCase(checkTestAccess.rejected, (state, action) => {
        state.testAccess = { hasAccess: false, reason: action.payload };
      })

      .addCase(startTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTest.fulfilled, (state, action) => {
        state.loading = false;
        state.attemptId = action.payload.attemptId;
        state.testId = action.payload.testId;
        state.testName = action.payload.testName;
        state.testType = action.payload.testType;
        state.totalQuestions = action.payload.totalQuestions;
        state.timeLimit = action.payload.timeLimit;
        state.questions = action.payload.questions;
        state.currentQuestionIndex = 0;
        state.startedAt = new Date().toISOString();
        state.answers = {};
      })
      .addCase(startTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getQuestionByIndex.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQuestionByIndex.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
        state.currentQuestionIndex = action.payload.index;
      })
      .addCase(getQuestionByIndex.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(answerQuestion.fulfilled, (state, action) => {
        const { questionIndex, selectedAnswer, status, isCorrect } =
          action.payload;
        state.answers[questionIndex] = {
          selectedAnswer,
          status,
          isCorrect,
          timestamp: new Date().toISOString(),
        };
      })

      .addCase(submitTest.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionResult = action.payload;
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserTestHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserTestHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.history;
      })
      .addCase(getUserTestHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      .addCase(getAllTests.pending, (state) => {
        state.allTestsLoading = true;
        state.error = null;
      })
      .addCase(getAllTests.fulfilled, (state, action) => {
        state.allTestsLoading = false;
        state.tests = action.payload;
      })
      .addCase(getAllTests.rejected, (state, action) => {
        state.allTestsLoading = false;
        state.error = action.payload;
        state.tests = [];
      });
  },
});

export const {
  setCurrentQuestionIndex,
  saveAnswerLocally,
  clearTest,
  resetError,
  clearTests,
} = testSlice.actions;

export default testSlice.reducer;
