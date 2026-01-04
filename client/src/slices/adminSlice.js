import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../config/firebase";
import axios from "axios";

const generateRegistrationCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};


export const submitRegistrationRequest = createAsyncThunk(
  "admin/submitRegistrationRequest",
  async ({ code, name, email }, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", "admin"),
        where("registrationCode", "==", code.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid registration code");
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      const currentCount = adminData.currentStudentCount || 0;
      const maxStudents = adminData.maxStudents || 0;

      if (maxStudents > 0 && currentCount >= maxStudents) {
        throw new Error(
          "This institute has reached its maximum student capacity. Registration is currently closed."
        );
      }

      const requestsRef = collection(db, "registrationRequests");
      const existingQuery = query(
        requestsRef,
        where("email", "==", email),
        where("registrationCode", "==", code.toUpperCase())
      );
      const existingRequests = await getDocs(existingQuery);

      if (!existingRequests.empty) {
        const existingRequest = existingRequests.docs[0].data();
        return {
          status: existingRequest.status,
          admin: {
            id: adminDoc.id,
            name: adminData.name,
            email: adminData.email,
            instituteName:
              adminData.instituteName || adminData.college || adminData.name,
          },
          requestId: existingRequests.docs[0].id,
        };
      }

      const requestData = {
        name,
        email,
        registrationCode: code.toUpperCase(),
        adminId: adminDoc.id,
        instituteName:
          adminData.instituteName || adminData.college || adminData.name,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const requestDoc = await addDoc(requestsRef, requestData);

      const adminNotificationHTML = `
  <div style="font-family: Inter, Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0px 8px 24px rgba(15, 23, 42, 0.1); border: 1px solid #e2e8f0;">
      <h2 style="font-size: 24px; font-weight: 700; color: #4f46e5; margin-bottom: 16px; text-align: center;">
        New Registration Request
      </h2>
      <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">
        Hi <strong>${adminData.name}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
        A student has requested to register using your institute code:
      </p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 14px; color: #1e293b;">
          <strong>Name:</strong> ${name}
        </p>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #1e293b;">
          <strong>Email:</strong> ${email}
        </p>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #1e293b;">
          <strong>Code Used:</strong> ${code.toUpperCase()}
        </p>
      </div>
      <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
        Please log in to your admin dashboard to approve or reject this request.
      </p>
    </div>
  </div>
`;
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: adminData.email,
        subject: "New Student Registration Request",
        html: adminNotificationHTML,
      });

      return {
        status: "pending",
        admin: {
          id: adminDoc.id,
          name: adminData.name,
          email: adminData.email,
          instituteName:
            adminData.instituteName || adminData.college || adminData.name,
        },
        requestId: requestDoc.id,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to submit registration request"
      );
    }
  }
);

export const getRegistrationRequests = createAsyncThunk(
  "admin/getRegistrationRequests",
  async (adminId, { rejectWithValue }) => {
    try {
      const requestsRef = collection(db, "registrationRequests");
      const q = query(requestsRef, where("adminId", "==", adminId));
      const querySnapshot = await getDocs(q);

      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        });
      });

      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to fetch registration requests"
      );
    }
  }
);

export const approveRegistrationRequest = createAsyncThunk(
  "admin/approveRegistrationRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const requestRef = doc(db, "registrationRequests", requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        throw new Error("Request not found");
      }

      const requestData = requestSnap.data();

      await updateDoc(requestRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const approvalHTML = `
  <div style="font-family: Inter, Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0px 8px 24px rgba(15, 23, 42, 0.1); border: 1px solid #e2e8f0;">
      <h2 style="font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 16px; text-align: center;">
        Registration Approved! 🎉
      </h2>
      <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">
        Hi <strong>${requestData.name}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
        Great news! Your registration request has been approved by <strong>${requestData.instituteName}</strong>.
      </p>
      <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
        Click the button below to create your password and complete your registration.
      </p>
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${window.location.origin}?code=${requestData.registrationCode}&email=${requestData.email}&openSignup=true" 
          style="background-color: #10b981; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0px 4px 14px rgba(16, 185, 129, 0.3);">
          Complete Registration
        </a>
      </div>
     <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 20px;">
        Or copy this link: <br/>
        <a href="${window.location.origin}?code=${requestData.registrationCode}&email=${requestData.email}&name=${requestData.name}&openSignup=true" 
          style="color: #4f46e5; word-break: break-all;">
          ${window.location.origin}?code=${requestData.registrationCode}&email=${requestData.email}&name=${requestData.name}&openSignup=true
        </a>
      </p>

    </div>
  </div>
`;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: requestData.email,
        subject: "Registration Approved - Welcome to EduIITia",
        html: approvalHTML,
      });

      return {
        success: true,
        requestId,
        message: "Registration request approved successfully",
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to approve registration request"
      );
    }
  }
);

export const rejectRegistrationRequest = createAsyncThunk(
  "admin/rejectRegistrationRequest",
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      const requestRef = doc(db, "registrationRequests", requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        throw new Error("Request not found");
      }

      const requestData = requestSnap.data();

      await updateDoc(requestRef, {
        status: "rejected",
        rejectionReason: reason || "No reason provided",
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const rejectionHTML = `
        <div style="font-family: Inter, Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0px 8px 24px rgba(15, 23, 42, 0.1); border: 1px solid #e2e8f0;">
            <h2 style="font-size: 24px; font-weight: 700; color: #ef4444; margin-bottom: 16px; text-align: center;">
              Registration Request Update
            </h2>
            <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">
              Hi <strong>${requestData.name}</strong>,
            </p>
            <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
              We regret to inform you that your registration request for <strong>${
                requestData.instituteName
              }</strong> was not approved.
            </p>
            ${
              reason
                ? `<div style="background-color: #fef2f2; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #fecaca;">
              <p style="margin: 0; font-size: 14px; color: #991b1b;">
                <strong>Reason:</strong> ${reason}
              </p>
            </div>`
                : ""
            }
            <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
              Please contact your institute administrator for more information or to request a new registration code.
            </p>
          </div>
        </div>
      `;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: requestData.email,
        subject: "Registration Request Update",
        html: rejectionHTML,
      });

      return {
        success: true,
        requestId,
        message: "Registration request rejected",
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to reject registration request"
      );
    }
  }
);

export const verifyRegistrationCode = createAsyncThunk(
  "admin/verifyRegistrationCode",
  async ({ code, email }, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", "admin"),
        where("registrationCode", "==", code.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid registration code");
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      const currentCount = adminData.currentStudentCount || 0;
      const maxStudents = adminData.maxStudents || 0;

      if (maxStudents > 0 && currentCount >= maxStudents) {
        throw new Error(
          "This registration code has expired. The institute has reached its maximum student capacity."
        );
      }


      if (email) {
        const requestsRef = collection(db, "registrationRequests");
        const requestQuery = query(
          requestsRef,
          where("email", "==", email),
          where("registrationCode", "==", code.toUpperCase())
        );
        const requestSnapshot = await getDocs(requestQuery);

        if (!requestSnapshot.empty) {
          const requestData = requestSnapshot.docs[0].data();
          if (requestData.status === "approved") {
            return {
              status: "approved",
              admin: {
                id: adminDoc.id,
                name: adminData.name,
                email: adminData.email,
                instituteName:
                  adminData.instituteName ||
                  adminData.college ||
                  adminData.name,
              },
            };
          } else if (requestData.status === "pending") {
            return {
              status: "pending",
              admin: {
                id: adminDoc.id,
                name: adminData.name,
                email: adminData.email,
                instituteName:
                  adminData.instituteName ||
                  adminData.college ||
                  adminData.name,
              },
            };
          } else if (requestData.status === "rejected") {
            throw new Error("Your registration request was rejected");
          }
        }
      }

      return {
        status: "valid",
        admin: {
          id: adminDoc.id,
          name: adminData.name,
          email: adminData.email,
          instituteName:
            adminData.instituteName || adminData.college || adminData.name,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Invalid registration code"
      );
    }
  }
);

export const createAdmin = createAsyncThunk(
  "admin/createAdmin",
  async (
    { name, email, phone, instituteName, maxStudents },
    { rejectWithValue }
  ) => {
    try {
      if (!name || !email) {
        throw new Error("Name and Email are required");
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const existing = await getDocs(q);

      if (!existing.empty) {
        throw new Error("Email already registered");
      }

      const randomPassword = Math.random().toString(36).slice(-8);
      const registrationCode = generateRegistrationCode();

      const [userCredential] = await Promise.all([
        createUserWithEmailAndPassword(auth, email, randomPassword),
      ]);

      const userId = userCredential.user.uid;

      await setDoc(doc(db, "users", userId), {
        uid: userId,
        name,
        email,
        phone: phone || null,
        role: "admin",
        password: randomPassword,
        college: instituteName || name,
        instituteName: instituteName || name,
        registrationCode: registrationCode,
        maxStudents: maxStudents || 0,
        currentStudentCount: 0,
        createdBy: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      const registrationLink = `${window.location.origin}?code=${registrationCode}&openSignup=true`;
      const resetToken = Math.random().toString(36).slice(-32);
      const resetLink = `${window.location.origin}/reset-password?mode=resetPassword&oobCode=${resetToken}`;

      const adminWelcomeHTML = `
          <div style="font-family: Inter, Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
            <div style="
              max-width: 600px;
              margin: auto;
              background-color: #ffffff;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0px 8px 24px rgba(15, 23, 42, 0.1);
              border: 1px solid #e2e8f0;
            ">
              <h2 style="
                font-size: 24px;
                font-weight: 700;
                color: #4f46e5;
                margin-bottom: 16px;
                text-align: center;
              ">
                Welcome to EduIITia Admin Panel
              </h2>
              <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="font-size: 15px; color: #475569; margin-bottom: 20px;">
                Your admin account has been successfully created${
                  instituteName ? ` for <strong>${instituteName}</strong>` : ""
                }. Below are your login credentials:
              </p>
              <div style="
                background-color: #f1f5f9;
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 24px;
                border: 1px solid #e2e8f0;
              ">
                <p style="margin: 0; font-size: 14px; color: #1e293b;">
                  <strong>Email:</strong> ${email}
                </p>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #1e293b;">
                  <strong>Temporary Password:</strong> ${randomPassword}
                </p>
                ${
                  instituteName
                    ? `<p style="margin: 6px 0 0 0; font-size: 14px; color: #1e293b;">
                  <strong>Institute:</strong> ${instituteName}
                </p>`
                    : ""
                }
              </div>
              <div style="
                background-color: #ecfdf5;
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 20px;
                margin: 24px 0;
              ">
                <h3 style="
                  font-size: 16px;
                  font-weight: 700;
                  color: #065f46;
                  margin-bottom: 12px;
                  text-align: center;
                ">
                  📝 Student Registration Information
                </h3>
                <p style="font-size: 14px; color: #047857; margin-bottom: 12px; text-align: center;">
                  Share this registration code with your students:
                </p>
                <div style="
                  background-color: #ffffff;
                  padding: 12px;
                  border-radius: 8px;
                  text-align: center;
                  margin-bottom: 12px;
                ">
                  <p style="
                    font-size: 24px;
                    font-weight: 700;
                    color: #10b981;
                    letter-spacing: 2px;
                    margin: 0;
                    font-family: 'Courier New', monospace;
                  ">
                    ${registrationCode}
                  </p>
                </div>
                <p style="font-size: 13px; color: #047857; margin-bottom: 8px; text-align: center;">
                  <strong>Or share this direct registration link:</strong>
                </p>
                <div style="
                  background-color: #ffffff;
                  padding: 10px;
                  border-radius: 8px;
                  word-break: break-all;
                ">
                  <a href="${registrationLink}" style="
                    font-size: 13px;
                    color: #4f46e5;
                    text-decoration: none;
                  ">
                    ${registrationLink}
                  </a>
                </div>
                <p style="font-size: 12px; color: #047857; margin-top: 12px; text-align: center; font-style: italic;">
                  Students must submit a request and you will need to approve them before they can register.
                </p>
              </div>
            </div>
          </div>
      `;

      axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: email,
        subject: "Welcome to EduIITia - Admin Access",
        html: adminWelcomeHTML,
      });

      return {
        success: true,
        message: "Admin created successfully! Welcome email is being sent.",
        admin: {
          id: userId,
          name,
          email,
          phone,
          role: "admin",
          instituteName: instituteName || name,
          registrationCode: registrationCode,
          temp_password: randomPassword,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    }
  }
);

export const getAllAdmins = createAsyncThunk(
  "admin/getAllAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "admin"));
      const querySnapshot = await getDocs(q);

      const admins = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        admins.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          instituteName: data.instituteName || data.college || data.name,
          registrationCode: data.registrationCode,
          temp_password: data.password,
          maxStudents: data.maxStudents || 0,
          currentStudentCount: data.currentStudentCount || 0,
          createdAt: data.createdAt?.toDate().toISOString(),
        });
      });

      return {
        success: true,
        count: admins.length,
        data: admins,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to fetch admins"
      );
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admin/updateAdmin",
  async (
    { adminId, name, email, phone, instituteName, maxStudents },
    { rejectWithValue }
  ) => {
    try {
      const adminRef = doc(db, "users", adminId);

      const updates = {
        name,
        email,
        phone,
        updatedAt: serverTimestamp(),
      };

      if (instituteName) {
        updates.instituteName = instituteName;
        updates.college = instituteName;
      }

      if (maxStudents !== undefined) {
        updates.maxStudents = maxStudents;
      }

      await updateDoc(adminRef, updates);
      const snap = await getDoc(adminRef);

      return {
        success: true,
        message: "Admin updated successfully",
        data: {
          id: snap.id,
          ...snap.data(),
        },
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to update admin"
      );
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admin/deleteAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const adminDoc = await getDoc(doc(db, "users", adminId));

      if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
        throw new Error("Admin not found");
      }

      await deleteDoc(doc(db, "users", adminId));

      return {
        success: true,
        message: "Admin deleted successfully",
        adminId,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || error || "Failed to delete admin"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admins: [],
    registrationRequests: [],
    loading: false,
    error: null,
    verifiedAdmin: null,
    verificationStatus: null,
  },
  reducers: {
    clearVerifiedAdmin: (state) => {
      state.verifiedAdmin = null;
      state.verificationStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins.push(action.payload.admin);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllAdmins.fulfilled, (state, action) => {
        state.admins = action.payload.data;
      })
      .addCase(verifyRegistrationCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegistrationCode.fulfilled, (state, action) => {
        state.loading = false;
        state.verifiedAdmin = action.payload.admin;
        state.verificationStatus = action.payload.status;
      })
      .addCase(verifyRegistrationCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.verifiedAdmin = null;
        state.verificationStatus = null;
      })
      .addCase(submitRegistrationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRegistrationRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.verifiedAdmin = action.payload.admin;
        state.verificationStatus = action.payload.status;
      })
      .addCase(submitRegistrationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRegistrationRequests.fulfilled, (state, action) => {
        state.registrationRequests = action.payload.data;
      })
      .addCase(approveRegistrationRequest.fulfilled, (state, action) => {
        const index = state.registrationRequests.findIndex(
          (r) => r.id === action.payload.requestId
        );
        if (index !== -1) {
          state.registrationRequests[index].status = "approved";
        }
      })
      .addCase(rejectRegistrationRequest.fulfilled, (state, action) => {
        const index = state.registrationRequests.findIndex(
          (r) => r.id === action.payload.requestId
        );
        if (index !== -1) {
          state.registrationRequests[index].status = "rejected";
        }
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        const index = state.admins.findIndex(
          (a) => a.id === action.payload.data.id
        );
        if (index !== -1) {
          state.admins[index] = action.payload.data;
        }
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter(
          (a) => a.id !== action.payload.adminId
        );
      });
  },
});

export const { clearVerifiedAdmin } = adminSlice.actions;
export default adminSlice.reducer;
