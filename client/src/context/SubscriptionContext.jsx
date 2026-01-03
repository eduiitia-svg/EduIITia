
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
      const subscription = userData.subscription || {};

      
      let planDetails = null;
      if (subscription.planId) {
        const planRef = doc(db, "subscriptionPlans", subscription.planId);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          planDetails = planSnap.data();
        }
      }

      
      const isActive =
        subscription.status === "active" &&
        subscription.endDate &&
        new Date(subscription.endDate.toDate()) > new Date();

      setSubscriptionStatus({
        ...subscription,
        plan: planDetails,
        isActive,
        planType: planDetails?.type || "free",
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