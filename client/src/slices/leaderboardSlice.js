import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const getLeaderboard = createAsyncThunk(
  'leaderboard/getLeaderboard',
  async (testId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const testDoc = await getDoc(doc(db, 'questions', testId));
      if (!testDoc.exists()) {
        throw new Error('Test not found');
      }
      const test = testDoc.data();

      const attemptsRef = collection(db, 'testAttempts');
      const q = query(
        attemptsRef,
        where('testId', '==', testId),
        where('submittedAt', '!=', null),
        orderBy('score', 'desc'),
        orderBy('submittedAt', 'asc')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          message: 'No attempts found for this test',
          testName: test.testName || test.title,
          totalParticipants: 0,
          leaderboard: [],
        };
      }

      const attempts = [];
      for (const docSnapshot of querySnapshot.docs) {
        const attempt = docSnapshot.data();
        
        let userName = 'Unknown';
        let userEmail = 'N/A';
        if (attempt.userId) {
          const userDoc = await getDoc(doc(db, 'users', attempt.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.name || 'Unknown';
            userEmail = userData.email || 'N/A';
          }
        }

        attempts.push({
          ...attempt,
          id: docSnapshot.id,
          userName,
          userEmail,
        });
      }

      const userAttempts = attempts.filter(a => a.userId === userId);
      const userAttempt = userAttempts.length > 0 ? userAttempts[0] : null;

      const leaderboard = attempts.map((attempt, index) => ({
        rank: index + 1,
        name: attempt.userName,
        email: attempt.userEmail,
        score: attempt.score || 0,
        accuracy: calculateAccuracy(attempt.answers || []),
        timeSpent: formatTimeSpent(attempt.timeSpent),
        isCurrentUser: attempt.userId === userId,
      }));

      const currentUserRank = userAttempt
        ? leaderboard.find(entry => entry.isCurrentUser)?.rank
        : null;

      return {
        testName: test.testName || test.title,
        totalParticipants: attempts.length,
        currentUserRank,
        currentUserScore: userAttempt?.score || null,
        currentUserAccuracy: userAttempt ? calculateAccuracy(userAttempt.answers || []) : null,
        leaderboard,
        userHasAttempted: !!userAttempt,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllTestsWithStatus = createAsyncThunk(
  'leaderboard/getAllTestsWithStatus',
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const testsSnapshot = await getDocs(collection(db, 'questions'));
      const allTests = [];
      testsSnapshot.forEach(doc => {
        allTests.push({ id: doc.id, ...doc.data() });
      });

      const attemptsSnapshot = await getDocs(collection(db, 'testAttempts'));
      const attemptedTestIds = new Set();
      const userAttemptedTestIds = new Set();

      attemptsSnapshot.forEach(doc => {
        const attempt = doc.data();
        if (attempt.submittedAt) {
          attemptedTestIds.add(attempt.testId);
          if (attempt.userId === userId) {
            userAttemptedTestIds.add(attempt.testId);
          }
        }
      });

      const testsWithStatus = allTests.map(test => ({
        testId: test.id,
        testName: test.testName,
        title: test.title,
        testType: test.testType,
        topic: test.topic,
        totalQuestions: test.questions?.length || 0,
        createdAt: test.createdAt?.toDate(),
        hasAttempts: attemptedTestIds.has(test.id),
        userHasAttempted: userAttemptedTestIds.has(test.id),
        totalParticipants: Array.from(attemptedTestIds).filter(id => id === test.id).length,
      }));

      return {
        success: true,
        totalTests: testsWithStatus.length,
        tests: testsWithStatus,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserLeaderboardStats = createAsyncThunk(
  'leaderboard/getUserLeaderboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const attemptsRef = collection(db, 'testAttempts');
      const q = query(
        attemptsRef,
        where('userId', '==', userId),
        where('submittedAt', '!=', null)
      );

      const querySnapshot = await getDocs(q);
      const userAttempts = [];
      const participatedTestIds = new Set();

      querySnapshot.forEach(doc => {
        const attempt = doc.data();
        userAttempts.push(attempt);
        participatedTestIds.add(attempt.testId);
      });

      const bestRanks = [];
      for (const testId of participatedTestIds) {
        const testAttemptsQ = query(
          attemptsRef,
          where('testId', '==', testId),
          where('submittedAt', '!=', null),
          orderBy('score', 'desc'),
          orderBy('submittedAt', 'asc')
        );

        const testAttemptsSnapshot = await getDocs(testAttemptsQ);
        let rank = 1;
        testAttemptsSnapshot.forEach(doc => {
          if (doc.data().userId === userId) {
            bestRanks.push(rank);
          }
          rank++;
        });
      }

      const totalAttempts = userAttempts.length;
      const bestRank = bestRanks.length > 0 ? Math.min(...bestRanks) : null;
      const averageScore = totalAttempts > 0
        ? userAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts
        : 0;

      return {
        success: true,
        stats: {
          totalAttempts,
          participatedTests: participatedTestIds.size,
          bestRank,
          averageScore,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    currentLeaderboard: null,
    testName: null,
    totalParticipants: 0,
    currentUserRank: null,
    currentUserScore: null,
    currentUserAccuracy: null,
    userHasAttempted: false,
    allTests: [],
    userStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearLeaderboard: (state) => {
      state.currentLeaderboard = null;
      state.testName = null;
      state.totalParticipants = 0;
      state.currentUserRank = null;
      state.currentUserScore = null;
      state.currentUserAccuracy = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeaderboard = action.payload.leaderboard;
        state.testName = action.payload.testName;
        state.totalParticipants = action.payload.totalParticipants;
        state.currentUserRank = action.payload.currentUserRank;
        state.currentUserScore = action.payload.currentUserScore;
        state.currentUserAccuracy = action.payload.currentUserAccuracy;
        state.userHasAttempted = action.payload.userHasAttempted;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllTestsWithStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTestsWithStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.allTests = action.payload.tests;
      })
      .addCase(getAllTestsWithStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserLeaderboardStats.fulfilled, (state, action) => {
        state.userStats = action.payload.stats;
      });
  }
});

export const { clearLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;