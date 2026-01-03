import { motion } from "motion/react";
import { AlertCircle, Trash2, X } from "lucide-react";

export const DeleteImageToast = ({ onConfirm, onCancel, imageIndex }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-md px-4"
    >
      <div className="bg-linear-to-br from-[#0a3d35] to-[#051f1b] border border-emerald-500/30 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 animate-pulse pointer-events-none" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="text-red-400" size={24} />
            </div>

            <div className="flex-1 pt-1">
              <h3 className="text-white font-semibold text-lg mb-1">
                Delete Image?
              </h3>
              <p className="text-gray-400 text-sm">
                This action cannot be undone. Image {imageIndex + 1} will be
                permanently removed.
              </p>
            </div>

            <button
              onClick={onCancel}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl text-white font-medium transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
