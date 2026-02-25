import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  Loader2,
} from "lucide-react";

const InstructionModal = ({ test, onCancel, onConfirm }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/70 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-[#0A0A0A] rounded-3xl max-w-lg w-full p-8 border border-gray-200 dark:border-emerald-500/30 shadow-[0_0_50px_rgba(52,211,153,0.15)]"
      >
        <div className="flex flex-col items-center mb-6">
          <BookOpen
            className="w-10 h-10 mb-3 text-emerald-600 dark:text-emerald-400"
            strokeWidth={1.5}
          />
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 text-center">
            Test Instructions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-xs">
            Please review the guidelines before starting your{" "}
            {test?.testName || "Chemistry"}.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Total Questions:{" "}
              <span className="text-emerald-600 dark:text-emerald-300">
                {test?.totalQuestions || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Duration:{" "}
              <span className="text-emerald-600 dark:text-emerald-300">
                {test?.makeTime || "N/A"} mins
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#111111] rounded-xl p-5 max-h-[250px] overflow-y-auto border border-gray-200 dark:border-white/5 text-sm space-y-3 custom-scrollbar">
            <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
              The timer will begin automatically once you click "Start Test".
              Ensure stable internet.
            </p>
            <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <ArrowRightCircle className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
              You can navigate between questions using the sidebar question
              palette and mark questions for review.
            </p>

            <p className="text-yellow-700 dark:text-yellow-400 flex items-start gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-500 shrink-0" />
              <span className="flex-1">
                Do <strong className="ml-1">NOT refresh or close</strong> this
                tab during the test. Switching tabs may result in automatic
                submission.
              </span>
            </p>

            <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
              Click the Submit Test button only after you have attempted all
              questions and are ready to conclude.
            </p>
            <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <XCircle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-500 shrink-0" />
              Once submitted, you cannot retake this specific test instance.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start space-x-3">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mt-1 w-5 h-5 appearance-none rounded-md border-2 border-emerald-600 checked:bg-emerald-600 checked:border-transparent transition-all cursor-pointer shadow-md"
            style={{ minWidth: "1.25rem" }}
          />
          <label
            htmlFor="agree"
            className="text-sm leading-snug text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            I have read and fully understood all the instructions and agree to
            strictly follow the test guidelines.
          </label>
        </div>

        <div className="flex justify-between space-x-3 mt-8">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" /> Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!agreed || loading}
            className={`px-8 py-2.5 cursor-pointer rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              agreed && !loading
                ? "bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 dark:to-teal-500 text-white dark:text-black hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transform hover:scale-[1.02]"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-300 dark:border-gray-600"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Starting...
              </>
            ) : (
              <>
                Start Test <ArrowRightCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
      <style>
        {`
        input[type="checkbox"]:checked:after {
          content: '✓';
          display: block;
          color: #0A0A0A;
          font-size: 14px;
          font-weight: 900;
          line-height: 20px;
          text-align: center;
        }
      `}
      </style>
    </div>
  );
};

export default InstructionModal;
