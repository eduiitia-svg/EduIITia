import React, { useState, useEffect, useCallback, useRef } from "react";
import "./TestInterface.css";
import { useTest } from "../../hooks/useTest";
import TestNav from "./TestNav";
import { useNavigate } from "react-router-dom";
import Calculator from "./Calculator";
import toast from "react-hot-toast";
import {
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useSelector } from "react-redux";

const TestInterface = () => {
  const {
    attemptId,
    testId,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    timeLimit,
    questions,
    answers: reduxAnswers,
    loading,
    getQuestion,
    answerQuestion,
    submitTest,
    saveAnswerLocally,
    setCurrentQuestionIndex,
  } = useTest();
  const { testName } = useSelector((state) => state.test);

  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [fullScreenWarning, setFullScreenWarning] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPdfSidebar, setShowPdfSidebar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const hasInitialized = useRef(false);
  const isChangingQuestion = useRef(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (timeLimit && timeLeft === 0) {
      setTimeLeft(timeLimit * 60);
    }
  }, [timeLimit]);

  useEffect(() => {
    if (reduxAnswers && Object.keys(reduxAnswers).length > 0) {
      setAnswers(reduxAnswers);

      const answered = new Set(
        Object.keys(reduxAnswers)
          .map(Number)
          .filter((idx) => reduxAnswers[idx]?.selectedAnswer)
      );
      setAnsweredQuestions(answered);

      const marked = new Set(
        Object.keys(reduxAnswers)
          .map(Number)
          .filter((idx) => reduxAnswers[idx]?.status === "review")
      );
      setMarkedQuestions(marked);
    }
  }, [reduxAnswers]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (testId && !hasInitialized.current) {
      hasInitialized.current = true;
      setCurrentQuestionIndex(0);
      getQuestion(testId, 0);
      setVisitedQuestions(new Set([0]));
    }
  }, [testId, getQuestion, setCurrentQuestionIndex]);

  useEffect(() => {
    if (testId && hasInitialized.current && !isChangingQuestion.current) {
      if (currentIndex !== currentQuestionIndex) {
        isChangingQuestion.current = true;
        setCurrentQuestionIndex(currentIndex);
        getQuestion(testId, currentIndex);
        setVisitedQuestions((prev) => new Set([...prev, currentIndex]));

        setTimeout(() => {
          isChangingQuestion.current = false;
        }, 100);
      }
    }
  }, [
    currentIndex,
    currentQuestionIndex,
    testId,
    getQuestion,
    setCurrentQuestionIndex,
  ]);

  const handleAnswerSelect = async (option) => {
    const newAnswers = {
      ...answers,
      [currentIndex]: {
        selectedAnswer: option,
        status: markedQuestions.has(currentIndex) ? "review" : "answered",
      },
    };
    setAnswers(newAnswers);

    const newAnswered = new Set(answeredQuestions);
    newAnswered.add(currentIndex);
    setAnsweredQuestions(newAnswered);

    saveAnswerLocally({
      questionIndex: currentIndex,
      selectedAnswer: option,
      status: markedQuestions.has(currentIndex) ? "review" : "answered",
    });

    if (attemptId) {
      try {
        await answerQuestion({
          attemptId,
          questionIndex: currentIndex,
          selectedAnswer: option,
          status: markedQuestions.has(currentIndex) ? "review" : "answered",
        });
      } catch (err) {
        console.error("Failed to save answer:", err);
      }
    }
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
    setVisitedQuestions((prev) => new Set([...prev, index]));
  };

  const toggleMarkQuestion = async () => {
    const newMarked = new Set(markedQuestions);
    const isNowMarked = !newMarked.has(currentIndex);

    if (isNowMarked) {
      newMarked.add(currentIndex);
    } else {
      newMarked.delete(currentIndex);
    }
    setMarkedQuestions(newMarked);

    const currentAnswer = answers[currentIndex]?.selectedAnswer || null;
    const hasAnswer = answeredQuestions.has(currentIndex);

    saveAnswerLocally({
      questionIndex: currentIndex,
      selectedAnswer: currentAnswer,
      status: isNowMarked ? "review" : hasAnswer ? "answered" : "not_visited",
    });

    if (attemptId) {
      try {
        await answerQuestion({
          attemptId,
          questionIndex: currentIndex,
          selectedAnswer: currentAnswer,
          status: isNowMarked
            ? "review"
            : hasAnswer
            ? "answered"
            : "not_visited",
        });
      } catch (err) {
        console.error("Failed to update mark status:", err);
      }
    }
  };

  const getQuestionStatus = (index) => {
    const isAnswered = answeredQuestions.has(index);
    const isMarked = markedQuestions.has(index);
    const isVisited = visitedQuestions.has(index);

    if (isAnswered && isMarked) {
      return "answered-marked";
    } else if (isMarked && !isAnswered) {
      return "marked";
    } else if (isAnswered) {
      return "answered";
    } else if (isVisited) {
      return "visited";
    }
    return "not-visited";
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    navigate("/dashboard");
  };``

  const handleSubmitTest = useCallback(() => {
    if (showSuccessPopup) {
      handlePopupClose();
      return;
    }
    if (markedQuestions.size > 0) {
      toast(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <AlertOctagon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-purple-400">
                  Cannot Submit Test
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  You have{" "}
                  <span className="text-white font-bold">
                    {markedQuestions.size}
                  </span>{" "}
                  question(s) marked for review.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Please unmark them before submitting.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                  setShowSubmitModal(true);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Submit Anyway
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          style: {
            background: "#0f172a",
            border: "1px solid rgba(168, 85, 247, 0.5)",
            boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.2)",
            maxWidth: "500px",
            padding: "16px",
          },
        }
      );
      return;
    }

    setShowSubmitModal(true);
  }, [markedQuestions, setShowSubmitModal, showSuccessPopup, handlePopupClose]);
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitTest(testId);
      setShowSubmitModal(false);
      setShowSuccessPopup(true);
      toast.success("Test submitted successfully!");
    } catch (err) {
      console.error("Error submitting test:", err);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await submitTest(testId);
      setShowSuccessPopup(true);
      alert("Time's up! Your test has been auto-submitted.");
    } catch (err) {
      console.error("Error auto-submitting test:", err);
      alert("Failed to auto-submit test.");
    } finally {
      setIsSubmitting(false);
    }
  }, [testId, submitTest]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFullScreenWarning(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const SuccessPopup = () => {
    if (!showSuccessPopup) return null;
    return (
      <div className="success-popup-overlay">
        <div className="success-popup">
          <div className="popup-icon">
            <div className="checkmark">✓</div>
          </div>
          <h2 className="popup-title">Mission Complete</h2>
          <p className="popup-message">
            Your assessment has been successfully deployed.
          </p>
          <button className="popup-button" onClick={handlePopupClose}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  };

  if (!attemptId || !testId) {
    return <div className="test-loading">Initializing Environment...</div>;
  }

  return (
    <div className={`test-interface ${!isDarkMode ? "light-mode" : ""}`}>
      <TestNav
        formatTime={formatTime}
        handleSubmitTest={handleSubmitTest}
        testName={testName}
        isSubmitting={isSubmitting}
        currentTest={{ totalQuestions, timeLimit }}
        showSuccessPopup={showSuccessPopup}
        timeLeft={timeLeft}
        showPdfSidebar={showPdfSidebar}
        setShowPdfSidebar={setShowPdfSidebar}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      {fullScreenWarning && (
        <div className="warning-modal">
          <div className="warning-content">
            <h3>Security Alert</h3>
            <p>
              External navigation detected. Continued tab switching will result
              in automatic session termination.
            </p>
            <button onClick={() => setFullScreenWarning(false)}>
              Acknowledge
            </button>
          </div>
        </div>
      )}
      <SuccessPopup />
      {showSubmitModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#020617] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-cyan-500/10 overflow-hidden transform transition-all scale-100">
            <div className="bg-gray-50/50 dark:bg-slate-900/50 p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Submit Test?
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Are you sure you want to finish?
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
                    Answered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {answeredQuestions.size}{" "}
                    <span className="text-sm text-gray-400 dark:text-slate-500 font-normal">
                      / {totalQuestions || 15}
                    </span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mb-1">
                    Unanswered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(totalQuestions || 15) - answeredQuestions.size}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-slate-400 bg-amber-50 dark:bg-slate-900 rounded-lg p-3 border border-amber-100 dark:border-slate-800 flex gap-2">
                <AlertTriangle
                  size={16}
                  className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5"
                />
                <span>Once submitted, you cannot change your answers.</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-700 dark:hover:bg-cyan-400 text-white dark:text-black font-bold shadow-lg shadow-cyan-600/20 dark:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCalculator && <Calculator />}
      <main className="test-main">
        <aside className="question-grid">
          <h3>Navigation Grid</h3>
          <div className="grid-container">
            {Array.from({ length: totalQuestions || 15 }, (_, i) => {
              const status = getQuestionStatus(i);
              return (
                <button
                  key={i}
                  className={`grid-item ${status} ${
                    i === currentIndex ? "active" : ""
                  }`}
                  onClick={() => goToQuestion(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="grid-legend">
            <div className="legend-item">
              <div className="legend-color not-visited"></div>
              <span>Not Visited</span>
            </div>
            <div className="legend-item">
              <div className="legend-color visited"></div>
              <span>Not Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color answered"></div>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color marked"></div>
              <span>Review (Unanswered)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color answered-marked"></div>
              <span>Review (Answered)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color active"></div>
              <span>Current</span>
            </div>
          </div>

          <div className="calculator-section">
            <button
              className="calculator-toggle"
              onClick={() => setShowCalculator(!showCalculator)}
            >
              {showCalculator ? "Deactivate Calculator" : "Activate Calculator"}
            </button>
          </div>
        </aside>

        <section className="question-display">
          {loading ? (
            <div className="loading-question">Loading data stream...</div>
          ) : currentQuestion ? (
            <div className="question-container">
              <div className="question-header">
                <h3>
                  Question {currentIndex + 1}{" "}
                  <span
                    style={{ fontSize: "0.6em", color: "var(--text-muted)" }}
                  >
                    / {totalQuestions || 15}
                  </span>
                </h3>
                <button
                  className={`mark-btn ${
                    markedQuestions.has(currentIndex) ? "marked" : ""
                  }`}
                  onClick={toggleMarkQuestion}
                >
                  {markedQuestions.has(currentIndex)
                    ? "Unmark Review"
                    : "Mark for Review"}
                </button>
              </div>

              <div className="question-content">
                <div
                  className={`question-layout ${
                    currentQuestion.images && currentQuestion.images.length > 0
                      ? "has-images"
                      : ""
                  }`}
                >
                  <div className="question-text-section">
                    <p className="question-text">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  {currentQuestion.images &&
                    currentQuestion.images.length > 0 && (
                      <div className="question-images-section">
                        <div className="images-grid">
                          {currentQuestion.images.map((img, idx) => (
                            <div key={idx} className="image-container">
                              <img
                                src={img}
                                alt={`Diagram ${idx + 1}`}
                                className="question-image"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="options-container">
                  {currentQuestion.options &&
                    currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`option ${
                          answers[currentIndex]?.selectedAnswer === option
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleAnswerSelect(option)}
                      >
                        <span className="option-label">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="option-text">{option}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="question-navigation">
                <button
                  className="nav-btn prev"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="nav-btn next"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min((totalQuestions || 15) - 1, prev + 1)
                    )
                  }
                  disabled={currentIndex === (totalQuestions || 15) - 1}
                >
                  Next Question
                </button>
              </div>
            </div>
          ) : (
            <div className="loading-question">No data available</div>
          )}
        </section>

        <aside className="test-sidebar">
          <div className="sidebar-section">
            <h4>Directives</h4>
            <ul>
              <li>Total Queries: {totalQuestions || 15}</li>
              <li>Time Limit: {timeLimit || 30}m</li>
              <li>Mandatory submission</li>
              <li>Free navigation allowed</li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4>Analytics</h4>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Answered</span>
                <span className="stat-value">{answeredQuestions.size}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Review</span>
                <span
                  className="stat-value"
                  style={{
                    color: markedQuestions.size > 0 ? "#9f7aea" : "white",
                  }}
                >
                  {markedQuestions.size}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Not Answered</span>
                <span className="stat-value">
                  {(totalQuestions || 15) - answeredQuestions.size}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Not Visited</span>
                <span className="stat-value">
                  {(totalQuestions || 15) - visitedQuestions.size}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>
      <div className={`pdf-sidebar ${showPdfSidebar ? "open" : ""}`}>
        <div className="pdf-sidebar-header">
          <div className="pdf-header-content">
            <FileText size={20} />
            <h3>Questions Preview</h3>
          </div>
          <button
            className="pdf-close-btn"
            onClick={() => setShowPdfSidebar(false)}
          >
            ×
          </button>
        </div>

        <div className="pdf-sidebar-content">
          {questions && questions.length > 0 ? (
            questions.map((question, idx) => (
              <div
                key={idx}
                className={`pdf-question-card ${
                  idx === currentIndex ? "current" : ""
                }`}
                onClick={() => {
                  goToQuestion(idx);
                  setShowPdfSidebar(false);
                }}
              >
                <div className="pdf-question-header">
                  <span className="pdf-question-number">Q{idx + 1}</span>
                  <div className="pdf-question-badges">
                    {answeredQuestions.has(idx) && (
                      <span className="badge badge-answered">✓</span>
                    )}
                    {markedQuestions.has(idx) && (
                      <span className="badge badge-marked">⚑</span>
                    )}
                  </div>
                </div>

                <p className="pdf-question-text">{question.questionText}</p>

                {question.images && question.images.length > 0 && (
                  <div className="pdf-question-images">
                    {question.images.map((img, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={img}
                        alt={`Q${idx + 1} diagram`}
                        className="pdf-question-img"
                      />
                    ))}
                  </div>
                )}

                <div className="pdf-options-list">
                  {question.options &&
                    question.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`pdf-option ${
                          answers[idx]?.selectedAnswer === option
                            ? "selected"
                            : ""
                        }`}
                      >
                        <span className="pdf-option-label">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="pdf-option-text">{option}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="pdf-empty">
              <p>No questions available</p>
            </div>
          )}
        </div>
      </div>
      {showPdfSidebar && (
        <div
          className="pdf-backdrop"
          onClick={() => setShowPdfSidebar(false)}
        />
      )}
    </div>
  );
};

export default TestInterface;
