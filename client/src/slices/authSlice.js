import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  increment,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";
import { clearPapers } from "./questionSlice";
import { clearAttempts } from "./attemptSlice";
import { uploadToFirebase } from "../config/firebaseUpload";

const createUserDocument = async (user, additionalData = {}) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { email } = user;
    const baseUrl = "https://api.dicebear.com/7.x/initials/svg?seed=";
    const defaultAvatar = `${baseUrl}${
      additionalData.name?.split(" ")[0] || "User"
    }`;

    const now = new Date().toISOString();

    const userData = {
      name: additionalData.name || "",
      email,
      phone: null,
      college: null,
      address: null,
      role: additionalData.role || "student",
      avatar: defaultAvatar,
      coverImage:
        "https://res.cloudinary.com/demo/image/upload/v1700000000/default_cover.jpg",
      subscription: [],
      testHistory: [],
      createdBy: additionalData.createdBy || null,
      instituteName: additionalData.instituteName || null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, userData);
    return { uid: user.uid, ...userData };
  }

  const existingData = userSnap.data();
  return {
    uid: user.uid,
    ...existingData,
    createdAt:
      existingData.createdAt?.toDate?.().toISOString() ||
      existingData.createdAt,
    updatedAt:
      existingData.updatedAt?.toDate?.().toISOString() ||
      existingData.updatedAt,
  };
};

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
      role = "student",
      createdBy = null,
      registrationCode = null,
    },
    { rejectWithValue },
  ) => {
    try {
      const validRoles = ["student", "admin", "superadmin"];
      if (!validRoles.includes(role)) {
        return rejectWithValue("Invalid role selected");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await firebaseUpdateProfile(user, { displayName: name });

      let instituteName = null;
      if (createdBy) {
        const adminDoc = await getDoc(doc(db, "users", createdBy));
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          instituteName =
            adminData.name || adminData.college || "Unknown Institute";

          const currentCount = adminData.currentStudentCount || 0;
          const maxStudents = adminData.maxStudents || 0;

          if (maxStudents > 0 && currentCount >= maxStudents) {
            await user.delete();
            throw new Error("Institute has reached maximum student capacity");
          }
        }
      }

      const userData = await createUserDocument(user, {
        name,
        role,
        createdBy,
        instituteName,
      });

      if (createdBy && role === "student") {
        const adminRef = doc(db, "users", createdBy);
        await updateDoc(adminRef, {
          currentStudentCount: increment(1),
        });
      }

      return { user: userData, message: "User registered successfully" };
    } catch (error) {
      let message = "Registration failed";
      if (error.code === "auth/email-already-in-use")
        message = "User already exists";
      if (error.code === "auth/weak-password")
        message = "Password must be at least 6 characters";
      if (error.code === "auth/invalid-email") message = "Invalid email";
      if (error.message === "Institute has reached maximum student capacity")
        message = error.message;

      return rejectWithValue(message);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        return rejectWithValue("User data not found");
      }

      const userData = snap.data();

      const completeUser = {
        uid: user.uid,
        ...userData,
      };
      const loginData = {
        user: completeUser,
        loginTimestamp: Date.now(),
      };
      localStorage.setItem("user", JSON.stringify(loginData));

      return {
        user: completeUser,
        message: "Login successful",
      };
    } catch (error) {
      let message = "Login failed";
      if (error.code === "auth/user-not-found") message = "User not found";
      if (error.code === "auth/wrong-password") message = "Invalid credentials";
      if (error.code === "auth/invalid-email") message = "Invalid email";

      return rejectWithValue(message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return rejectWithValue("User not found");

      const user = snapshot.docs[0].data();

      if (user.role !== "student") {
        return rejectWithValue("Only students can reset password");
      }

      await sendPasswordResetEmail(auth, email);

      return { message: "Password reset link sent successfully" };
    } catch (err) {
      return rejectWithValue("Something went wrong");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ oobCode, newPassword }, { rejectWithValue }) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return { message: "Password reset successful" };
    } catch (error) {
      let message = "Password reset failed";
      if (error.code === "auth/invalid-action-code")
        message = "Invalid or expired code";
      if (error.code === "auth/weak-password") message = "Weak password";

      return rejectWithValue(message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?.uid;
      if (!userId) return rejectWithValue("Not authenticated");

      const { name, phone, college, address, avatar, coverImage } = data;
      const userRef = doc(db, "users", userId);
      const updates = { updatedAt: serverTimestamp() };

      if (avatar instanceof File) {
        const result = await uploadToFirebase(avatar, {
          folder: `user_avatars/${userId}`,
        });
        updates.avatar = result.url;
        await firebaseUpdateProfile(auth.currentUser, {
          photoURL: result.url,
        });
      }

      if (coverImage instanceof File) {
        const result = await uploadToFirebase(coverImage, {
          folder: `user_covers/${userId}`,
        });
        updates.coverImage = result.url;
      }

      if (name) {
        updates.name = name;
        await firebaseUpdateProfile(auth.currentUser, { displayName: name });
      }

      if (phone !== undefined) updates.phone = phone;
      if (college !== undefined) updates.college = college;
      if (address !== undefined) updates.address = address;

      await updateDoc(userRef, updates);

      const updatedSnap = await getDoc(userRef);
      return {
        user: { uid: userId, ...updatedSnap.data() },
        message: "Profile updated successfully",
      };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update profile");
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await signOut(auth);
      dispatch(clearPapers());
      dispatch(clearAttempts());

      localStorage.removeItem("user");

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) return rejectWithValue("No user logged in");

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return rejectWithValue("User data not found");

      return { uid: user.uid, ...snap.data() };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "student"));
      const snap = await getDocs(q);

      const users = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();

        let adminDetails = null;
        if (data.createdBy) {
          const adminDoc = await getDoc(doc(db, "users", data.createdBy));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            adminDetails = {
              id: adminDoc.id,
              name: adminData.name,
              email: adminData.email,
              instituteName:
                adminData.college || adminData.name || "Unknown Institute",
            };
          }
        }

        const subscription = data.subscription || {};
        let planId = null;
        if (Array.isArray(subscription) && subscription.length > 0) {
          planId = subscription[0]?.plan || null;
        } else if (typeof subscription === "string") {
          planId = subscription;
        } else if (subscription?.id) {
          planId = subscription.id;
        }

        let planDetails = null;
        if (planId) {
          const planDoc = await getDoc(doc(db, "subscriptionPlans", planId));
          if (planDoc.exists()) {
            planDetails = { id: planDoc.id, ...planDoc.data() };
          }
        }

        users.push({
          id: docSnap.id,
          ...data,
          adminDetails,
          subscription: {
            ...subscription,
            plan: planDetails,
          },
        });
      }

      return { data: users };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (id, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(db, "users", id));
      if (!snap.exists()) throw new Error("User not found");

      const data = snap.data();

      let adminDetails = null;
      if (data.createdBy) {
        const adminDoc = await getDoc(doc(db, "users", data.createdBy));
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          adminDetails = {
            id: adminDoc.id,
            name: adminData.name,
            email: adminData.email,
            instituteName: adminData.college || adminData.name,
          };
        }
      }

      let planDetails = null;
      if (data.subscription?.planId) {
        const planDoc = await getDoc(
          doc(db, "subscriptionPlans", data.subscription.planId),
        );
        if (planDoc.exists()) planDetails = planDoc.data();
      }

      return {
        data: {
          id: snap.id,
          ...data,
          adminDetails,
          subscription: { ...data.subscription, plan: planDetails },
        },
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(db, "users", id));
      if (!snap.exists() || snap.data().role !== "student") {
        throw new Error("User not found");
      }

      const userData = snap.data();
      const createdBy = userData.createdBy;

      await deleteDoc(doc(db, "users", id));

      // ADD THIS BLOCK - Decrement admin's student count when deleting a student
      if (createdBy) {
        const adminRef = doc(db, "users", createdBy);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          const currentCount = adminSnap.data().currentStudentCount || 0;
          if (currentCount > 0) {
            await updateDoc(adminRef, {
              currentStudentCount: increment(-1),
            });
          }
        }
      }

      return { userId: id };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    message: null,
    isAuthenticated: false,

    allUsers: [],
    selectedUser: null,
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearMessage: (state) => {
      state.message = null;
    },

    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.isAuthenticated = true;
        s.message = a.payload.message;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.isAuthenticated = true;
        s.message = a.payload.message;
        const loginData = {
          user: a.payload.user,
          loginTimestamp: Date.now(),
        };
        localStorage.setItem("user", JSON.stringify(loginData));
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(forgotPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(forgotPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload.message;
      })
      .addCase(forgotPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(resetPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(resetPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload.message;
      })
      .addCase(resetPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.message = a.payload.message;
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.message = "Logged out successfully";
      })

      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.user = a.payload;
        s.isAuthenticated = true;
      })

      .addCase(getAllUsers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getAllUsers.fulfilled, (s, a) => {
        s.loading = false;
        s.allUsers = a.payload.data;
      })
      .addCase(getAllUsers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(getUserById.fulfilled, (s, a) => {
        s.selectedUser = a.payload.data;
      })

      .addCase(deleteUser.fulfilled, (s, a) => {
        s.allUsers = s.allUsers.filter((u) => u.id !== a.payload.userId);
      });
  },
});

export const { clearError, clearMessage, setUser, clearSelectedUser } =
  authSlice.actions;

export default authSlice.reducer;
