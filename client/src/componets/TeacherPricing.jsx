import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  BookOpen,
  GraduationCap,
  Clock,
  Info,
  CreditCard,
  Sparkles,
} from "lucide-react";
import {
  getAllTeacherPlans,
  getTeacherSubscriptionStatus,
} from "../slices/subscriptionSlice";
import {
  createTeacherCheckout,
  verifyTeacherPayment,
} from "../slices/teacherPaymentSlice";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { setUser } from "../slices/authSlice";

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

const TeacherPricing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { teacherPlans, teacherSubscription, loading } = useSelector(
    (state) => state.subscription,
  );
  const { loading: paymentLoading } = useSelector(
    (state) => state.teacherPayment,
  );
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    dispatch(getAllTeacherPlans());
    if (user?.uid) {
      dispatch(getTeacherSubscriptionStatus(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (
      teacherSubscription &&
      teacherSubscription.hasSubscription === true &&
      teacherSubscription.isActive === true
    ) {
      toast.success("You already have an active subscription!");
      navigate("/admin/dashboard");
    }
  }, [teacherSubscription, navigate]);

  const handlePurchase = async (planId) => {
    if (!user?.uid) {
      toast.error("Please login first");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setPurchasingPlanId(planId);
    try {
      const checkoutResult = await dispatch(
        createTeacherCheckout({
          userId: user.uid,
          planId,
        }),
      ).unwrap();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: checkoutResult.amount,
        currency: checkoutResult.currency,
        name: "EduIITia - Teacher Subscription",
        description: `${checkoutResult.plan.name}`,
        order_id: checkoutResult.orderId,
        theme: { color: "#10b981" },
        handler: async function (response) {
          try {
            await dispatch(
              verifyTeacherPayment({
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
            }

            toast.success("Plan purchased successfully! Redirecting...");

            setTimeout(() => {
              navigate("/admin/dashboard");
            }, 1500);
          } catch (error) {
            console.error("❌ Payment verification error:", error);
            toast.error(error || "Payment verification failed");
          } finally {
            setPurchasingPlanId(null);
          }
        },
        prefill: {
          name: user?.name || user?.displayName || "Teacher",
          email: user?.email || "teacher@example.com",
          contact: user?.phone || "9999999999",
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled");
            setPurchasingPlanId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed. Please try again.");
        console.error("Payment failed:", response.error);
        setPurchasingPlanId(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err || "Failed to start payment");
      setPurchasingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] py-16 px-4 sm:px-6">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-4"
          >
            <Sparkles size={14} />
            For Educators
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Empower Your Teaching with{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              Premium Tools
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Choose a plan tailored to your classroom needs. Create mock tests,
            analyze performance, and guide your students to success.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 mx-auto max-w-4xl"
        >
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl shrink-0">
              <Info className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                How our subscriptions work
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Purchase a plan based on your teaching requirements. Each tier
                unlocks a specific quota for creating mock tests across
                different subjects and exam types. Instant access to the admin
                dashboard is granted upon successful payment.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teacherPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group relative flex flex-col bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 h-10 line-clamp-2 mb-6">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    ₹{plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    / {plan.duration} days
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100 dark:bg-white/5 mb-6" />

              <div className="flex flex-wrap gap-2 mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <Zap
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {plan.mockTestLimit === 0
                      ? "Unlimited Tests"
                      : `${plan.mockTestLimit} Tests`}
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

                {/* NEW: Subcategory Badge */}
                {plan.subcategory && plan.subcategory !== "All" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
                    <Sparkles
                      size={14}
                      className="text-teal-600 dark:text-teal-400"
                    />
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      {plan.subcategory}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features && plan.features.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                            <Check
                              size={12}
                              className="text-emerald-600 dark:text-emerald-400"
                              strokeWidth={3}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={purchasingPlanId !== null || paymentLoading} 
                className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-black shadow-lg shadow-gray-200 dark:shadow-none hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasingPlanId === plan.id ? ( 
                  "Processing..."
                ) : (
                  <>
                    Get Started <CreditCard size={18} />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {!loading && teacherPlans.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 mt-8">
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-white/10 mb-4">
              <Info size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Plans Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We are currently updating our subscription packages. Please check
              back later or contact support.
            </p>
          </div>
        )}

        <div className="text-center mt-20 pb-10">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help choosing the right plan?{" "}
            <a
              href="mailto:support@eduiitia.com"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherPricing;
