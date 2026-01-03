import { useDispatch, useSelector } from 'react-redux';
import * as analyticsActions from '../slices/analyticsSlice';

export const useAnalytics = () => {
  const dispatch = useDispatch();
  const analytics = useSelector((state) => state.analytics);
  
  return {
    ...analytics,
    getTestAnalytics: (testId) => dispatch(analyticsActions.getTestAnalytics(testId)),
    getUserComparison: (userId, testType) => dispatch(analyticsActions.getUserComparison({ userId, testType })),
    clearAnalytics: () => dispatch(analyticsActions.clearAnalytics()),
  };
};