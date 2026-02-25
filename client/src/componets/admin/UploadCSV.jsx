import React, { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Type,
  FileText,
  Loader2,
  X,
  FileType,
  Sparkles,
  Brain,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Papa from "papaparse";
import { setLoading } from "../../slices/questionSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../slices/categorySlice";
import {
  checkTeacherTestCreationAccess,
  incrementMockTestCount,
} from "../../slices/subscriptionSlice";
import toast from "react-hot-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const UploadCSV = () => {
  const { uploadCSV, loading, fetchQuestionPapers } = useAdmin();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { user } = useSelector((state) => state.auth);
  const { teacherSubscription } = useSelector((state) => state.subscription);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const [formData, setFormData] = useState({
    testName: "",
    title: "",
    instructions: "",
    makeTime: "",
    scheduledStartTime: "",
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadMode, setUploadMode] = useState("csv");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const testTypes = [
    { value: "multiple_choice", label: "Multiple Choice (MCQ)", icon: "📝" },
    { value: "demo", label: "Demo Test", icon: "🎯" },
    { value: "mock", label: "Mock Test", icon: "🎓" },
  ];

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

      if (uploadMode === "csv" && fileExtension !== "csv") {
        setMessage({
          type: "error",
          text: "Please select a CSV file for traditional upload.",
        });
        return;
      }

      if (
        uploadMode === "ai" &&
        !["csv", "pdf", "txt", "doc", "docx"].includes(fileExtension)
      ) {
        setMessage({
          type: "error",
          text: "Supported formats: CSV, PDF, TXT, DOC, DOCX",
        });
        return;
      }

      setFile(selectedFile);
      setMessage({ type: "", text: "" });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileExtension = droppedFile.name.split(".").pop().toLowerCase();

      if (uploadMode === "csv" && fileExtension !== "csv") {
        setMessage({
          type: "error",
          text: "Please select a CSV file for traditional upload.",
        });
        return;
      }

      if (
        uploadMode === "ai" &&
        !["csv", "pdf", "txt", "doc", "docx"].includes(fileExtension)
      ) {
        setMessage({
          type: "error",
          text: "Supported formats: CSV, PDF, TXT, DOC, DOCX",
        });
        return;
      }

      setFile(droppedFile);
      setMessage({ type: "", text: "" });
    }
  };

  const cleanPDFText = (text) => {
    text = text.replace(/\s+/g, " ");
    text = text.replace(/Page\s+\d+/gi, "");
    text = text.replace(/^\d+\s*$/gm, "");
    text = text.replace(/Model Question Paper/gi, "");
    text = text.replace(/Time Allowed.*?Max.*?Marks.*?\d+/gi, "");
    return text.trim();
  };

  const handlePDFUpload = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      fullText = cleanPDFText(fullText);
      return fullText;
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error("Failed to process PDF: " + error.message);
    }
  };

  const handleDOCXUpload = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("DOCX processing error:", error);
      throw new Error("Failed to process DOCX: " + error.message);
    }
  };

  const parseCSVDirectly = async (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const questions = results.data.map((row) => {
            const correct =
              row.correctAnswer || row.answer || row.Answer || row.correct;
            return {
              questionText: row.questionText || row.question || row.Question,
              optionA: row.optionA || row.A || row.a || row["Option A"],
              optionB: row.optionB || row.B || row.b || row["Option B"],
              optionC: row.optionC || row.C || row.c || row["Option C"],
              optionD: row.optionD || row.D || row.d || row["Option D"],
              questionLevel:
                row.questionLevel || row.level || row.difficulty || "Medium",
              correctAnswer:
                correct?.toUpperCase() === "A"
                  ? row.optionA
                  : correct?.toUpperCase() === "B"
                    ? row.optionB
                    : correct?.toUpperCase() === "C"
                      ? row.optionC
                      : correct?.toUpperCase() === "D"
                        ? row.optionD
                        : correct,
              explanation: row.explanation || row.Explanation || null,
            };
          });

          const validQuestions = questions.filter(
            (q) =>
              q.questionText &&
              q.optionA &&
              q.optionB &&
              q.optionC &&
              q.optionD,
          );

          resolve(validQuestions);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          reject(new Error("Failed to parse CSV: " + error.message));
        },
      });
    });
  };

  const splitIntoChunks = (text, chunkSize) => {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (const word of words) {
      if (currentLength + word.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [word];
        currentLength = word.length;
      } else {
        currentChunk.push(word);
        currentLength += word.length + 1;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
    }

    return chunks.length > 0 ? chunks : [text];
  };

  const parseFileWithAI = async (fileContent, fileName) => {
    try {
      const chunks = splitIntoChunks(fileContent, 3000);
      let allQuestions = [];

      for (let i = 0; i < chunks.length; i++) {
        const prompt = `
        You are an expert academic assistant and data parser. Your job is to read the provided document text and extract multiple-choice questions (MCQs) into structured JSON.

        ━━━━━━━━━━━━━━━━━━━━━━
        INPUT FORMAT & NATURE
        ━━━━━━━━━━━━━━━━━━━━━━
        - The input text comes from an exam PDF/DOCX/CSV.
        - It may include noise, such as headers, page numbers, instructions, etc.
        - Your job is to extract only clean questions + options + explanations (if available).

        ━━━━━━━━━━━━━━━━━━━━━━
        STRICT FILTERING RULES (IGNORE COMPLETELY)
        ━━━━━━━━━━━━━━━━━━━━━━
        MODEL QUESTION PAPER
        CLASS XII / Board Name / Institute Name
        "General Instructions", "Time Allowed", "Max Marks"
        Section headers → Part A / Part B / Section-C etc.
        "Choose the correct answer", "Attempt any 10", marks like (1M)
        Page numbers, footers, watermarks

        ━━━━━━━━━━━━━━━━━━━━━━
        QUESTION EXTRACTION RULES
        ━━━━━━━━━━━━━━━━━━━━━━
        ✔ Detect MCQs using numbering: (1., 2., 3.) or (Q1, Q2, etc.)
        ✔ Each question must contain exactly 4 options
        ✔ Options formats may be:
            (A)/(B)/(C)/(D)  OR  A/B/C/D  OR a/b/c/d
        ✔ Remove option labels – keep text only
        ✔ If option continues across lines, merge properly
        ✔ Math notation must remain unchanged (sin θ, π, ∈ etc.)

        ━━━━━━━━━━━━━━━━━━━━━━
        ANSWER LOGIC (VERY IMPORTANT)
        ━━━━━━━━━━━━━━━━━━━━━━
        1. Solve question logically and independently.
        2. Correct answer must be **option text, not A/B/C**.
        3. If confident, give answer normally.
        4. If no clear answer → choose most logical option.
        5. Every item requires difficulty level (Easy / Medium / Hard).

        ━━━━━━━━━━━━━━━━━━━━━━
         EXPLANATION EXTRACTION (CRITICAL)
        ━━━━━━━━━━━━━━━━━━━━━━
        If question contains explanation, solution, or reasoning section:
        ✔ Extract the explanation/solution/reasoning
        ✔ Summarize into 2–4 lines max
        ✔ Must be clean, concise and readable
        ✔ If NO explanation exists → return null
        ✔ Include "Explanation:" or "Solution:" prefix if present
        ✔ This field is IMPORTANT and must not be skipped

        ━━━━━━━━━━━━━━━━━━━━━━
        FINAL OUTPUT FORMAT (REQUIRED)
        ━━━━━━━━━━━━━━━━━━━━━━
        Return ONLY valid JSON — no markdown, no commentary.

        {
        "questions": [
            {
            "questionText": "Question text without numbering",
            "optionA": "Option text",
            "optionB": "Option text",
            "optionC": "Option text",
            "optionD": "Option text",
            "correctAnswer": "Exact matching option text",
            "questionLevel": "Medium",
            "explanation": "Concise explanation/solution if available, else null"
            }
        ]
        }

        ━━━━━━━━━━━━━━━━━━━━━━

        PROCESSING CHUNK (${i + 1}/${chunks.length}):

        ${chunks[i]}

        IMPORTANT: Extract ALL questions including their explanations from this chunk. Do not skip unless invalid or incomplete.
        `;

        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

        const response = await fetch(import.meta.env.VITE_API_CALL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are a precise JSON data extractor. Output ONLY valid JSON with no markdown formatting. Extract ALL questions from the provided content including their explanations.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.1,
            max_tokens: 16000,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Groq API request failed:", error);
          throw new Error(error.error?.message || "Groq API request failed");
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        content = content.trim();
        if (content.startsWith("```json")) {
          content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (content.startsWith("```")) {
          content = content.replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(content);
        const questions = Array.isArray(parsed)
          ? parsed
          : parsed.questions || [];
        allQuestions = allQuestions.concat(questions);
      }

      if (allQuestions.length === 0) {
        throw new Error(
          "No questions found in the document. Please check if the document contains properly formatted multiple-choice questions.",
        );
      }
      return allQuestions;
    } catch (error) {
      console.error("AI Parsing Error:", error);
      throw new Error("Failed to parse document: " + error.message);
    }
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleAIUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    if (
      !formData.testName ||
      !formData.title ||
      !formData.makeTime ||
      !formData.testType ||
      !selectedCategoryId ||
      !selectedSubject
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields including category and subject",
      });
      return;
    }
    if (user.role === "admin") {
      try {
        const selectedCat = categories.find(
          (cat) => cat.id === selectedCategoryId,
        );

        const checkResult = await dispatch(
          checkTeacherTestCreationAccess({
            userId: user.uid,
            testDetails: {
              mainCategory: selectedCat?.mainCategory,
              examType: selectedCat?.type,
              subject: selectedSubject,
              classLevel: selectedCat?.name || null,
              subcategory: selectedSubcategory || null,
            },
          }),
        ).unwrap();

        if (!checkResult.canCreate) {
          toast.error(checkResult.reason);
          setMessage({ type: "error", text: checkResult.reason });
          return;
        }
      } catch (error) {
        console.error("Subscription check error:", error);
        toast.error("Failed to verify subscription: " + error);
        setMessage({ type: "error", text: "Failed to verify subscription" });
        return;
      }
    }

    setAiProcessing(true);
    setMessage({ type: "info", text: "🤖 AI is analyzing your document..." });

    try {
      const fileName = file.name.toLowerCase();
      let fileContent;
      let questions;

      if (fileName.endsWith(".pdf")) {
        setMessage({ type: "info", text: "📄 Extracting text from PDF..." });
        fileContent = await handlePDFUpload(file);
        setMessage({
          type: "info",
          text: "🤖 AI is parsing questions from PDF...",
        });
        questions = await parseFileWithAI(fileContent, file.name);
      } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        setMessage({ type: "info", text: "📄 Extracting text from DOCX..." });
        fileContent = await handleDOCXUpload(file);
        setMessage({
          type: "info",
          text: "🤖 AI is parsing questions from DOCX...",
        });
        questions = await parseFileWithAI(fileContent, file.name);
      } else if (fileName.endsWith(".csv")) {
        setMessage({ type: "info", text: "📊 Parsing CSV file..." });
        try {
          questions = await parseCSVDirectly(file);
          if (questions.length === 0) {
            throw new Error("No valid questions found in CSV");
          }
          setMessage({ type: "info", text: "✅ CSV parsed successfully!" });
        } catch (csvError) {
          setMessage({ type: "info", text: "🤖 Using AI to parse CSV..." });
          fileContent = await readFileContent(file);
          questions = await parseFileWithAI(fileContent, file.name);
        }
      } else {
        setMessage({ type: "info", text: "📝 Reading text file..." });
        fileContent = await readFileContent(file);
        setMessage({ type: "info", text: "🤖 AI is parsing questions..." });
        questions = await parseFileWithAI(fileContent, file.name);
      }

      setParsedQuestions(questions);
      setShowPreview(true);

      setMessage({
        type: "success",
        text: `🎉 Successfully extracted ${questions.length} questions! Review and confirm.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: "❌ Error: " + error.message,
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      testName: "",
      title: "",
      instructions: "",
      makeTime: "",
      testType: "multiple_choice",
      scheduledStartTime: "",
    });
    setFile(null);
    setSelectedCategoryId("");
    setSelectedSubject("");
    setSelectedSubcategory("");
    setParsedQuestions([]);
    setShowPreview(false);

    const fileInput = document.getElementById("csvFile");
    if (fileInput) fileInput.value = "";
  };

  const handleTraditionalUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a CSV file" });
      return;
    }

    if (
      !formData.testName ||
      !formData.title ||
      !formData.makeTime ||
      !formData.testType ||
      !selectedCategoryId ||
      !selectedSubject
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields including category and subject",
      });
      return;
    }

    if (user.role === "admin") {
      try {
        const selectedCat = categories.find(
          (cat) => cat.id === selectedCategoryId,
        );

        const checkResult = await dispatch(
          checkTeacherTestCreationAccess({
            userId: user.uid,
            testDetails: {
              mainCategory: selectedCat?.mainCategory,
              examType: selectedCat?.type,
              subject: selectedSubject,
              classLevel: selectedCat?.name || null,
              subcategory: selectedSubcategory || null,
            },
          }),
        ).unwrap();

        if (!checkResult.canCreate) {
          toast.error(checkResult.reason);
          setMessage({ type: "error", text: checkResult.reason });
          return;
        }
      } catch (error) {
        console.error("Subscription check error:", error);
        toast.error("Failed to verify subscription: " + error);
        setMessage({ type: "error", text: "Failed to verify subscription" });
        return;
      }
    }

    dispatch(setLoading(true));
    try {
      const submitData = new FormData();
      submitData.append("csvFile", file);
      submitData.append("testName", formData.testName);
      submitData.append("title", formData.title);
      submitData.append("instructions", formData.instructions);
      submitData.append("makeTime", formData.makeTime);
      submitData.append("testType", formData.testType);

      submitData.append("categoryId", selectedCategoryId);
      const selectedCat = categories.find(
        (cat) => cat.id === selectedCategoryId,
      );
      submitData.append("categoryName", selectedCat?.name || "");
      submitData.append("subject", selectedSubject);

      if (selectedSubcategory) {
        submitData.append("subcategory", selectedSubcategory);
      }

      if (formData.scheduledStartTime) {
        submitData.append("scheduledStartTime", formData.scheduledStartTime);
      }

      await uploadCSV(submitData);
      await fetchQuestionPapers();

      if (user.role === "admin") {
        try {
          await dispatch(incrementMockTestCount(user.uid)).unwrap();
          toast.success("Questions uploaded successfully!");
        } catch (incrementError) {
          console.error("Failed to increment test count:", incrementError);
          toast.warning("Test uploaded but count update failed");
        }
      } else {
        toast.success("Questions uploaded successfully!");
      }

      setMessage({ type: "success", text: "Questions uploaded successfully!" });
      resetForm();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Error uploading questions: " +
          (error.response?.data?.message || error.message),
      });
      toast.error(
        "Upload failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleConfirmAIQuestions = async () => {
    if (!selectedCategoryId || !selectedSubject) {
      setMessage({
        type: "error",
        text: "Please select a category and subject before confirming",
      });
      return;
    }

    dispatch(setLoading(true));
    try {
      const selectedCat = categories.find(
        (cat) => cat.id === selectedCategoryId,
      );

      const submitData = {
        testName: formData.testName,
        title: formData.title,
        instructions: formData.instructions,
        makeTime: formData.makeTime,
        testType: formData.testType,
        questions: parsedQuestions,
        uploadedViaAI: true,
        originalFileName: file.name,
        categoryId: selectedCategoryId,
        categoryName: selectedCat?.name || "",
        subject: selectedSubject,
        ...(formData.scheduledStartTime && {
          scheduledStartTime: formData.scheduledStartTime,
        }),
      };

      if (selectedSubcategory) {
        submitData.subcategory = selectedSubcategory;
      }

      await uploadCSV(submitData);
      await fetchQuestionPapers();

      if (user.role === "admin") {
        try {
          await dispatch(incrementMockTestCount(user.uid)).unwrap();
          toast.success(
            `AI-parsed questions uploaded successfully! ${parsedQuestions.length} questions added.`,
          );
        } catch (incrementError) {
          console.error("Failed to increment test count:", incrementError);
          toast.warning("Test uploaded but count update failed");
        }
      } else {
        toast.success(
          `AI-parsed questions uploaded successfully! ${parsedQuestions.length} questions added.`,
        );
      }

      setMessage({
        type: "success",
        text: `AI-parsed questions uploaded successfully! ${parsedQuestions.length} questions added.`,
      });

      resetForm();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Error uploading questions: " +
          (error.response?.data?.message || error.message),
      });
      toast.error(
        "Upload failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleModeSwitch = (newMode) => {
    setUploadMode(newMode);
    setFile(null);
    setShowPreview(false);
    setMessage({ type: "", text: "" });
    setParsedQuestions([]);

    const fileInput = document.getElementById("csvFile");
    if (fileInput) {
      fileInput.value = "";
      fileInput.type = "file";
      fileInput.type = "file";
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );

  const selectedSubjectObj = selectedCategory?.subjects.find((subj) => {
    const subjName = typeof subj === "string" ? subj : subj.name;
    return subjName === selectedSubject;
  });

  const availableSubcategories =
    selectedSubjectObj && typeof selectedSubjectObj === "object"
      ? selectedSubjectObj.subcategories || []
      : [];

  const inputClasses =
    "w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-600";
  const labelClasses =
    "block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2 ml-1";

  return (
    <div className="min-h-screen rounded-2xl text-gray-900 dark:text-white p-6 md:p-8 bg-gray-50 dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Upload Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-500 mt-2">
            Choose traditional CSV upload or AI-powered document parsing
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleModeSwitch("csv")}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              uploadMode === "csv"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/20"
            }`}
          >
            <FileSpreadsheet className="mx-auto mb-2" size={24} />
            <div className="font-semibold">Traditional CSV</div>
            <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
              Structured format upload
            </div>
          </button>

          <button
            onClick={() => handleModeSwitch("ai")}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              uploadMode === "ai"
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/20"
            }`}
          >
            <Brain className="mx-auto mb-2" size={24} />
            <div className="font-semibold flex items-center justify-center gap-2">
              AI Parser <Sparkles size={14} className="text-purple-400" />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
              PDF, DOCX, TXT, CSV
            </div>
          </button>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
                  message.type === "error"
                    ? "bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-400"
                    : message.type === "info"
                      ? "bg-blue-100 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/20 text-blue-700 dark:text-blue-400"
                      : "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle size={20} />
                ) : message.type === "info" ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                {message.text}
                <button
                  type="button"
                  onClick={() => setMessage({ type: "", text: "" })}
                  className="ml-auto hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelClasses}>
                <Type size={14} className="inline mr-2" /> Test Name
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                required
                className={inputClasses}
                placeholder="e.g. Physics Unit 1"
              />
            </div>

            <div>
              <label className={labelClasses}>
                <FileText size={14} className="inline mr-2" /> Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={inputClasses}
                placeholder="Enter display title"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClasses}>Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows={3}
              className={inputClasses}
              placeholder="Enter guidelines for the students..."
            />
          </div>

          <div>
            <label className={labelClasses}>
              <BookOpen size={14} className="inline mr-2" /> Test Type *
            </label>
            <select
              name="testType"
              value={formData.testType}
              onChange={handleInputChange}
              className={`${inputClasses} appearance-none cursor-pointer`}
              required
            >
              {testTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-white dark:bg-gray-900"
                >
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-500 my-2 ml-1">
              {formData.testType === "demo" &&
                "✨ Demo tests are free for all users"}
              {formData.testType === "multiple_choice" &&
                "Standard MCQ format with 4 options"}
              {formData.testType === "mock" && "Full-length simulation test"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={labelClasses}>
                <Clock size={14} className="inline mr-2" /> Time Limit (min)
              </label>
              <input
                type="number"
                name="makeTime"
                value={formData.makeTime}
                onChange={handleInputChange}
                required
                min="1"
                className={inputClasses}
                placeholder="60"
              />
            </div>

            <div>
              <label className={labelClasses}>Exam Category *</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedSubject("");
                  setSelectedSubcategory("");
                }}
                className={`${inputClasses} appearance-none cursor-pointer`}
                required
              >
                <option value="" className="bg-white dark:bg-gray-900">
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-white dark:bg-gray-900"
                  >
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClasses}>Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedSubcategory("");
                }}
                className={`${inputClasses} appearance-none cursor-pointer`}
                required
                disabled={!selectedCategoryId}
              >
                <option value="" className="bg-white dark:bg-gray-900">
                  {!selectedCategoryId
                    ? "Select a category first"
                    : "Select Subject"}
                </option>
                {selectedCategory?.subjects.map((subject) => {
                  const subjName =
                    typeof subject === "string" ? subject : subject.name;
                  return (
                    <option
                      key={subjName}
                      value={subjName}
                      className="bg-white dark:bg-gray-900"
                    >
                      {subjName}
                    </option>
                  );
                })}
              </select>
              {!selectedCategoryId && (
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-2 ml-1">
                  Please select a category to see available subjects
                </p>
              )}
            </div>
            <div>
              <label className={labelClasses}>
                Subcategory
                <span className="text-gray-500 dark:text-gray-600 ml-1">
                  (Optional)
                </span>
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className={`${inputClasses} appearance-none cursor-pointer`}
                disabled={
                  !selectedSubject || availableSubcategories.length === 0
                }
              >
                <option value="" className="bg-white dark:bg-gray-900">
                  {!selectedSubject
                    ? "Select a subject first"
                    : availableSubcategories.length === 0
                      ? "No subcategories available"
                      : "Select Subcategory (Optional)"}
                </option>
                {availableSubcategories.map((subcat) => (
                  <option
                    key={subcat}
                    value={subcat}
                    className="bg-white dark:bg-gray-900"
                  >
                    {subcat}
                  </option>
                ))}
              </select>
              {selectedSubject && availableSubcategories.length === 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-2 ml-1">
                  This subject has no subcategories
                </p>
              )}
              {selectedSubcategory && (
                <div className="mt-2 flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/10 p-2 rounded-lg border border-teal-300 dark:border-teal-500/20">
                  <ChevronRight size={12} />
                  Questions will be uploaded to: {selectedSubject} →{" "}
                  {selectedSubcategory}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              <Clock size={14} className="inline mr-2" /> Scheduled Start Time
            </label>
            <input
              type="datetime-local"
              name="scheduledStartTime"
              value={formData.scheduledStartTime}
              onChange={handleInputChange}
              className={inputClasses}
            />
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 ml-1">
              Leave empty to make available immediately
            </p>
          </div>

          <div className="mb-8">
            <label className={labelClasses}>
              {uploadMode === "csv"
                ? "CSV Data Source"
                : "Document File (AI will parse)"}
            </label>
            <div
              className={`relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                dragActive
                  ? uploadMode === "ai"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-emerald-500 bg-emerald-500/10"
                  : file
                    ? uploadMode === "ai"
                      ? "border-purple-500/50 bg-purple-100 dark:bg-purple-900/10"
                      : "border-emerald-500/50 bg-emerald-100 dark:bg-emerald-900/10"
                    : "border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 hover:border-gray-400 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-black/40"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="csvFile"
                type="file"
                accept={
                  uploadMode === "csv" ? ".csv" : ".csv,.pdf,.txt,.doc,.docx"
                }
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="flex flex-col items-center justify-center pointer-events-none">
                {file ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${
                        uploadMode === "ai"
                          ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                          : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      }`}
                    >
                      <FileType size={32} />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        uploadMode === "ai"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {uploadMode === "ai"
                        ? "Ready for AI parsing"
                        : "Ready to upload"}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div
                      className={`w-16 h-16 bg-gray-200 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-all duration-300 shadow-lg ${
                        uploadMode === "ai"
                          ? "group-hover:text-purple-600 dark:group-hover:text-purple-400"
                          : "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      }`}
                    >
                      <Upload size={30} />
                    </div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Drag and drop {uploadMode === "csv" ? "CSV" : "document"}{" "}
                      file
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-500 mt-2 mb-4">
                      or click to browse from device
                    </p>
                    <span
                      className={`px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors font-medium ${
                        uploadMode === "ai"
                          ? "group-hover:bg-purple-600 dark:group-hover:bg-purple-500"
                          : "group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500"
                      } group-hover:text-white dark:group-hover:text-black`}
                    >
                      Select File
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500 bg-gray-100 dark:bg-white/5 p-3 rounded-lg border border-gray-300 dark:border-white/5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  uploadMode === "ai" ? "bg-purple-500" : "bg-emerald-500"
                }`}
              ></span>
              {uploadMode === "csv"
                ? "Format: questionText, optionA, optionB, optionC, optionD, correctAnswer, questionLevel"
                : "AI will intelligently extract questions from any format"}
            </div>
          </div>

          {uploadMode === "csv" ? (
            <button
              onClick={handleTraditionalUpload}
              disabled={loading}
              className="w-full relative group overflow-hidden bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Processing Data...
                </div>
              ) : (
                "Deploy Questions"
              )}
            </button>
          ) : (
            <button
              onClick={handleAIUpload}
              disabled={loading || !file}
              className="w-full relative group overflow-hidden bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full"></div>
              {aiProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  AI is analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Brain size={20} />
                  {aiProcessing ? "AI is analyzing..." : "Parse with AI"}
                </div>
              )}
            </button>
          )}
        </div>

        <AnimatePresence>
          {showPreview && parsedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Preview AI-Parsed Questions
                  </h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Found {parsedQuestions.length} questions. Review and confirm.
                </p>

                <div className="space-y-4 mb-6">
                  {parsedQuestions.slice(0, 5).map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {idx + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white mb-3">
                            {q.questionText}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {["A", "B", "C", "D"].map((letter) => (
                              <div
                                key={letter}
                                className={`p-2 rounded ${
                                  q.correctAnswer === letter
                                    ? "bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50"
                                    : "bg-gray-50 dark:bg-white/5"
                                }`}
                              >
                                <span className="font-bold text-gray-600 dark:text-gray-400">
                                  {letter}:
                                </span>{" "}
                                {q[`option${letter}`]}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-500">
                            Level: {q.questionLevel} | Correct:{" "}
                            {q.correctAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {q.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                        <BookOpen size={12} />
                        Explanation:
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                  {parsedQuestions.length > 5 && (
                    <p className="text-center text-gray-600 dark:text-gray-500 text-sm">
                      ... and {parsedQuestions.length - 5} more questions
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 py-3 bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAIQuestions}
                    disabled={loading}
                    className="flex-1 py-3 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Uploading...
                      </div>
                    ) : (
                      "Confirm & Upload"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UploadCSV;
