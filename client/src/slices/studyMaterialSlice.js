import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { uploadToFirebase } from "../config/firebaseUpload";

const getAllowedCreatorIds = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const userRole = userData.role;

    if (userRole === "superadmin") {
      return null;
    }

    if (userRole === "admin") {
      return [userId];
    }

    if (userRole === "student") {
      if (userData.createdBy) {
        return [userData.createdBy];
      }
      return [];
    }

    return [];
  } catch (error) {
    console.error("Error getting allowed creator IDs:", error);
    return [];
  }
};

export const uploadStudyMaterial = createAsyncThunk(
  "studyMaterial/upload",
  async (
    { categoryId, categoryName, subject, subcategory, title, description, file, isDemo = false },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const firebaseResult = await uploadToFirebase(file, {
        folder: "study-materials",
        onProgress: (progress) => {
          dispatch(setUploadProgress(progress));
        },
      });

      if (!firebaseResult.success) {
        throw new Error("Failed to upload file to Firebase Storage");
      }

      const materialData = {
        categoryId,
        categoryName,
        subject: subject || null,
        subcategory: subcategory || null,
        title: title.trim(),
        description: description.trim(),
        fileUrl: firebaseResult.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        firebaseStoragePath: firebaseResult.publicId,
        cloudinaryFormat: firebaseResult.format ?? null,
        cloudinaryResourceType: firebaseResult.resourceType ?? null,
        isDemo,
        createdBy: userId,
        createdAt: serverTimestamp(),
        isActive: true,
      };

      const docRef = await addDoc(collection(db, "studyMaterials"), materialData);

      return {
        id: docRef.id,
        ...materialData,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Upload error:", error);
      return rejectWithValue(error.message);
    }
  }
);
export const getAllStudyMaterialsByCreator = createAsyncThunk(
  "studyMaterial/getAllByCreator",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) throw new Error("User data not found");

      const userData = userDoc.data();
      const userRole = userData.role;

      const materialsRef = collection(db, "studyMaterials");

      if (userRole === "superadmin") {
        const q = query(materialsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return [];

        const materials = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          materials.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          });
        });

        return materials;
      } else if (userRole === "admin") {
        const q = query(
          materialsRef,
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return [];

        const materials = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          materials.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          });
        });

        return materials;
      } else if (userRole === "student") {
        if (userData.createdBy) {
          const adminMaterialsQuery = query(
            materialsRef,
            where("createdBy", "==", userData.createdBy),
            orderBy("createdAt", "desc")
          );
          const demoMaterialsQuery = query(
            materialsRef,
            where("isDemo", "==", true),
            orderBy("createdAt", "desc")
          );

          const [adminSnapshot, demoSnapshot] = await Promise.all([
            getDocs(adminMaterialsQuery),
            getDocs(demoMaterialsQuery),
          ]);

          const materials = [];
          const seenIds = new Set();

          adminSnapshot.forEach((doc) => {
            const data = doc.data();
            seenIds.add(doc.id);
            materials.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
            });
          });

          demoSnapshot.forEach((doc) => {
            if (!seenIds.has(doc.id)) {
              const data = doc.data();
              materials.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
              });
            }
          });
          materials.sort((a, b) => {
            const dateA = a.createdAt || new Date(0);
            const dateB = b.createdAt || new Date(0);
            return dateB - dateA;
          });

          return materials;
        } else {
          const q = query(
            materialsRef,
            where("isDemo", "==", true),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) return [];

          const materials = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            materials.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
            });
          });

          return materials;
        }
      } else {
        const q = query(
          materialsRef,
          where("isDemo", "==", true),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return [];

        const materials = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          materials.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          });
        });

        return materials;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateStudyMaterial = createAsyncThunk(
  "studyMaterial/update",
  async ({ materialId, updates }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const materialRef = doc(db, "studyMaterials", materialId);
      const materialDoc = await getDoc(materialRef);

      if (!materialDoc.exists()) {
        throw new Error("Study material not found");
      }

      const userDoc = await getDoc(doc(db, "users", userId));
      const userRole = userDoc.data()?.role;
      const materialCreator = materialDoc.data().createdBy;

      if (userRole !== "superadmin" && materialCreator !== userId) {
        throw new Error("You don't have permission to update this material");
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(materialRef, updateData);

      return {
        materialId,
        updates: {
          ...updates,
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      console.error("Update error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStudyMaterial = createAsyncThunk(
  "studyMaterial/delete",
  async (materialId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const materialRef = doc(db, "studyMaterials", materialId);
      const materialDoc = await getDoc(materialRef);

      if (!materialDoc.exists()) {
        throw new Error("Study material not found");
      }

      const materialData = materialDoc.data();
      const userDoc = await getDoc(doc(db, "users", userId));
      const userRole = userDoc.data()?.role;

      if (userRole !== "superadmin" && materialData.createdBy !== userId) {
        throw new Error("You don't have permission to delete this material");
      }

      await deleteDoc(materialRef);

      return materialId;
    } catch (error) {
      console.error("Delete error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const studyMaterialSlice = createSlice({
  name: "studyMaterial",
  initialState: {
    materials: [],
    selectedMaterial: null,
    loading: false,
    uploadProgress: 0,
    error: null,
  },
  reducers: {
    clearSelectedMaterial: (state) => {
      state.selectedMaterial = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadStudyMaterial.pending, (state) => {
        state.loading = false;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadStudyMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        state.materials.unshift(action.payload);
      })
      .addCase(uploadStudyMaterial.rejected, (state, action) => {
        state.loading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });

    builder
      .addCase(getAllStudyMaterialsByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStudyMaterialsByCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(getAllStudyMaterialsByCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateStudyMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudyMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const { materialId, updates } = action.payload;
        state.materials = state.materials.map((material) =>
          material.id === materialId ? { ...material, ...updates } : material
        );
      })
      .addCase(updateStudyMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteStudyMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudyMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = state.materials.filter(
          (material) => material.id !== action.payload
        );
      })
      .addCase(deleteStudyMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedMaterial, clearError, setUploadProgress } =
  studyMaterialSlice.actions;
export default studyMaterialSlice.reducer;
