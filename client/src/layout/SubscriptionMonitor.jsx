import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { setUser } from "../slices/authSlice";
import toast from "react-hot-toast";
import {
  getActiveSubscription,
  getTimeRemaining,
  formatTimeRemaining,
} from "../../utils/subscriptionHelpers";

const SubscriptionMonitor = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const lastNotificationRef = useRef(null);
  const previousActiveStatusRef = useRef(null);
  const expirationCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (!user?.subscription) {
      return;
    }

    const checkExpiration = () => {
      const activeSubscription = getActiveSubscription(user.subscription);
      const isCurrentlyActive = !!activeSubscription;

      if (previousActiveStatusRef.current === true && !isCurrentlyActive) {
        
        const updatedUser = {
          ...user,
          subscription: user.subscription.map(sub => ({
            ...sub,
            isActive: false
          }))
        };

        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.error(
          "Your subscription has expired. Please renew to continue.",
          {
            duration: 5000,
            icon: "⏰",
          }
        );
      }

      previousActiveStatusRef.current = isCurrentlyActive;
    };

    checkExpiration();

    expirationCheckIntervalRef.current = setInterval(checkExpiration, 60000);

    return () => {
      if (expirationCheckIntervalRef.current) {
        clearInterval(expirationCheckIntervalRef.current);
      }
    };
  }, [user, dispatch]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const firestoreData = snap.data();
        

          dispatch((dispatch, getState) => {
            const currentUser = getState().auth.user;

            const updatedUser = {
              ...currentUser,
              subscription: firestoreData.subscription || [],
            };

            dispatch(setUser(updatedUser));
            localStorage.setItem("user", JSON.stringify(updatedUser));
          });
        }
      },
      (error) => {
        console.error("Subscription monitor error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid, dispatch]);

  useEffect(() => {
    if (!user?.subscription) {
      return;
    }

    const activeSubscription = getActiveSubscription(user.subscription);
    const isCurrentlyActive = !!activeSubscription;
    const timeRemaining = activeSubscription
      ? getTimeRemaining(activeSubscription)
      : null;
    const formattedTime = activeSubscription
      ? formatTimeRemaining(activeSubscription)
      : null;

    if (isCurrentlyActive && timeRemaining?.isExpiringToday) {
      const notificationKey = `expiring-today-${timeRemaining.hours}h`;

      if (lastNotificationRef.current !== notificationKey) {
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                🚨 Subscription Expiring Today!
              </span>
              <span className="text-sm text-gray-600">
                Only {formattedTime} remaining
              </span>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
            },
          }
        );
        lastNotificationRef.current = notificationKey;
      }
    }
    else if (
      isCurrentlyActive &&
      timeRemaining?.days > 0 &&
      timeRemaining?.days <= 3
    ) {
      const notificationKey = `expiring-${timeRemaining.days}d`;

      if (lastNotificationRef.current !== notificationKey) {
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                ⚠️ Subscription Expiring Soon
              </span>
              <span className="text-sm text-gray-600">
                {formattedTime} remaining
              </span>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: "#FEF3C7",
              color: "#92400E",
            },
          }
        );
        lastNotificationRef.current = notificationKey;
      }
    }
    else if (
      isCurrentlyActive &&
      timeRemaining?.days > 3 &&
      timeRemaining?.days <= 7
    ) {
      const notificationKey = `expiring-${timeRemaining.days}d`;

      if (lastNotificationRef.current !== notificationKey) {
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">⏰ Subscription Expiring</span>
              <span className="text-sm text-gray-600">
                {formattedTime} remaining
              </span>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: "#DBEAFE",
              color: "#1E40AF",
            },
          }
        );
        lastNotificationRef.current = notificationKey;
      }
    }
  }, [user?.subscription]);

  return null;
};

export default SubscriptionMonitor;