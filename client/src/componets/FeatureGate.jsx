import React from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const FeatureGate = ({
  featureName,
  children,
  fallback = null,
  showUpgradePrompt = true,
  variant = "full",
  userType = "auto",
}) => {
  const { hasFeatureAccess, subscriptionStatus } = useSubscription();
  const { user } = useSelector((state) => state.auth);
  const { teacherSubscription } = useSelector((state) => state.subscription);
  const navigate = useNavigate();

  const actualUserType =
    userType === "auto"
      ? user?.role === "admin"
        ? "teacher"
        : "student"
      : userType;

const hasAccess =
  actualUserType === "teacher"
    ? (() => {
        if (!teacherSubscription?.isActive) {
          return false;
        }
        const features = teacherSubscription?.features || [];
        return features.includes(featureName);
      })()
    : hasFeatureAccess(featureName);

  const currentPlan =
    actualUserType === "teacher"
      ? teacherSubscription?.planName || "No Plan"
      : subscriptionStatus?.planDetails?.name || "Free Plan";

  const isActive =
    actualUserType === "teacher"
      ? teacherSubscription?.isActive
      : subscriptionStatus?.isActive;

  const upgradePath =
    actualUserType === "teacher" ? "/teacher-pricing" : "/dashboard";

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return fallback;
  }

  if (variant === "full") {
    return (
      <div className="relative min-h-[400px]">
        <div className="absolute inset-0 bg-linear-to-br from-gray-100/98 via-gray-200/95 to-white/98 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-black/95 backdrop-blur-xl z-10 flex items-center justify-center rounded-2xl border border-amber-400/30 dark:border-amber-500/20">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-amber-400/30 to-orange-400/30 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-amber-500/40 dark:border-amber-500/30">
              <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              {actualUserType === "teacher"
                ? "Premium Teacher Feature"
                : "Premium Feature"}
            </h3>
            <p className="text-gray-700 dark:text-slate-300 text-base mb-2">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {featureName}
              </span>{" "}
              is available in premium plans
            </p>
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">
              {isActive
                ? `Your current plan: ${currentPlan}`
                : "No active subscription"}
            </p>
            <button
              onClick={() => navigate(upgradePath)}
              className="px-8 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white dark:text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105"
            >
              {actualUserType === "teacher"
                ? "View Teacher Plans"
                : "Upgrade Plan"}
            </button>
          </div>
        </div>
        <div className="pointer-events-none opacity-20 blur-md select-none">
          {children}
        </div>
      </div>
    );
  }

  if (variant === "blur") {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-200/90 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <p className="text-gray-900 dark:text-white font-semibold text-sm">
              {featureName}
            </p>
            <button
              onClick={() => navigate(upgradePath)}
              className="mt-3 px-4 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 transition-all"
            >
              {actualUserType === "teacher" ? "View Plans" : "Upgrade"}
            </button>
          </div>
        </div>
        <div className="pointer-events-none opacity-30 blur-sm">{children}</div>
      </div>
    );
  }

  return (
    fallback || (
      <div className="bg-gray-100 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-800 rounded-xl p-6 text-center">
        <Lock className="w-6 h-6 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          Feature locked
        </p>
      </div>
    )
  );
};

export default FeatureGate;
