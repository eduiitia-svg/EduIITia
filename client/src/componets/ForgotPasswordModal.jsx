import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearError, clearMessage } from "../slices/authSlice";
import { X } from "lucide-react";

const ForgotPasswordModal = ({ setShowForgot, setShowLogin }) => {
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      if (message.includes("Reset email sent")) {
        setTimeout(() => {
          setShowForgot(false);
          setShowLogin(true);
        }, 1500);
      }
    }
  }, [error, message, dispatch, setShowForgot, setShowLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Enter your registered email");
      return;
    }
    try {
      const result = await dispatch(forgotPassword({ email }));
      if (result.type === "auth/forgotPassword/fulfilled") {
        toast.success(result.payload.message);
      }
    } catch (error) {
      if (error.payload) {
        toast.error(error.payload);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl w-[95%] sm:w-[900px] overflow-hidden relative animate-slideUp">
        <button
          onClick={() => {
            setShowForgot(false);
            setShowLogin(true);
          }}
          className="absolute top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-[#10b981] dark:hover:text-[#10b981] text-2xl font-bold transition-all z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-emerald-100 to-teal-50 dark:from-[#10b981]/10 dark:to-[#059669]/5 p-12 items-center justify-center relative overflow-hidden">
            <img
              src="/forgot_password.svg"
              alt="Reset Password"
              className="w-full max-w-md relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-xl">
                  EduIITia
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Forgot Password?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No worries! Enter your registered email and we'll send you a
                reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-lg font-semibold text-base shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Remember your password?{" "}
                <span
                  onClick={() => {
                    setShowForgot(false);
                    setShowLogin(true);
                  }}
                  className="text-[#10b981] font-medium cursor-pointer hover:text-[#059669] transition-colors"
                >
                  Back to Login
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
