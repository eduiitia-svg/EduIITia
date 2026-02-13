const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");

const db = admin.firestore();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const { userId, planId, amount } = req.body;

    if (!userId || !planId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify plan exists
    const planDoc = await db.collection("subscriptionPlans").doc(planId).get();

    if (!planDoc.exists || !planDoc.data().isActive) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    const planData = planDoc.data();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, 
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
      },
    });


    await db.collection("orders").add({
      user: userId,
      plan: planId,
      planSnapshot: {
        name: planData.name,
        type: planData.type,
        price: planData.price,
        duration: planData.duration,
      },
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: order.id,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Verify Razorpay Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const ordersSnapshot = await db
      .collection("orders")
      .where("razorpayOrderId", "==", razorpay_order_id)
      .where("user", "==", userId)
      .limit(1)
      .get();

    if (ordersSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderDoc = ordersSnapshot.docs[0];
    const order = orderDoc.data();

    // Check if already completed
    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // Update order status
    await orderDoc.ref.update({
      status: "completed",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });


    // Update user subscription
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const subscriptions = userData.subscription || [];

    // Deactivate all existing subscriptions
    const updatedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      isActive: false,
    }));

    // Add new active subscription
    const startDate = admin.firestore.Timestamp.now();
    const endDate = new Date();
    const durationDays = order.planSnapshot?.duration || 30;
    endDate.setDate(endDate.getDate() + durationDays);

    updatedSubscriptions.push({
      plan: order.plan,
      startDate: startDate,
      endDate: admin.firestore.Timestamp.fromDate(endDate),
      isActive: true,
    });

    await userRef.update({
      subscription: updatedSubscriptions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });


    // Get updated user data
    const updatedUserDoc = await userRef.get();
    const updatedUser = { uid: updatedUserDoc.id, ...updatedUserDoc.data() };

    res.json({
      success: true,
      message: "Payment verified successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

// Create Teacher Order
router.post("/create-teacher-order", async (req, res) => {
  try {
    const { userId, planId, amount } = req.body;

    if (!userId || !planId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: "INR",
      receipt: `teacher_order_${Date.now()}`,
      notes: {
        userId,
        planId,
        type: "teacher_subscription",
      },
    };

    const order = await razorpay.orders.create(options);

    // Store order in Firestore
    await admin.firestore().collection("teacherOrders").add({
      orderId: order.id,
      userId,
      planId,
      amount: amount / 100, // store in rupees
      currency: "INR",
      status: "created",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Create teacher order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
});

// Verify Teacher Payment
router.post("/verify-teacher", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      planId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !userId ||
      !planId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Fetch plan details
    const planDoc = await admin
      .firestore()
      .collection("teacherSubscriptionPlans")
      .doc(planId)
      .get();

    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const planData = planDoc.data();

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planData.duration);

    // Update user's teacher subscription
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        teacherSubscription: {
          planId: planId,
          planName: planData.name,
          startDate: admin.firestore.Timestamp.fromDate(startDate),
          endDate: admin.firestore.Timestamp.fromDate(endDate),
          isActive: true,
          mockTestsGenerated: 0,
          mockTestLimit: planData.mockTestLimit || 0,
          examType: planData.examType || "All",
          subject: planData.subject || "All",
          classLevel: planData.classLevel || "All",
          purchasedAt: admin.firestore.Timestamp.fromDate(startDate),
        },
        hasActiveTeacherSubscription: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update order status
    const orderQuery = await admin
      .firestore()
      .collection("teacherOrders")
      .where("orderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (!orderQuery.empty) {
      await orderQuery.docs[0].ref.update({
        status: "completed",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({
      success: true,
      message: "Payment verified and subscription activated",
    });
  } catch (error) {
    console.error("❌ Verify teacher payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
});
