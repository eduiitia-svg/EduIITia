import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, clearMessage } from "../slices/authSlice";
import {
  verifyRegistrationCode,
  submitRegistrationRequest,
  clearVerifiedAdmin,
} from "../slices/adminSlice";
import {
  X,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router";

const SignupModal = ({ setShowLogin, setShowSignup, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const urlParams = new URLSearchParams(window.location.search);
  const urlCode = urlParams.get("code");
  const urlEmail = urlParams.get("email");
  const urlName = urlParams.get("name");

  const [signupMode, setSignupMode] = useState(urlCode ? "institute" : null);
  const [selectedRole, setSelectedRole] = useState(null); 

  const [formData, setFormData] = useState({
    name: urlName || "",
    email: urlEmail || "",
    password: "",
    registrationCode: urlCode || "",
  });

  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationStep, setVerificationStep] = useState("code");

  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const { verifiedAdmin, verificationStatus } = useSelector(
    (state) => state.admin,
  );

  useEffect(() => {
    if (urlCode && urlEmail && !verifiedAdmin) {
      setSignupMode("institute");
      handleVerifyApprovedCode(urlCode, urlEmail);
    } else if (urlCode && !verifiedAdmin && !urlEmail) {
      setSignupMode("institute");
      setVerificationStep("code");
    }
  }, [urlCode, urlEmail]);

  const handleVerifyApprovedCode = async (code, email) => {
    setVerifyingCode(true);
    try {
      const verifyResult = await dispatch(
        verifyRegistrationCode({
          code: code,
          email: email,
        }),
      ).unwrap();

      if (verifyResult.status === "approved") {
        setVerificationStep("approved");
        toast.success(
          "Institute verified! Create your password to complete registration.",
        );
      } else if (verifyResult.status === "pending") {
        setVerificationStep("pending");
        toast.error("Your request is still pending approval.");
      } else {
        setVerificationStep("code");
        toast.error("Please submit your registration request first.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStep("code");
    } finally {
      setVerifyingCode(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Account created successfully! You can now login.");
      dispatch(clearVerifiedAdmin());
      onClose();
      setShowSignup(false);
      setShowLogin(true);
    }
  }, [isAuthenticated, onClose, dispatch, setShowSignup, setShowLogin]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "An error occurred";
      toast.error(errorMessage);
      dispatch(clearError());
    }
    if (message && !isAuthenticated) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, isAuthenticated, dispatch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


const handleDirectSignup = async () => {
  if (!selectedRole) {
    toast.error("Please select your role (Student or Teacher)");
    return;
  }

  if (!formData.name || !formData.email || !formData.password) {
    toast.error("Please fill in all fields");
    return;
  }

  if (formData.password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  try {
    const registerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: selectedRole === "teacher" ? "admin" : "student",
      createdBy: null,
      registrationCode: null,
    };

    await dispatch(register(registerData)).unwrap();
    
    if (selectedRole === "teacher") {
     
      toast.success(
        "Teacher account created! Redirecting to pricing plans..."
      );
      
      onClose();
      setShowSignup(false);
      
      setTimeout(() => {
        navigate("/teacher-pricing")
      }, 1000);
    } else {
      toast.success(
        "Account created! You can now login and access demo tests."
      );
    }
  } catch (error) {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message || "Registration failed";
    toast.error(errorMessage);
  }
};

  const handleSubmitRequest = async () => {
    const codeToVerify = formData.registrationCode;
    if (!codeToVerify) {
      toast.error("Please enter a registration code");
      return;
    }
    if (!formData.name || !formData.email) {
      toast.error("Please enter your name and email first");
      return;
    }

    setVerifyingCode(true);
    try {
      const verifyResult = await dispatch(
        verifyRegistrationCode({
          code: codeToVerify,
          email: formData.email,
        }),
      ).unwrap();

      if (verifyResult.status === "approved") {
        setVerificationStep("approved");
        toast.success(
          "Institute verified! Create your password to complete registration.",
        );
      } else if (verifyResult.status === "pending") {
        setVerificationStep("pending");
        toast.error("Your request is pending. Please wait for admin approval.");
      } else if (verifyResult.status === "valid") {
        const submitResult = await dispatch(
          submitRegistrationRequest({
            code: codeToVerify,
            name: formData.name,
            email: formData.email,
          }),
        ).unwrap();

        if (submitResult.status === "pending") {
          setVerificationStep("pending");
          toast.success(
            "Registration request submitted! Check your email once approved.",
          );
        } else if (submitResult.status === "approved") {
          setVerificationStep("approved");
          toast.success(
            "Institute verified! Create your password to complete registration.",
          );
        }
      }
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || "Invalid registration code";
      toast.error(errorMessage);
      dispatch(clearVerifiedAdmin());
      setVerificationStep("code");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!verifiedAdmin || verificationStep !== "approved") {
      toast.error("Please wait for institute approval before signing up");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        createdBy: verifiedAdmin.id,
        registrationCode: formData.registrationCode,
      };

      await dispatch(register(registerData)).unwrap();
      toast.success("Account created! You can now login.");
      dispatch(clearVerifiedAdmin());
    } catch (error) {
      console.log("error in signup model ", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Registration failed";
      toast.error(errorMessage);
      console.log("signup error", error);
    }
  };

  const handleReset = () => {
    dispatch(clearVerifiedAdmin());
    setFormData({ name: "", email: "", password: "", registrationCode: "" });
    setVerificationStep("code");
    setSignupMode(null);
    setSelectedRole(null);
  };

  // Role selection screen (first screen)
  if (!signupMode) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden relative animate-slideUp">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-[#10b981] dark:hover:text-[#10b981] text-2xl font-bold transition-all z-10"
          >
            <X size={18} />
          </button>

          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-[#10b981] rounded-lg flex items-center justify-center p-1.5">
                  <img
                    src="/logo.svg"
                    alt="EduIITia Logo"
                    className="w-full h-full rounded-md object-contain"
                  />
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-lg">
                  EduIITia
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Signup Method
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select how you'd like to create your account
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setSignupMode("direct")}
                className="w-full p-5 bg-gray-50 dark:bg-[#0f0f0f] border-2 border-gray-200 dark:border-[#2a2a2a] hover:border-[#10b981] dark:hover:border-[#10b981] rounded-xl transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#10b981]/10 rounded-lg flex items-center justify-center group-hover:bg-[#10b981]/20 transition-all">
                    <User className="text-[#10b981]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                      Direct Signup
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Sign up instantly as a student or teacher
                    </p>
                    <p className="text-[#10b981] text-xs mt-2 font-medium">
                      ✓ No code required • ✓ Choose your role
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSignupMode("institute")}
                className="w-full p-5 bg-gray-50 dark:bg-[#0f0f0f] border-2 border-gray-200 dark:border-[#2a2a2a] hover:border-[#10b981] dark:hover:border-[#10b981] rounded-xl transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                    <Building2
                      className="text-blue-500 dark:text-blue-400"
                      size={24}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                      Institute Registration
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Register with your institute code for full access
                    </p>
                    <p className="text-blue-500 dark:text-blue-400 text-xs mt-2 font-medium">
                      ✓ Full test access • ✓ Requires approval
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                }}
                className="text-[#10b981] font-medium cursor-pointer hover:text-[#059669] transition-colors"
              >
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Direct signup with role selection
  if (signupMode === "direct") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden relative animate-slideUp">
          <button
            onClick={() => setSignupMode(null)}
            className="absolute top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-[#10b981] dark:hover:text-[#10b981] text-2xl font-bold transition-all z-10"
          >
            <X size={18} />
          </button>

          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-[#10b981] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-lg">
                  EduIITia
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select your role and sign up
              </p>
            </div>

            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-xs mb-2 font-medium">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedRole === "student"
                        ? "border-[#10b981] bg-[#10b981]/10"
                        : "border-gray-300 dark:border-[#2a2a2a] hover:border-[#10b981]"
                    }`}
                  >
                    <GraduationCap
                      className={`mx-auto mb-2 ${
                        selectedRole === "student"
                          ? "text-[#10b981]"
                          : "text-gray-400"
                      }`}
                      size={28}
                    />
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Student
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Take tests & learn
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("teacher")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedRole === "teacher"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-300 dark:border-[#2a2a2a] hover:border-blue-500"
                    }`}
                  >
                    <Briefcase
                      className={`mx-auto mb-2 ${
                        selectedRole === "teacher"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                      size={28}
                    />
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Teacher
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Create mock tests
                    </div>
                  </button>
                </div>
              </div>

            
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <button
                onClick={handleDirectSignup}
                disabled={
                  loading ||
                  !selectedRole ||
                  !formData.name ||
                  !formData.email ||
                  !formData.password
                }
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-[#2a2a2a]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400">
                    OR
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSignupMode("institute")}
                className="w-full py-2.5 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white rounded-lg font-medium text-sm transition-all"
              >
                Sign up with Institute Code
              </button>
            </div>

            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-5">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                }}
                className="text-[#10b981] font-medium cursor-pointer hover:text-[#059669] transition-colors"
              >
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Institute registration flow (unchanged)
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-[950px] overflow-hidden relative animate-slideUp">
        <button
          onClick={() => {
            dispatch(clearVerifiedAdmin());
            setSignupMode(null);
          }}
          className="absolute top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-[#10b981] dark:hover:text-[#10b981] text-2xl font-bold transition-all z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh]">
          <div className="hidden md:flex md:w-[45%] bg-linear-to-br from-emerald-100 to-teal-50 dark:from-[#10b981]/10 dark:to-[#059669]/5 p-10 items-center justify-center relative overflow-hidden">
            <img
              src="/sign_up.svg"
              alt="Join EduIITia"
              className="w-full max-w-sm relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="w-full md:w-[55%] p-6 md:p-8 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-[#10b981] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-lg">
                  EduIITia
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {verificationStep === "approved"
                  ? "Complete Registration"
                  : "Request Access"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {verificationStep === "approved"
                  ? "Create your password to complete registration"
                  : "Submit request for institute approval"}
              </p>
            </div>

            {verificationStep === "code" && (
              <div className="space-y-5">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0"
                      size={18}
                    />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium text-xs mb-0.5">
                        Institute Verification Required
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        Enter details and code. Admin will review your request.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                        Full Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                      Registration Code
                    </label>
                    <input
                      type="text"
                      name="registrationCode"
                      value={formData.registrationCode}
                      onChange={handleChange}
                      placeholder="Enter code (e.g., ABC123XY)"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 transition-all duration-200 uppercase"
                      maxLength={8}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                      Contact your institute administrator to obtain a code.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitRequest}
                    disabled={
                      verifyingCode ||
                      !formData.registrationCode ||
                      !formData.name ||
                      !formData.email
                    }
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingCode ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            )}

            {verificationStep === "pending" && (
              <div className="space-y-5">
                <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <Clock
                    className="text-yellow-500 dark:text-yellow-400 mx-auto mb-3"
                    size={42}
                  />
                  <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">
                    Awaiting Approval
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Your request has been submitted. Admin will review shortly.
                  </p>
                  {verifiedAdmin && (
                    <div className="bg-gray-50 dark:bg-[#0f0f0f] p-3 rounded-lg mb-3">
                      <p className="text-[#10b981] font-medium text-sm">
                        {verifiedAdmin.instituteName}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        Code: {formData.registrationCode}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                    You'll receive an email with a link once approved.
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Email: {formData.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white rounded-lg font-medium text-sm transition-all"
                >
                  Try Different Code
                </button>
              </div>
            )}

            {verificationStep === "approved" && verifiedAdmin && (
              <div className="space-y-5">
                <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      className="text-[#10b981] mt-0.5 shrink-0"
                      size={18}
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium text-xs mb-0.5">
                        ✓ Request Approved
                      </p>
                      <p className="text-[#10b981] font-semibold text-sm">
                        {verifiedAdmin.instituteName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        Create your password to complete registration
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                        Full Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white text-sm"
                        required
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1.5 font-medium">
                      Create Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    disabled={loading || !formData.password}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {loading ? "Creating Account..." : `Create Account`}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-5">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                  dispatch(clearVerifiedAdmin());
                }}
                className="text-[#10b981] font-medium cursor-pointer hover:text-[#059669] transition-colors"
              >
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;