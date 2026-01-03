import { useDispatch, useSelector } from 'react-redux';
import * as leaderboardActions from '../slices/leaderboardSlice';

export const useLeaderboard = () => {
  const dispatch = useDispatch();
  const leaderboard = useSelector((state) => state.leaderboard);
  
  return {
    ...leaderboard,
    getLeaderboard: (testId) => dispatch(leaderboardActions.getLeaderboard(testId)),
    getAllTests: () => dispatch(leaderboardActions.getAllTestsWithStatus()),
    getStats: () => dispatch(leaderboardActions.getUserLeaderboardStats()),
    clearLeaderboard: () => dispatch(leaderboardActions.clearLeaderboard()),
  };
};