import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const FloatingHelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-linear-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:shadow-xl transition-all"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-20 right-6 z-50 bg-white border border-gray-200 shadow-2xl rounded-2xl w-72 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-semibold">
              💬 Need Help?
            </div>
            <div className="p-4 text-gray-700 text-sm space-y-3">
              <p>
                Hey there 👋 <br />
                How can we assist you today?
              </p>

              <button
                onClick={() => alert("Redirecting to chat support...")}
                className="w-full py-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition"
              >
                Chat with Support
              </button>

              <button
                onClick={() => alert("Opening FAQs...")}
                className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                View FAQs
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Our team typically replies within 1 hour.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingHelpButton;
