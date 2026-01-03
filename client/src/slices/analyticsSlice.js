import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getTestAnalytics = createAsyncThunk(
  'analytics/getTestAnalytics',
  async (testId, { rejectWithValue }) => {
    try {
      const attemptsRef = collection(db, 'testAttempts');
      const q = query(
        attemptsRef,
        where('testId', '==', testId),
        where('submittedAt', '!=', null)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('No attempts found for this test');
      }

      const attempts = [];
      querySnapshot.forEach(doc => {
        attempts.push(doc.data());
      });

      const scores = attempts.map(a => a.score || 0);
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const averageScore = (totalScore / scores.length).toFixed(2);
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);

      const sortedAttempts = attempts.sort((a, b) => (b.score || 0) - (a.score || 0));
      const topPerformers = [];

      for (let i = 0; i < Math.min(5, sortedAttempts.length); i++) {
        const attempt = sortedAttempts[i];
        topPerformers.push({
          name: attempt.userName || 'Unknown',
          score: attempt.score || 0,
        });
      }

      return {
        testId,
        totalAttempts: attempts.length,
        averageScore,
        highestScore,
        lowestScore,
        topPerformers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserComparison = createAsyncThunk(
  'analytics/getUserComparison',
  async ({ userId, testType }, { rejectWithValue }) => {
    try {
      const attemptsRef = collection(db, 'testAttempts');
      let q;

      if (testType) {
        q = query(
          attemptsRef,
          where('userId', '==', userId),
          where('testType', '==', testType),
          where('submittedAt', '!=', null),
          orderBy('submittedAt', 'asc')
        );
      } else {
        q = query(
          attemptsRef,
          where('userId', '==', userId),
          where('submittedAt', '!=', null),
          orderBy('submittedAt', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      const data = [];

      querySnapshot.forEach(doc => {
        const attempt = doc.data();
        data.push({
          testName: attempt.testName || 'Unknown Test',
          testType: attempt.testType,
          score: attempt.score || 0,
          date: attempt.submittedAt?.toDate(),
        });
      });

      return {
        userId,
        total: data.length,
        history: data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    testAnalytics: null,
    userComparison: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.testAnalytics = null;
      state.userComparison = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTestAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.testAnalytics = action.payload;
      })
      .addCase(getTestAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserComparison.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.userComparison = action.payload;
      })
      .addCase(getUserComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;