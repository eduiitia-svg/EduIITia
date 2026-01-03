
import { createContext, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startTest as startTestThunk,
  getQuestionByIndex as getQuestionByIndexThunk,
  answerQuestion as answerQuestionThunk,
  submitTest as submitTestThunk,
} from "../slices/testSlice";

export const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const dispatch = useDispatch();
  const testState = useSelector((state) => state.test); 
  const [testnav, setTestnav] = useState(false); 

  
  const startTest = async (testId) => {
    try {
      const result = await dispatch(startTestThunk(testId)).unwrap();
      setTestnav(true);
      return result;
    } catch (err) {
      console.error("Error starting test:", err);
      throw err;
    }
  };

  const getQuestionByIndex = async (testId, index) => {
    try {
      const result = await dispatch(
        getQuestionByIndexThunk({ testId, index })
      ).unwrap();
      return result;
    } catch (err) {
      console.error("Error fetching question:", err);
      throw err;
    }
  };

  const submitAnswer = async ({
    attemptId,
    questionIndex,
    selectedAnswer,
    status,
  }) => {
    try {
      const result = await dispatch(
        answerQuestionThunk({
          attemptId,
          questionIndex,
          selectedAnswer,
          status,
        })
      ).unwrap();
      return result;
    } catch (err) {
      console.error("Error submitting answer:", err);
      throw err;
    }
  };

  const submitTest = async (testId) => {
    try {
      const result = await dispatch(submitTestThunk(testId)).unwrap();
      setTestnav(false);
      return result;
    } catch (err) {
      console.error("Error submitting test:", err);
      throw err;
    }
  };

  return (
    <TestContext.Provider
      value={{
        testState,
        testnav,
        setTestnav,
        startTest,
        getQuestionByIndex,
        submitAnswer,
        submitTest,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) throw new Error("useTest must be used within TestProvider");
  return context;
};
