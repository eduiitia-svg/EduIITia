import { useDispatch, useSelector } from 'react-redux';
import * as testActions from '../slices/testSlice';

export const useTest = () => {
  const dispatch = useDispatch();
  const test = useSelector((state) => state.test);
  
  return {
    ...test,
    startTest: (testType) => dispatch(testActions.startTest(testType)),
    getQuestion: (testId, index) => dispatch(testActions.getQuestionByIndex({ testId, index })),
    answerQuestion: (data) => dispatch(testActions.answerQuestion(data)),
    submitTest: (testId) => dispatch(testActions.submitTest(testId)),
    getHistory: () => dispatch(testActions.getUserTestHistory()),
    getSummary: () => dispatch(testActions.getUserSummary()),
    clearTest: () => dispatch(testActions.clearTest()),
    saveAnswerLocally: (data) => dispatch(testActions.saveAnswerLocally(data)),
    setCurrentQuestionIndex: (index) => dispatch(testActions.setCurrentQuestionIndex(index)),
  };
};
