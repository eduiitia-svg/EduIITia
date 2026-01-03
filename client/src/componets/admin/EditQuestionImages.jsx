import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Image,
  UploadCloud,
  AlertCircle,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";

const EditQuestionImages = ({ paper, questionIndex, onClose }) => {
  const { addQuestionImages } = useAdmin();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage({ type: "error", text: "Please select at least one image" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

      await addQuestionImages({
        testId: paper.id,
        questionIndex,
        imageFiles: formData,
      });
      setMessage({ type: "success", text: "Images uploaded successfully!" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          "Error uploading images: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-99">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-white/10 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full text-gray-900 dark:text-gray-200"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black/20 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <Image
                className="text-purple-600 dark:text-purple-400"
                size={20}
              />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Media to Question
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
                Select Images
              </label>
              <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 rounded-lg p-8 text-center bg-gray-50 dark:bg-black/30 hover:bg-gray-100 dark:hover:bg-black/40 transition-colors focus-within:border-emerald-500/80">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="text-emerald-600 dark:text-emerald-500 mb-3 flex justify-center">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {files.length > 0
                      ? `${files.length} file(s) ready`
                      : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">
                    Accepts: JPG, PNG (Max 5MB per file)
                  </p>
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
                  Selected Files:
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-300 dark:border-white/10"
                    >
                      <span className="text-sm text-gray-800 dark:text-gray-300 truncate flex-1 mr-2">
                        <Image
                          size={14}
                          className="inline mr-2 text-purple-600 dark:text-purple-400"
                        />
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-300 dark:border-white/10">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0f0f0f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Transmitting...
                  </div>
                ) : (
                  "Upload Media"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditQuestionImages;
