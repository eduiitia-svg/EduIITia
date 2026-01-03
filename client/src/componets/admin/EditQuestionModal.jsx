import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import {
  Edit,
  CheckCircle,
  AlertCircle,
  X,
  BookOpen,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const EditQuestionModal = ({ paper, question, index, onClose }) => {
  const { updateQuestion } = useAdmin();
  const [formData, setFormData] = useState({
    questionText: question.questionText,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    questionLevel: question.questionLevel,
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateQuestion(paper.id, index, formData);
      setMessage({ type: "success", text: "Question updated successfully!" });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Error updating question: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center p-4 z-99">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-white/10 backdrop-blur-md rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-200"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-transparent backdrop-blur-lg rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <Edit className="text-emerald-600 dark:text-emerald-500 text-xl" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Protocol Question
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center p-3 rounded-lg mb-6 text-sm font-medium border ${
                    message.type === "error"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/50"
                      : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50"
                  }`}
                >
                  {message.type === "error" ? (
                    <AlertCircle
                      className="mr-2 text-red-600 dark:text-red-500"
                      size={18}
                    />
                  ) : (
                    <CheckCircle
                      className="mr-2 text-emerald-600 dark:text-emerald-500"
                      size={18}
                    />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  <span className="flex items-center space-x-1">
                    <BookOpen
                      className="text-emerald-600 dark:text-emerald-500"
                      size={16}
                    />
                    Question Text{" "}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </span>
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  rows="3"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-500 text-gray-900 dark:text-white transition-colors"
                  placeholder="Enter the question text"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-4">
                  Options{" "}
                  <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <div className="space-y-4">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-emerald-100 dark:bg-emerald-700/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 rounded-full flex items-center justify-center text-sm font-mono shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        required
                        className={`flex-1 px-4 py-3 border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-500 text-gray-900 dark:text-white transition-colors"
placeholder={Enter option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Correct Answer{" "}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/30 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-900 dark:text-white pr-10 transition-colors"
                    >
                      <option value="A" className="bg-white dark:bg-gray-800">
                        Option A
                      </option>
                      <option value="B" className="bg-white dark:bg-gray-800">
                        Option B
                      </option>
                      <option value="C" className="bg-white dark:bg-gray-800">
                        Option C
                      </option>
                      <option value="D" className="bg-white dark:bg-gray-800">
                        Option D
                      </option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Question Level{" "}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.questionLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          questionLevel: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/30 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-900 dark:text-white pr-10 transition-colors"
                    >
                      <option
                        value="Easy"
                        className="bg-white dark:bg-gray-800"
                      >
                        Easy
                      </option>
                      <option
                        value="Medium"
                        className="bg-white dark:bg-gray-800"
                      >
                        Medium
                      </option>
                      <option
                        value="Hard"
                        className="bg-white dark:bg-gray-800"
                      >
                        Hard
                      </option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={updating}
                  className="px-6 py-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0f0f0f] disabled:opacity-50 flex items-center transition-all font-medium"
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" /> Commit Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditQuestionModal;
