import { useDispatch, useSelector } from "react-redux";
import { 
  checkTestAccess, 
  checkFeatureAccess,
  recordTestAttempt 
} from "../slices/subscriptionSlice";
import toast from "react-hot-toast";

export const useSubscriptionAccess = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentSubscription, testAccess, featureAccess } = useSelector(
    (state) => state.subscription
  );


  const canTakeTest = async (testType, testId) => {
    if (!user?.uid) {
      toast.error("Please login to continue");
      return false;
    }

    try {
      const result = await dispatch(
        checkTestAccess({ userId: user.uid, testType, testId })
      ).unwrap();

      if (!result.canTakeTest) {
        toast.error(result.message || "You don't have access to this test");
        return false;
      }

      return true;
    } catch (error) {
      toast.error(error || "Access denied");
      return false;
    }
  };


  const hasFeatureAccess = async (featureName) => {
    if (!user?.uid) {
      toast.error("Please login to continue");
      return false;
    }

    try {
      const result = await dispatch(
        checkFeatureAccess({ userId: user.uid, featureName })
      ).unwrap();

      if (!result.hasAccess) {
        toast.error(result.reason || "This feature is not available in your plan");
        return false;
      }

      return true;
    } catch (error) {
      toast.error(error || "Access denied");
      return false;
    }
  };

  const recordTest = async (testId, testType) => {
    if (!user?.uid) return;

    try {
      await dispatch(
        recordTestAttempt({ userId: user.uid, testId, testType })
      ).unwrap();
    } catch (error) {
      console.error("Failed to record test attempt:", error);
    }
  };

  const getPlanDetails = () => {
    return currentSubscription || {
      planType: "free",
      isActive: false,
      testsRemaining: 0,
      features: [],
    };
  };


  const hasActiveSubscription = () => {
    return currentSubscription?.isActive === true;
  };

  const getAvailableFeatures = () => {
    return currentSubscription?.features || [];
  };


  const hasReachedTestLimit = () => {
    if (!currentSubscription) return true;
    
    const { testLimit, testsTaken } = currentSubscription;
    
    if (testLimit === 0) return false;
    
    return testsTaken >= testLimit;
  };

  return {
    canTakeTest,
    hasFeatureAccess,
    recordTest,
    getPlanDetails,
    hasActiveSubscription,
    getAvailableFeatures,
    hasReachedTestLimit,
    testAccess,
    featureAccess,
    currentSubscription,
  };
};


export const SubscriptionUtils = {

  planHasFeature: (planFeatures, featureName) => {
    if (!planFeatures || !Array.isArray(planFeatures)) return false;
    
    return planFeatures.some((f) =>
      f.toLowerCase().includes(featureName.toLowerCase())
    );
  },

  getActiveSubscription: (subscriptions) => {
    if (!subscriptions || !Array.isArray(subscriptions)) return null;

    return subscriptions.find((sub) => {
      if (!sub.isActive || !sub.endDate) return false;
      
      const endDate = sub.endDate.toDate 
        ? sub.endDate.toDate() 
        : new Date(sub.endDate);
      
      return new Date() < endDate;
    });
  },

  getDaysRemaining: (endDate) => {
    if (!endDate) return 0;
    
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  formatSubscriptionStatus: (subscription) => {
    if (!subscription || !subscription.isActive) {
      return {
        status: "Inactive",
        color: "red",
        message: "No active subscription",
      };
    }

    const daysLeft = SubscriptionUtils.getDaysRemaining(subscription.endDate);

    if (daysLeft <= 0) {
      return {
        status: "Expired",
        color: "red",
        message: "Subscription has expired",
      };
    }

    if (daysLeft <= 7) {
      return {
        status: "Expiring Soon",
        color: "orange",
        message: `${daysLeft} days remaining`,
      };
    }

    return {
      status: "Active",
      color: "green",
      message: `${daysLeft} days remaining`,
    };
  },
};