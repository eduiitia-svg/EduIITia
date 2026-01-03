import React, { useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slices/authSlice";
import {
  getPlans,
  getSubscriptionStatus,
} from "../../slices/subscriptionSlice";
import { createCheckout, verifyPayment } from "../../slices/paymentSlice";
import { getActiveSubscription } from "../../../utils/subscriptionHelpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

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
const Pricing = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { plans } = useSelector((state) => state.subscription);
  const { loading: paymentLoading } = useSelector((state) => state.payment);
  const [activating, setActivating] = useState(null);
  const [refreshing, setRefreshing] = useState(true);
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
        })
      ).unwrap();
      const options = {
        key: checkoutResult.key,
        amount: checkoutResult.amount,
        currency: checkoutResult.currency,
        name: "ChemT",
        description: `${checkoutResult.plan.name} Plan`,
        order_id: checkoutResult.orderId,
        theme: { color: "#6366F1" },
        handler: async function (response) {
          try {
            const verifyResult = await dispatch(
              verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
              })
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
          name: user?.name || user?.displayName || "ChemT Student",
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
  return (
    <div
      id="pricing"
      className="min-h-screen bg-white dark:bg-transparent text-gray-900 dark:text-white py-20 px-5 relative overflow-hidden font-inter"
    >
      <div className="text-center mx-auto max-w-7xl py-10 px-5 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-linear-to-r from-emerald-300 via-teal-400 to-cyan-500 bg-clip-text text-transparent mb-4 tracking-tighter">
          Pricing Plans That Fit You
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xl max-w-3xl mx-auto">
          Choose the perfect plan to unlock comprehensive study materials,
          unlimited practice, and intelligent analytics.
        </p>
      </div>
      {plans.length === 0 || refreshing ? (
        <div className="text-center py-20">
          <p className="text-emerald-600 dark:text-emerald-400 text-xl animate-pulse">
            {refreshing
              ? "Loading subscription status..."
              : "Loading pricing plans..."}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10 p-4">
          {plans.map((plan) => {
            const isActive = activeSubscription?.plan === plan.id;
            const isPro = plan.id === bestValuePlanId;
            const isFree = plan.type === "free";
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-[#0F0F0F] border rounded-3xl shadow-2xl transition-all duration-500 flex flex-col justify-between
                  ${
                    isActive
                      ? "border-emerald-500 shadow-[0_0_40px_rgba(52,211,153,0.5)]"
                      : "border-gray-200 dark:border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                  }
                  ${
                    isPro
                      ? "order-first lg:order-0 scale-[1.05] border-emerald-400/80 shadow-[0_0_70px_rgba(52,211,153,0.6)]"
                      : ""
                  }
                  `}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-linear-to-r from-emerald-400 to-teal-500 text-black font-extrabold text-sm rounded-full shadow-xl z-20">
                    BEST VALUE
                  </div>
                )}
                <div
                  className={`relative h-full flex flex-col justify-between ${
                    isPro ? "p-10" : "p-8"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-4 right-4 text-xs bg-emerald-600 text-white px-3 py-1 rounded-full shadow-lg font-bold">
                      Current Plan
                    </span>
                  )}
                  <div className="p-0 grow">
                    <h2
                      className={`text-3xl font-bold mb-1 ${
                        isPro
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {plan.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
                      {plan.description}
                    </p>
                    <div className="mb-8 mt-4">
                      <div className="text-5xl font-extrabold text-gray-900 dark:text-white">
                        {isFree ? "Free" : `₹${plan.price}`}
                        <span className="text-base font-medium text-gray-500 dark:text-gray-500 ml-2">
                          / {plan.duration === 365 ? "year" : "month"}
                        </span>
                      </div>
                      {!isFree && (
                        <p className="text-sm text-gray-600 dark:text-gray-600 mt-1">
                          {plan.duration === 365
                            ? "Save 17%"
                            : "Billed monthly"}
                        </p>
                      )}
                    </div>
                    <ul className="space-y-4 text-base">
                      {plan.features?.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start text-gray-700 dark:text-gray-300"
                        >
                          <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 shrink-0 mt-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-8 border-t border-gray-200 dark:border-white/5 mt-8">
                    {isFree ? (
                      <button
                        className="w-full py-3.5 rounded-xl font-semibold text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-all duration-300 cursor-not-allowed"
                        disabled
                      >
                        Currently Active
                      </button>
                    ) : isActive ? (
                      <button
                        className="w-full py-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-700/30 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-bold cursor-default shadow-inner transition-all duration-300"
                        disabled
                      >
                        Active Subscription
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(plan.id)}
                        disabled={activating === plan.id || paymentLoading}
                        className="w-full py-3.5 rounded-xl font-extrabold text-black bg-linear-to-r from-emerald-400 to-teal-600 hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {activating === plan.id
                          ? "Initiating Checkout..."
                          : `Get Started for ₹${plan.price}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Pricing;
