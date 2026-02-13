import React, { useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slices/authSlice";
import {
  getPlans,
  getSubscriptionStatus,
  getAllTeacherPlans,
} from "../../slices/subscriptionSlice";
import { createCheckout, verifyPayment } from "../../slices/paymentSlice";
import { getActiveSubscription } from "../../../utils/subscriptionHelpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  GraduationCap,
  Briefcase,
  Check,
  Zap,
  Sparkles,
  CreditCard,
  BookOpen,
  Clock,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Pricing = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { plans, teacherPlans } = useSelector((state) => state.subscription);
  const { loading: paymentLoading } = useSelector((state) => state.payment);
  const [activating, setActivating] = useState(null);
  const [refreshing, setRefreshing] = useState(true);
  const [activeTab, setActiveTab] = useState("student");
  const hasInitializedRef = useRef(false);
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const activeSubscription = useMemo(() => {
    const active = getActiveSubscription(user?.subscription);
    return active;
  }, [user, user?.subscription]);

  useEffect(() => {
    const fetchFreshUserData = async () => {
      if (!user?.uid) {
        setRefreshing(false);
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const freshUserData = userSnap.data();
          const updatedUser = {
            ...user,
            subscription: freshUserData.subscription || [],
          };
          dispatch(setUser(updatedUser));
          localStorage.setItem("user", JSON.stringify(updatedUser));
          await dispatch(getSubscriptionStatus(user.uid));
        }
      } catch (error) {
        console.error("❌ Error fetching fresh user data:", error);
      } finally {
        setRefreshing(false);
        hasInitializedRef.current = true;
      }
    };
    fetchFreshUserData();
  }, [user?.uid, dispatch]);

  useEffect(() => {
    dispatch(getPlans());
    dispatch(getAllTeacherPlans());
  }, [dispatch]);

  const handleActivate = async (planId) => {
    if (!user?.uid) {
      toast.error("Please login to subscribe");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      setActivating(planId);
      const checkoutResult = await dispatch(
        createCheckout({
          userId: user.uid,
          planId,
          razorpayKeyId: RAZORPAY_KEY_ID,
        }),
      ).unwrap();

      const options = {
        key: checkoutResult.key,
        amount: checkoutResult.amount,
        currency: checkoutResult.currency,
        name: "EduIITia",
        description: `${checkoutResult.plan.name} Plan`,
        order_id: checkoutResult.orderId,
        theme: { color: "#10b981" },
        handler: async function (response) {
          try {
            await dispatch(
              verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
                planId: planId,
              }),
            ).unwrap();

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const freshUserData = userSnap.data();
              const updatedUser = {
                uid: user.uid,
                ...freshUserData,
              };
              dispatch(setUser(updatedUser));
              localStorage.setItem("user", JSON.stringify(updatedUser));
              await dispatch(getSubscriptionStatus(user.uid));
              toast.success("Payment verified successfully!");
            }
            setActivating(null);
          } catch (error) {
            console.error("❌ Payment verification error:", error);
            toast.error(error || "Payment verification failed");
            setActivating(null);
          }
        },
        prefill: {
          name: user?.name || user?.displayName || "EduIITia User",
          email: user?.email || "user@example.com",
          contact: user?.phone || "9999999999",
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled");
            setActivating(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed. Please try again.");
        console.error("❌ Payment failed:", response.error);
        setActivating(null);
      });
      rzp.open();
    } catch (err) {
      console.error("❌ Checkout error:", err);
      toast.error(err || "Failed to start payment.");
      setActivating(null);
    }
  };

  const bestValuePlanId = plans.find((p) => p.duration === 365)?.id || null;
  const displayPlans = activeTab === "student" ? plans : teacherPlans;

  return (
    <div
      id="pricing"
      className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] py-20 px-4 sm:px-6 font-inter"
    >
      <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-4">
            <Sparkles size={14} />
            Upgrade your experience
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Plans that{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              Scale With You
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Unlock comprehensive study materials, unlimited practice, and
            intelligent analytics.
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <div className="p-1.5 bg-gray-200 dark:bg-white/10 rounded-2xl inline-flex relative">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "student"
                  ? "bg-white dark:bg-[#1a1a1a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap size={18} />
              Student
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "teacher"
                  ? "bg-white dark:bg-[#1a1a1a] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Briefcase size={18} />
              Teacher
            </button>
          </div>
        </div>

        {refreshing ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              Loading plans...
            </p>
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 max-w-2xl mx-auto">
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-white/10 mb-4">
              <Info size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Plans Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === "student" ? "Student" : "Teacher"} pricing plans
              are not available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPlans.map((plan) => {
              const isActive = activeSubscription?.plan === plan.id;
              const isPro =
                activeTab === "student" && plan.id === bestValuePlanId;
              const isFree = plan.type === "free";

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={plan.id}
                  className={`group relative flex flex-col bg-white dark:bg-[#111] rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1
                    ${
                      isActive
                        ? "ring-2 ring-emerald-500 shadow-emerald-500/20 shadow-xl"
                        : "border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xl shadow-gray-200/50 dark:shadow-none"
                    }
                    ${isPro ? "lg:scale-105 z-10 ring-1 ring-emerald-400/50" : ""}
                  `}
                >
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/30">
                      Best Value
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <Check size={12} strokeWidth={3} /> Current
                      </span>
                    </div>
                  )}

                  <div className="mb-6 mt-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 h-10 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {isFree ? "Free" : `₹${plan.price}`}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        /{" "}
                        {plan.duration === 365
                          ? "year"
                          : `${plan.duration} days`}
                      </span>
                    </div>

                    {!isFree && activeTab === "student" && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                        {plan.duration === 365
                          ? "Save 17% compared to monthly"
                          : "Billed monthly"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8 min-h-[30px]">
                    {activeTab === "teacher" && (
                      <>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                          <Zap
                            size={14}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            {plan.mockTestLimit === 0
                              ? "Unlimited"
                              : plan.mockTestLimit}{" "}
                            Tests
                          </span>
                        </div>

                        {plan.examType && plan.examType !== "All" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                            <BookOpen
                              size={14}
                              className="text-blue-600 dark:text-blue-400"
                            />
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                              {plan.examType}
                            </span>
                          </div>
                        )}

                        {plan.subject && plan.subject !== "All" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                            <GraduationCap
                              size={14}
                              className="text-purple-600 dark:text-purple-400"
                            />
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                              {plan.subject}
                            </span>
                          </div>
                        )}

                        {plan.classLevel && plan.classLevel !== "All" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                            <Clock
                              size={14}
                              className="text-orange-600 dark:text-orange-400"
                            />
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                              {plan.classLevel}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === "student" && (
                      <>
                        {plan.testLimit !== undefined && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <Zap
                              size={14}
                              className="text-emerald-600 dark:text-emerald-400"
                            />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              {plan.testLimit === 0
                                ? "Unlimited"
                                : plan.testLimit}{" "}
                              Tests
                            </span>
                          </div>
                        )}

                        {plan.subject && plan.subject !== "All" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                            <BookOpen
                              size={14}
                              className="text-blue-600 dark:text-blue-400"
                            />
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                              {plan.subject}
                            </span>
                          </div>
                        )}

                        {plan.subcategory && plan.subcategory !== "All" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                            <GraduationCap
                              size={14}
                              className="text-purple-600 dark:text-purple-400"
                            />
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                              {plan.subcategory}
                            </span>
                          </div>
                        )}

                        {plan.duration === 365 && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                            <Sparkles
                              size={14}
                              className="text-amber-600 dark:text-amber-400"
                            />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              Premium Access
                            </span>
                          </div>
                        )}
                        {plan.mainCategory && plan.mainCategory !== "All" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                            <GraduationCap
                              size={14}
                              className="text-indigo-600 dark:text-indigo-400"
                            />
                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 capitalize">
                              {plan.mainCategory}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="w-full h-px bg-gray-100 dark:bg-white/5 mb-6" />
                  <span className="text-xs font-semibold text-amber-700 mb-6 dark:text-amber-300">
                    Access features
                  </span>
                  <div className="flex-1 mb-8">
                    <ul className="space-y-4">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                            <Check
                              size={12}
                              className="text-emerald-600 dark:text-emerald-400"
                              strokeWidth={3}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    {isFree ? (
                      <button
                        className="w-full py-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-white/5"
                        disabled
                      >
                        Currently Active
                      </button>
                    ) : isActive ? (
                      <button
                        className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-default border border-emerald-100 dark:border-emerald-500/20"
                        disabled
                      >
                        Active Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(plan.id)}
                        disabled={activating === plan.id || paymentLoading}
                        className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-black shadow-lg shadow-gray-200 dark:shadow-none hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {activating === plan.id ? (
                          "Processing..."
                        ) : (
                          <>
                            Get Started <CreditCard size={18} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


