import { createContext, useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllPlans } from "../slices/subscriptionSlice";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.subscription);
  const { user } = useSelector((state) => state.auth);

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getSubscriptionStatus = async () => {
    try {
      if (!user?.uid) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const subscriptions = userData.subscription || [];

      let activeSubscription = null;
      for (const sub of subscriptions) {
        if (sub.isActive && sub.endDate) {
          const endDate = sub.endDate.toDate
            ? sub.endDate.toDate()
            : new Date(sub.endDate);
          if (new Date() < endDate) {
            activeSubscription = sub;
            break;
          }
        }
      }

      if (!activeSubscription) {
        setSubscriptionStatus({
          isActive: false,
          planType: "free",
          plan: null,
        });
        return;
      }

      let planDetails = null;
      if (activeSubscription.plan) {
        const planRef = doc(db, "subscriptionPlans", activeSubscription.plan);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          planDetails = { id: planSnap.id, ...planSnap.data() };
        }
      }

      setSubscriptionStatus({
        ...activeSubscription,
        isActive: true,
        planType: planDetails?.type || "free",
        planDetails: planDetails,
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  const getPlans = async () => {
    try {
      await dispatch(getAllPlans()).unwrap();
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const startCheckout = async (planId) => {
    try {
      setIsProcessing(true);

      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      const planRef = doc(db, "subscriptionPlans", planId);
      const planSnap = await getDoc(planRef);

      if (!planSnap.exists()) {
        throw new Error("Plan not found");
      }

      const plan = planSnap.data();

      const orderData = {
        orderId: `order_${Date.now()}`,
        amount: plan.price * 100,
        currency: "INR",
        planId,
        planName: plan.name,
      };

      return orderData;
    } catch (err) {
      console.error("Error starting checkout:", err);
      toast.error("Unable to start checkout");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (payload) => {
    try {
      setIsProcessing(true);

      const { orderId, paymentId, signature, planId } = payload;

      const orderData = {
        userId: user.uid,
        planId,
        orderId,
        paymentId,
        signature,
        amount: payload.amount,
        status: "completed",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "orders"), orderData);

      const userRef = doc(db, "users", user.uid);
      const planRef = doc(db, "subscriptionPlans", planId);
      const planSnap = await getDoc(planRef);
      const plan = planSnap.data();

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      await updateDoc(userRef, {
        subscription: {
          planId,
          status: "active",
          startDate: new Date(),
          endDate,
          testLimit: plan.testLimit || 0,
        },
      });

      toast.success("Payment verified successfully!");
      await getSubscriptionStatus();

      return { success: true };
    } catch (err) {
      console.error("Error verifying payment:", err);
      toast.error("Payment verification failed");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const canAccessTest = (test) => {
    if (test.isDemo || test.testType?.toLowerCase() === "demo") return true;

    if (!subscriptionStatus) return false;

    const hasActivePaidSubscription =
      subscriptionStatus.isActive &&
      subscriptionStatus.planType?.toLowerCase() !== "free";

    return hasActivePaidSubscription;
  };

  const canTakeTest = async () => {
    try {
      if (!user?.uid) return false;

      if (!subscriptionStatus || !subscriptionStatus.isActive) {
        return false;
      }

      const planId = subscriptionStatus.plan;
      if (!planId) {
        console.error("No plan ID found in subscription");
        return false;
      }

      const planRef = doc(db, "subscriptionPlans", planId);
      const planSnap = await getDoc(planRef);

      if (!planSnap.exists()) {
        console.error("Plan not found:", planId);
        return false;
      }

      const planData = planSnap.data();
      const testLimit = planData.testLimit || 0;

      if (testLimit === 0 || testLimit === -1) {
        return true;
      }

      const subscriptionStartDate = subscriptionStatus.startDate;
      const startDate = subscriptionStartDate?.toDate
        ? subscriptionStartDate.toDate()
        : new Date(subscriptionStartDate);

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("userId", "==", user.uid),
        where("submittedAt", "!=", null),
        where("submittedAt", ">=", startDate),
      );
      const attemptsSnap = await getDocs(q);
      const completedTests = attemptsSnap.size;

      console.log(
        `Test usage for current subscription: ${completedTests}/${testLimit}`,
      );

      return completedTests < testLimit;
    } catch (error) {
      console.error("Error checking test limit:", error);
      return false;
    }
  };

  const getRemainingTests = async () => {
    try {
      if (!user?.uid) return 0;

      if (!subscriptionStatus || !subscriptionStatus.isActive) {
        return 0;
      }

      const planId = subscriptionStatus.plan;
      if (!planId) return 0;

      const planRef = doc(db, "subscriptionPlans", planId);
      const planSnap = await getDoc(planRef);

      if (!planSnap.exists()) return 0;

      const planData = planSnap.data();
      const testLimit = planData.testLimit || 0;

      
      if (testLimit === 0 || testLimit === -1) {
        return 999;
      }

    
      const subscriptionStartDate = subscriptionStatus.startDate;
      const startDate = subscriptionStartDate?.toDate
        ? subscriptionStartDate.toDate()
        : new Date(subscriptionStartDate);

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("userId", "==", user.uid),
        where("submittedAt", "!=", null),
        where("submittedAt", ">=", startDate), 
      );
      const attemptsSnap = await getDocs(q);
      const completedTests = attemptsSnap.size;

      return Math.max(0, testLimit - completedTests);
    } catch (error) {
      console.error("Error getting remaining tests:", error);
      return 0;
    }
  };

  const hasFeatureAccess = (featureName) => {
    if (!subscriptionStatus || !subscriptionStatus.isActive) {
      return false;
    }

    const features = subscriptionStatus.planDetails?.features || [];

    return features.includes(featureName);
  };

  const getAccessibleFeatures = () => {
    if (!subscriptionStatus || !subscriptionStatus.isActive) {
      return [];
    }
    return subscriptionStatus.planDetails?.features || [];
  };

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    if (user) {
      getSubscriptionStatus();
    }
  }, [user]);

  const value = {
    subscriptionStatus,
    plans,
    loading,
    isProcessing,
    getSubscriptionStatus,
    getPlans,
    startCheckout,
    verifyPayment,
    canAccessTest,
    canTakeTest,
    getRemainingTests,
    hasFeatureAccess,
    getAccessibleFeatures,
    refreshSubscription: getSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};
