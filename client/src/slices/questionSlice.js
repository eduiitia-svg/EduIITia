import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import {
  uploadCSVToCloudinary,
  uploadMultipleToCloudinary,
} from "../config/cloudinaryUpload";
export const uploadCSVQuestions = createAsyncThunk(
  "questions/uploadCSVQuestions",
  async (
    {
      testName,
      title,
      instructions,
      makeTime,
      testType,
      csvFile,
      questions,
      uploadedViaAI,
      categoryId,
      categoryName,
      subject,
      subcategory,
    },
    { rejectWithValue },
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
      if (!categoryId || !categoryName || !subject) {
        throw new Error("Category and subject are required");
      }
      let parsedQuestions = [];
      let csvUrl = null;
      let csvPublicId = null;
      if (uploadedViaAI && questions) {
        parsedQuestions = questions.map((q) => ({
          questionText: q.questionText || "",
          options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(
            (opt) => opt !== undefined && opt !== null && opt !== "",
          ),
          images: Array.isArray(q.images) ? q.images : [],
          correctAnswer: q.correctAnswer || "",
          questionLevel: q.questionLevel || "Medium",
          ...(q.explanation &&
            q.explanation.trim() !== "" && {
              explanation: q.explanation.trim(),
            }),
        }));
      } else {
        if (!csvFile) {
          throw new Error("CSV file is required");
        }
        const uploadResult = await uploadCSVToCloudinary(csvFile);
        csvUrl = uploadResult.url;
        csvPublicId = uploadResult.publicId;
        const csvText = await csvFile.text();
        const lines = csvText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        if (lines.length < 2) {
          throw new Error(
            "CSV file appears empty or invalid. Please use AI Parser for better results.",
          );
        }
        const headers = lines[0].split(",").map((h) =>
          h
            .trim()
            .toLowerCase()
            .replace(/[_\-\s]/g, "")
            .replace(/['"]/g, ""),
        );
        const findHeader = (possibleNames) => {
          for (let name of possibleNames) {
            const cleanName = name.toLowerCase().replace(/[_\-\s]/g, "");
            const index = headers.findIndex((h) => h.includes(cleanName));
            if (index !== -1) return index;
          }
          return -1;
        };
        const questionIndex = findHeader([
          "question",
          "questiontext",
          "q",
          "ques",
          "problem",
        ]);
        const optionAIndex = findHeader([
          "optiona",
          "option_a",
          "a",
          "choice1",
          "choicea",
        ]);
        const optionBIndex = findHeader([
          "optionb",
          "option_b",
          "b",
          "choice2",
          "choiceb",
        ]);
        const optionCIndex = findHeader([
          "optionc",
          "option_c",
          "c",
          "choice3",
          "choicec",
        ]);
        const optionDIndex = findHeader([
          "optiond",
          "option_d",
          "d",
          "choice4",
          "choiced",
        ]);
        const answerIndex = findHeader([
          "answer",
          "correctanswer",
          "correct",
          "solution",
          "key",
        ]);
        const levelIndex = findHeader([
          "level",
          "difficulty",
          "questionlevel",
          "hardness",
        ]);
        const explanationIndex = findHeader([
          "explanation",
          "solution",
          "hint",
          "answerexplanation",
          "reasoning",
        ]);
        const imagesIndex = findHeader(["images", "image", "pics", "pictures"]);
        if (
          questionIndex === -1 ||
          optionAIndex === -1 ||
          optionBIndex === -1 ||
          optionCIndex === -1 ||
          optionDIndex === -1
        ) {
          throw new Error(
            `Suggestion: Use AI Parser mode for automatic question extraction from any document format.`,
          );
        }
        let successCount = 0;
        let failedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          try {
            const rowValues = [];
            let currentValue = "";
            let insideQuotes = false;
            for (let char of lines[i]) {
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === "," && !insideQuotes) {
                rowValues.push(currentValue.trim());
                currentValue = "";
              } else {
                currentValue += char;
              }
            }
            rowValues.push(currentValue.trim());
            const cleanedValues = rowValues.map((v) =>
              v.replace(/^["']|["']$/g, "").trim(),
            );
            const questionText = cleanedValues[questionIndex] || "";
            const optionA = cleanedValues[optionAIndex] || "";
            const optionB = cleanedValues[optionBIndex] || "";
            const optionC = cleanedValues[optionCIndex] || "";
            const optionD = cleanedValues[optionDIndex] || "";
            if (!questionText || !optionA || !optionB || !optionC || !optionD) {
              console.warn(`Row ${i + 1}: Missing required fields, skipping`);
              failedCount++;
              continue;
            }
            let correctAnswer = "";
            if (answerIndex !== -1) {
              const answerValue = cleanedValues[answerIndex]
                .trim()
                .toUpperCase();
              if (answerValue === "A" || answerValue === "1") {
                correctAnswer = optionA;
              } else if (answerValue === "B" || answerValue === "2") {
                correctAnswer = optionB;
              } else if (answerValue === "C" || answerValue === "3") {
                correctAnswer = optionC;
              } else if (answerValue === "D" || answerValue === "4") {
                correctAnswer = optionD;
              } else {
                const allOptions = [optionA, optionB, optionC, optionD];
                const matchedOption = allOptions.find(
                  (opt) =>
                    opt.toLowerCase().includes(answerValue.toLowerCase()) ||
                    answerValue.toLowerCase().includes(opt.toLowerCase()),
                );
                correctAnswer = matchedOption || optionA;
              }
            } else {
              correctAnswer = optionA;
            }
            const questionLevel =
              levelIndex !== -1
                ? cleanedValues[levelIndex] || "Medium"
                : "Medium";
            const images =
              imagesIndex !== -1 && cleanedValues[imagesIndex]
                ? cleanedValues[imagesIndex]
                    .split(";")
                    .map((img) => img.trim())
                    .filter(Boolean)
                : [];
            const explanation =
              explanationIndex !== -1 ? cleanedValues[explanationIndex] : null;
            const questionData = {
              questionText: questionText,
              options: [optionA, optionB, optionC, optionD].filter(
                (opt) => opt !== undefined && opt !== null && opt !== "",
              ),
              images,
              correctAnswer: correctAnswer,
              questionLevel: questionLevel,
            };
            if (explanation && explanation.trim() !== "") {
              questionData.explanation = explanation.trim();
            }
            parsedQuestions.push(questionData);
            successCount++;
          } catch (rowError) {
            console.warn(`Error parsing row ${i + 1}:`, rowError.message);
            failedCount++;
          }
        }
        if (failedCount > successCount || parsedQuestions.length === 0) {
          throw new Error(
            ` Recommended Solution: Use AI Parser mode for automatic question extraction.
              AI Parser supports: CSV formats.`,
          );
        }
      }
      if (parsedQuestions.length === 0) {
        throw new Error(`Recommended Solution: Please use AI Parser mode .`);
      }
      const userDoc = await getDoc(doc(db, "users", userId));
      let categoryType = null;

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (
          userData.role === "admin" &&
          userData.teacherSubscription?.isActive
        ) {
          const mainCat = userData.teacherSubscription.mainCategory;

          const categoryTypeMap = {
            school: "School",
            entrance: "Entrance",
            recruitment: "Recruitment",
          };

          categoryType = categoryTypeMap[mainCat] || mainCat || null
        } else if (userDoc.data().role === "superadmin") {
          const categoryRef = doc(db, "categories", categoryId);
          const categorySnap = await getDoc(categoryRef);
          if (categorySnap.exists()) {
            categoryType = categorySnap.data().type || null;
          }
        }
      }

      const questionSetData = {
        testName: testName || "",
        title: title || "",
        instructions: instructions || "",
        testType: testType || "multiple_choice",
        makeTime: Number(makeTime) || 0,
        questions: parsedQuestions,
        categoryId,
        categoryName,
        categoryType,
        subject,
        createdBy: userId,
        uploadedViaAI: uploadedViaAI || false,
        createdAt: serverTimestamp(),
      };
      if (subcategory) {
        questionSetData.subcategory = subcategory;
      }
      if (csvUrl) {
        questionSetData.csvFileUrl = csvUrl;
      }
      if (csvPublicId) {
        questionSetData.csvPublicId = csvPublicId;
      }
      const docRef = await addDoc(collection(db, "questions"), questionSetData);
      return {
        success: true,
        message: uploadedViaAI
          ? `AI-parsed questions uploaded successfully! ${parsedQuestions.length} questions added.`
          : `CSV uploaded successfully! ${parsedQuestions.length} questions added.`,
        cloudinaryFile: csvUrl,
        data: {
          id: docRef.id,
          ...questionSetData,
        },
      };
    } catch (error) {
      let errorMessage = error.message;
      if (
        errorMessage.includes("Cannot detect") ||
        errorMessage.includes("format parsing failed") ||
        errorMessage.includes("No valid questions")
      ) {
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue(
          `${errorMessage}
            Having trouble with CSV format? Try using AI Parser mode for automatic question extraction from any document!`,
        );
      }
    }
  },
);
export const uploadAIParsedQuestions = createAsyncThunk(
  "questions/uploadAIParsedQuestions",
  async (
    {
      testName,
      title,
      instructions,
      makeTime,
      testType,
      questions,
      originalFileName,
      categoryId,
      categoryName,
      subject,
      subcategory,
    },
    { rejectWithValue },
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
      if (!questions || questions.length === 0) {
        throw new Error("No questions provided");
      }
      if (!categoryId || !categoryName || !subject) {
        throw new Error("Category and subject are required");
      }
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
        images: q.images || [],
        correctAnswer: q.correctAnswer,
        questionLevel: q.questionLevel || "Medium",
        explanation: q.explanation || null,
      }));
      const questionSetData = {
        testName,
        title,
        instructions,
        testType,
        makeTime: Number(makeTime),
        questions: formattedQuestions,
        categoryId,
        categoryName,
        subject,
        subcategory: subcategory || null,
        createdBy: userId,
        uploadedViaAI: true,
        originalFileName,
        totalQuestions: formattedQuestions.length,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "questions"), questionSetData);
      return {
        success: true,
        message: `Successfully uploaded ${formattedQuestions.length} AI-parsed questions`,
        data: {
          id: docRef.id,
          ...questionSetData,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const updateSingleQuestion = createAsyncThunk(
  "questions/updateSingleQuestion",
  async ({ testId, questionIndex, updates }, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }
      const testData = testDoc.data();
      const questions = testData.questions || [];
      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }
      questions[questionIndex] = {
        ...questions[questionIndex],
        ...updates,
      };
      await updateDoc(testRef, { questions });
      return {
        success: true,
        message: "Question updated successfully",
        data: questions[questionIndex],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const addQuestionImages = createAsyncThunk(
  "questions/addQuestionImages",
  async ({ testId, questionIndex, imageFiles }, { rejectWithValue }) => {
    try {
      const filesArray = imageFiles.getAll("file");
      if (!filesArray || filesArray.length === 0) {
        throw new Error("No image files provided");
      }
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);
      if (!testDoc.exists()) throw new Error("Test not found");
      const testData = testDoc.data();
      const questions = testData.questions || [];
      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }
      const uploadResults = await uploadMultipleToCloudinary(filesArray, {
        folder: "questionImages",
        resourceType: "image",
      });
      const imageUrls = uploadResults.map((r) => r.url);
      questions[questionIndex].images = [
        ...(questions[questionIndex].images || []),
        ...imageUrls,
      ];
      await updateDoc(testRef, { questions });
      return {
        success: true,
        message: "Images added successfully",
        data: questions[questionIndex],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const deleteQuestionImage = createAsyncThunk(
  "questions/deleteQuestionImage",
  async ({ testId, questionIndex, imageIndex }, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }
      const testData = testDoc.data();
      const questions = testData.questions || [];
      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }
      const question = questions[questionIndex];
      if (
        !question.images ||
        imageIndex < 0 ||
        imageIndex >= question.images.length
      ) {
        throw new Error("Image not found");
      }
      question.images.splice(imageIndex, 1);
      questions[questionIndex] = question;
      await updateDoc(testRef, { questions });
      return {
        success: true,
        message: "Image deleted successfully",
        data: {
          testId,
          questionIndex,
          imageIndex,
          updatedQuestion: question,
        },
      };
    } catch (error) {
      console.error("Error deleting question image:", error);
      return rejectWithValue(error.message);
    }
  },
);
export const deleteQuestion = createAsyncThunk(
  "questions/deleteQuestion",
  async ({ testId, questionIndex }, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }
      const testData = testDoc.data();
      const questions = testData.questions || [];
      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }
      questions.splice(questionIndex, 1);
      await updateDoc(testRef, { questions });
      return {
        success: true,
        message: "Question deleted successfully",
        data: {
          testId,
          questionIndex,
          remainingQuestions: questions.length,
        },
      };
    } catch (error) {
      console.error("Error deleting question:", error);
      return rejectWithValue(error.message);
    }
  },
);
export const deleteQuestionPaper = createAsyncThunk(
  "questions/deleteQuestionPaper",
  async (testId, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }
      await deleteDoc(testRef);
      return {
        success: true,
        message: "Question paper deleted successfully",
        data: { testId },
      };
    } catch (error) {
      console.error("Error deleting question paper:", error);
      return rejectWithValue(error.message);
    }
  },
);
export const getAllQuestionPapersByCreator = createAsyncThunk(
  "questions/getAllQuestionPapersByCreator",
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
      const questionsRef = collection(db, "questions");
      const q = query(
        questionsRef,
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this creator",
          data: [],
        };
      }
      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getAllQuestionPapers = createAsyncThunk(
  "questions/getAllQuestionPapers",
  async (filterByCreator = true, { rejectWithValue }) => {
    try {
      const questionsRef = collection(db, "questions");
      let q;
      if (filterByCreator) {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");
        q = query(
          questionsRef,
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(questionsRef, orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return {
        success: true,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getPapersByType = createAsyncThunk(
  "questions/getPapersByType",
  async ({ testType, filterByCreator = true }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;
      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("testType", "==", testType),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          questionsRef,
          where("testType", "==", testType),
          orderBy("createdAt", "desc"),
        );
      }
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return {
          success: false,
          message: `No question papers found for type: ${testType}`,
          data: [],
        };
      }
      const papers = [];
      for (const docSnapshot of querySnapshot.docs) {
        const paper = docSnapshot.data();
        let creatorData = null;
        if (paper.createdBy) {
          const userDoc = await getDoc(doc(db, "users", paper.createdBy));
          if (userDoc.exists()) {
            creatorData = {
              name: userDoc.data().name,
              email: userDoc.data().email,
            };
          }
        }
        papers.push({
          id: docSnapshot.id,
          testName: paper.testName,
          title: paper.title,
          instructions: paper.instructions,
          testType: paper.testType,
          makeTime: paper.makeTime,
          categoryId: paper.categoryId,
          categoryName: paper.categoryName,
          subject: paper.subject,
          subcategory: paper.subcategory || null,
          createdBy: creatorData,
          createdAt: paper.createdAt?.toDate(),
          totalQuestions: paper.questions?.length || 0,
          questions: paper.questions,
        });
      }
      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getPapersByCategory = createAsyncThunk(
  "questions/getPapersByCategory",
  async ({ categoryId, filterByCreator = true }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;
      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          orderBy("createdAt", "desc"),
        );
      }
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this category",
          data: [],
        };
      }
      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getPapersBySubject = createAsyncThunk(
  "questions/getPapersBySubject",
  async (
    { categoryId, subject, filterByCreator = true },
    { rejectWithValue },
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;
      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          orderBy("createdAt", "desc"),
        );
      }
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this subject",
          data: [],
        };
      }
      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getPapersBySubcategory = createAsyncThunk(
  "questions/getPapersBySubcategory",
  async (
    { categoryId, subject, subcategory, filterByCreator = true },
    { rejectWithValue },
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;
      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          where("subcategory", "==", subcategory),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          where("subcategory", "==", subcategory),
          orderBy("createdAt", "desc"),
        );
      }
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this subcategory",
          data: [],
        };
      }
      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
const questionSlice = createSlice({
  name: "questions",
  initialState: {
    papers: [],
    selectedPaper: null,
    loading: false,
    uploadProgress: 0,
    error: null,
  },
  reducers: {
    clearSelectedPaper: (state) => {
      state.selectedPaper = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearPapers: (state) => {
      state.papers = [];
      state.selectedPaper = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadCSVQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadCSVQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        state.papers.unshift(action.payload.data);
      })
      .addCase(uploadCSVQuestions.rejected, (state, action) => {
        state.loading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      .addCase(getAllQuestionPapersByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllQuestionPapersByCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = action.payload.data || [];
      })
      .addCase(getAllQuestionPapersByCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.papers = [];
      })
      .addCase(getAllQuestionPapers.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersByType.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersByCategory.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersBySubject.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersBySubcategory.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(deleteQuestionImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteQuestionImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuestionPaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionPaper.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = state.papers.filter(
          (paper) => paper.id !== action.payload.data.testId,
        );
      })
      .addCase(deleteQuestionPaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const {
  clearSelectedPaper,
  setUploadProgress,
  setLoading,
  clearPapers,
} = questionSlice.actions;
export default questionSlice.reducer;
