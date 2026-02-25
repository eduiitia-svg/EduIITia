import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllQuestionPapersByCreator,
  getPapersByType,
  uploadCSVQuestions,
  updateSingleQuestion,
  addQuestionImages,
  deleteQuestionImage as deleteImageAction,
  deleteQuestion as deleteQuestionAction,
  deleteQuestionPaper as deleteQuestionPaperAction,
  clearPapers,
  addExplanationImages,
  deleteExplanationImage as deleteExplanationImageAction,
} from "../slices/questionSlice";
import {
  getTestAttemptsByAdmin,
  resetTestAttempts,
} from "../slices/attemptSlice";
import { getAllCategories } from "../slices/categorySlice";
import toast from "react-hot-toast";
const AdminContext = createContext();
export const AdminProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { papers: questionPapers, loading: papersLoading } = useSelector(
    (state) => state.questions,
  );
  const { user } = useSelector((state) => state.auth);
  const { testAttempts } = useSelector((state) => state.attempts);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category,
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    const initializeAdmin = async () => {
      if (!user) {
        setIsAuthenticated(false);
        setIsInitializing(false);
        dispatch(clearPapers());
        return;
      }
      if (user.role !== "admin" && user.role !== "superadmin") {
        setIsAuthenticated(false);
        setIsInitializing(false);
        dispatch(clearPapers());
        return;
      }
      setIsAuthenticated(true);
      try {
        dispatch(clearPapers());
        const [categoriesResult, papersResult] = await Promise.all([
          dispatch(getAllCategories()).unwrap(),
          dispatch(getAllQuestionPapersByCreator()).unwrap(),
        ]);
      } catch (error) {
        console.error("❌ Error loading admin data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsInitializing(false);
      }
    };
    initializeAdmin();
  }, [user, dispatch]);
  useEffect(() => {
    setFilteredPapers(questionPapers);
  }, [questionPapers]);
  const fetchCategories = async () => {
    try {
      await dispatch(getAllCategories()).unwrap();
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };
  const fetchQuestionPapers = async () => {
    try {
      const result = await dispatch(getAllQuestionPapersByCreator()).unwrap();
      return result;
    } catch (error) {
      console.error("Error fetching question papers:", error);
      toast.error("Failed to load question papers");
      throw error;
    }
  };
  const fetchPapersByType = async (testType) => {
    try {
      const result = await dispatch(
        getPapersByType({ testType, filterByCreator: true }),
      ).unwrap();
      setFilteredPapers(result.data);
      return result.data;
    } catch (error) {
      console.error("Error fetching papers by type:", error);
      toast.error("Failed to filter papers");
      throw error;
    }
  };
  const fetchTestAttempts = async (testId) => {
    try {
      await dispatch(resetTestAttempts());
      const result = await dispatch(getTestAttemptsByAdmin(testId)).unwrap();
      return result;
    } catch (error) {
      console.error("Error fetching test attempts:", error);
      toast.error("Failed to load test attempts");
      throw error;
    }
  };
  const uploadCSV = async (data) => {
    try {
      let payload;
      if (data instanceof FormData) {
        payload = {
          testName: data.get("testName"),
          title: data.get("title"),
          instructions: data.get("instructions"),
          makeTime: data.get("makeTime"),
          testType: data.get("testType") || "multiple_choice",
          csvFile: data.get("csvFile"),
          categoryId: data.get("categoryId"),
          categoryName: data.get("categoryName"),
          subject: data.get("subject"),
          subcategory: data.get("subcategory") || null,
          scheduledStartTime: data.get("scheduledStartTime") || null,
        };
      } else {
        payload = {
          testName: data.testName,
          title: data.title,
          instructions: data.instructions,
          makeTime: data.makeTime,
          testType: data.testType || "multiple_choice",
          questions: data.questions,
          uploadedViaAI: data.uploadedViaAI || false,
          originalFileName: data.originalFileName,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          subject: data.subject,
          subcategory: data.subcategory || null,
          scheduledStartTime: data.scheduledStartTime || null,
        };
      }
      const result = await dispatch(uploadCSVQuestions(payload)).unwrap();
      await fetchQuestionPapers();
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error || "Failed to upload questions";
      toast.error(errorMessage);
      throw error;
    }
  };
  const updateQuestion = async (testId, questionIndex, updates) => {
    try {
      const result = await dispatch(
        updateSingleQuestion({ testId, questionIndex, updates }),
      ).unwrap();
      await fetchQuestionPapers();
      toast.success("Question updated successfully");
      return result;
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
      throw error;
    }
  };
  const addQuestionImagesHandler = async ({
    testId,
    questionIndex,
    imageFiles,
  }) => {
    try {
      const result = await dispatch(
        addQuestionImages({ testId, questionIndex, imageFiles }),
      ).unwrap();
      await fetchQuestionPapers();
      toast.success("Images added successfully");
      return result;
    } catch (error) {
      console.error("Error adding question images:", error);
      toast.error("Failed to add images");
      throw error;
    }
  };
  const deleteQuestionImage = async (testId, questionIndex, imageIndex) => {
    try {
      const result = await dispatch(
        deleteImageAction({ testId, questionIndex, imageIndex }),
      ).unwrap();
      await fetchQuestionPapers();
      toast.success("Image deleted successfully");
      return result;
    } catch (error) {
      console.error("Error deleting question image:", error);
      toast.error("Failed to delete image");
      throw error;
    }
  };

  const addExplanationImagesHandler = async ({
    testId,
    questionIndex,
    imageFiles,
  }) => {
    try {
      const result = await dispatch(
        addExplanationImages({ testId, questionIndex, imageFiles }),
      ).unwrap();
      await fetchQuestionPapers();
      toast.success("Explanation images added successfully");
      return result;
    } catch (error) {
      console.error("Error adding explanation images:", error);
      toast.error("Failed to add explanation images");
      throw error;
    }
  };

  const deleteExplanationImageHandler = async (
    testId,
    questionIndex,
    imageIndex,
  ) => {
    try {
      const result = await dispatch(
        deleteExplanationImageAction({ testId, questionIndex, imageIndex }),
      ).unwrap();
      await fetchQuestionPapers();
      toast.success("Explanation image deleted successfully");
      return result;
    } catch (error) {
      console.error("Error deleting explanation image:", error);
      toast.error("Failed to delete explanation image");
      throw error;
    }
  };

  const deleteQuestion = async (testId, questionIndex) => {
    try {
      const result = await dispatch(
        deleteQuestionAction({ testId, questionIndex }),
      ).unwrap();
      await fetchQuestionPapers();
      toast.success("Question deleted successfully");
      return result;
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
      throw error;
    }
  };
  const deleteQuestionPaper = async (testId) => {
    try {
      const result = await dispatch(deleteQuestionPaperAction(testId)).unwrap();
      await fetchQuestionPapers();
      toast.success("Question paper deleted successfully");
      return result;
    } catch (error) {
      console.error("Error deleting question paper:", error);
      toast.error("Failed to delete question paper");
      throw error;
    }
  };
  const filterPapers = (type) => {
    if (type === "all") {
      setFilteredPapers(questionPapers);
    } else {
      const filtered = questionPapers.filter(
        (paper) => paper.testType === type,
      );
      setFilteredPapers(filtered);
    }
  };
  const filterPapersByCategory = (categoryId) => {
    if (categoryId === "all") {
      setFilteredPapers(questionPapers);
    } else {
      const filtered = questionPapers.filter(
        (paper) => paper.categoryId === categoryId,
      );
      setFilteredPapers(filtered);
    }
  };
  const filterPapersByCategoryAndSubject = (categoryId, subject) => {
    if (categoryId === "all") {
      setFilteredPapers(questionPapers);
    } else if (subject === "all" || !subject) {
      const filtered = questionPapers.filter(
        (paper) => paper.categoryId === categoryId,
      );
      setFilteredPapers(filtered);
    } else {
      const filtered = questionPapers.filter(
        (paper) => paper.categoryId === categoryId && paper.subject === subject,
      );
      setFilteredPapers(filtered);
    }
  };
  const value = {
    loading: papersLoading || categoriesLoading || isInitializing,
    isAuthenticated,
    questionPapers,
    filteredPapers,
    testAttempts,
    selectedPaper,
    activeTab,
    categories,
    setActiveTab,
    setSelectedPaper,
    fetchQuestionPapers,
    fetchPapersByType,
    fetchTestAttempts,
    fetchCategories,
    uploadCSV,
    updateQuestion,
    deleteQuestionImage,
    deleteQuestion,
    deleteQuestionPaper,
    filterPapers,
    filterPapersByCategory,
    filterPapersByCategoryAndSubject,
    addQuestionImages: addQuestionImagesHandler,
    addExplanationImages: addExplanationImagesHandler,
    deleteExplanationImage: deleteExplanationImageHandler,
  };
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
