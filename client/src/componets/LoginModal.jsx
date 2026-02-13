import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError, clearMessage } from "../slices/authSlice";
import { getTeacherSubscriptionStatus } from "../slices/subscriptionSlice";
import { X } from "lucide-react";
import { useNavigate } from "react-router"; 

const LoginModal = ({
  setShowLogin,
  setShowSignup,
  setShowForgot,
  onClose,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { loading, error, message, isAuthenticated, user } = useSelector( 
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated && user) { 
      const checkTeacherSubscription = async () => {
        if (user.role === "admin") {
          
          try {
            const subscriptionStatus = await dispatch(
              getTeacherSubscriptionStatus(user.uid)
            ).unwrap();

            if (!subscriptionStatus.hasSubscription || !subscriptionStatus.isActive) {
              
              toast.success("Login successful! Please choose a subscription plan.");
              onClose();
              setShowLogin(false);
              setShowSignup(false);
              
              setTimeout(() => {
                navigate("/teacher-pricing");
              }, 1000);
            } else {
             
              toast.success("Login successful!");
              onClose();
              setShowLogin(false);
              setShowSignup(false);
            }
          } catch (error) {
            console.error("Error checking teacher subscription:", error);
       
            toast.success("Login successful! Please verify your subscription.");
            onClose();
            setShowLogin(false);
            setShowSignup(false);
            
            setTimeout(() => {
              navigate("/teacher-pricing");
            }, 1000);
          }
        } else {
          toast.success("Login successful!");
          onClose();
          setShowLogin(false);
          setShowSignup(false);
        }
      };

      checkTeacherSubscription();
    }
  }, [isAuthenticated, user, onClose, setShowLogin, setShowSignup, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl w-[95%] sm:w-[900px] overflow-hidden relative animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-[#10b981] dark:hover:text-[#10b981] text-2xl font-bold transition-all z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-emerald-100 to-teal-50 dark:from-[#10b981]/10 dark:to-[#059669]/5 p-12 items-center justify-center relative overflow-hidden">
            <img
              src="/login.svg"
              alt="EduIITia Learning"
              className="w-full max-w-md relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 sm:p-12">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center p-2">
                  <img
                    src="/logo.svg"
                    alt="EduIITia Logo"
                    className="w-full h-full rounded-md object-contain"
                  />
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-xl">
                  EduIITia
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Login to continue your EduIITia learning journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="flex justify-end">
                <span
                  className="text-sm text-[#10b981] hover:text-[#059669] dark:hover:text-[#059669] cursor-pointer transition-colors"
                  onClick={() => {
                    setShowLogin(false);
                    setShowForgot(true);
                  }}
                >
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-lg font-semibold text-base shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setShowLogin(false);
                    setShowSignup(true);
                  }}
                  className="text-[#10b981] font-medium cursor-pointer hover:text-[#059669] transition-colors"
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;