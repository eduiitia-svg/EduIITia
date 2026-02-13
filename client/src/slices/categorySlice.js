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

const getAllowedExamTypesAndSubjects = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return { examTypes: null, subjects: null };

    const userData = userDoc.data();
    const userRole = userData.role;

    if (userRole === "superadmin") {
      return { examTypes: null, subjects: null };
    }

    if (userRole === "admin" && userData.teacherSubscription) {
      const subscription = userData.teacherSubscription;
      if (subscription.isActive) {
        return {
          examTypes: subscription.examType ? [subscription.examType] : null,
          subjects: subscription.subject ? [subscription.subject] : null,
        };
      }
    }

    return { examTypes: null, subjects: null };
  } catch (error) {
    console.error("Error fetching allowed permissions:", error);
    return { examTypes: null, subjects: null };
  }
};

export const getAllCategories = createAsyncThunk(
  "category/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) throw new Error("User data not found");
      const userData = userDoc.data();
      const userRole = userData.role;
      const categoriesRef = collection(db, "categories");
      let q;
      if (userRole === "superadmin") {
        q = query(categoriesRef, orderBy("createdAt", "desc"));
      } else if (userRole === "admin") {
        q = query(
          categoriesRef,
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc"),
        );
      } else if (userRole === "student") {
        if (userData.createdBy) {
          q = query(
            categoriesRef,
            where("createdBy", "==", userData.createdBy),
            orderBy("createdAt", "desc"),
          );
        } else {
          q = query(categoriesRef, orderBy("createdAt", "desc"));
        }
      } else {
        q = query(categoriesRef, orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return [];
      }
      const categories = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        });
      });
      return categories;
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      return rejectWithValue(error.message);
    }
  },
);
export const getCategoriesByCreator = createAsyncThunk(
  "category/getCategoriesByCreator",
  async (creatorId = null, { rejectWithValue }) => {
    try {
      const userId = creatorId || auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
      const categoriesRef = collection(db, "categories");
      const q = query(
        categoriesRef,
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return [];
      }
      const categories = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        });
      });
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async ({ name, type, subjects, icon, mainCategory }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();
      const userRole = userData.role;

      let finalMainCategory = mainCategory; 
      let allowedExamType = null;

      if (userRole === "admin" && userData.teacherSubscription) {
        const subscription = userData.teacherSubscription;
        
        if (subscription.mainCategory && subscription.mainCategory !== "All") {
          finalMainCategory = subscription.mainCategory;
        }
        
        allowedExamType = subscription.examType || null;

        if (
          subscription.isActive &&
          allowedExamType &&
          allowedExamType !== "All"
        ) {
          if (type !== allowedExamType) {
            throw new Error(
              `Your subscription only allows creating categories for "${allowedExamType}" exam type. Please upgrade or choose a different plan.`,
            );
          }
        }
      }

      const { examTypes: allowedTypes, subjects: allowedSubjects } =
        await getAllowedExamTypesAndSubjects(userId);

      if (allowedTypes !== null && !allowedTypes.includes(type)) {
        throw new Error(
          `You don't have permission to create categories for "${type}" exam type. Your subscription only allows: ${allowedTypes.join(", ")}`,
        );
      }

      if (allowedSubjects !== null) {
        const invalidSubjects = subjects
          .map((s) => (typeof s === "string" ? s : s.name))
          .filter((subjectName) => !allowedSubjects.includes(subjectName));

        if (invalidSubjects.length > 0) {
          throw new Error(
            `You don't have permission to add subjects: ${invalidSubjects.join(", ")}. Your subscription only allows: ${allowedSubjects.join(", ")}`,
          );
        }
      }

      const validatedSubjects = subjects.map((subj) => {
        if (typeof subj === "string") {
          return { name: subj, subcategories: [] };
        }
        return {
          name: subj.name,
          subcategories: subj.subcategories || [],
        };
      });

      const categoryData = {
        name: name.trim(),
        type, // This is the examType (e.g., "CBSE Board")
        subjects: validatedSubjects,
        icon: icon || "BookOpen",
        createdBy: userId,
        createdAt: serverTimestamp(),
        isActive: true,
        mainCategory: finalMainCategory, // ← This must match the subscription's mainCategory
      };

      const docRef = await addDoc(collection(db, "categories"), categoryData);

      return {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ categoryId, updates }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const categoryRef = doc(db, "categories", categoryId);
      const categoryDoc = await getDoc(categoryRef);

      if (!categoryDoc.exists()) {
        throw new Error("Category not found");
      }

      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();
      const userRole = userData?.role;
      const categoryCreator = categoryDoc.data().createdBy;

      if (userRole !== "superadmin" && categoryCreator !== userId) {
        throw new Error("You don't have permission to update this category");
      }

      const { examTypes: allowedTypes, subjects: allowedSubjects } =
        await getAllowedExamTypesAndSubjects(userId);

      if (
        updates.type &&
        allowedTypes !== null &&
        !allowedTypes.includes(updates.type)
      ) {
        throw new Error(
          `You don't have permission to change category type to "${updates.type}". Your subscription only allows: ${allowedTypes.join(", ")}`,
        );
      }

      if (updates.subjects && allowedSubjects !== null) {
        const invalidSubjects = updates.subjects
          .map((s) => (typeof s === "string" ? s : s.name))
          .filter(
            (subjectName) =>
              subjectName.trim() !== "" &&
              !allowedSubjects.includes(subjectName),
          );

        if (invalidSubjects.length > 0) {
          throw new Error(
            `You don't have permission to add subjects: ${invalidSubjects.join(", ")}. Your subscription only allows: ${allowedSubjects.join(", ")}`,
          );
        }
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (
        userData?.role === "admin" &&
        userData?.teacherSubscription?.mainCategory
      ) {
        updateData.mainCategory = userData.teacherSubscription.mainCategory;
      }

      if (updates.subjects) {
        updateData.subjects = updates.subjects.map((subj) => {
          if (typeof subj === "string") {
            return { name: subj, subcategories: [] };
          }
          return {
            name: subj.name,
            subcategories: subj.subcategories || [],
          };
        });
      }

      await updateDoc(categoryRef, updateData);

      return {
        categoryId,
        updates: {
          ...updates,
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
      const categoryRef = doc(db, "categories", categoryId);
      const categoryDoc = await getDoc(categoryRef);
      if (!categoryDoc.exists()) {
        throw new Error("Category not found");
      }
      const userDoc = await getDoc(doc(db, "users", userId));
      const userRole = userDoc.data()?.role;
      const categoryCreator = categoryDoc.data().createdBy;
      if (userRole !== "superadmin" && categoryCreator !== userId) {
        throw new Error("You don't have permission to delete this category");
      }
      const questionsRef = collection(db, "questions");
      let q;
      if (userRole === "superadmin") {
        q = query(questionsRef);
      } else {
        q = query(questionsRef, where("createdBy", "==", userId));
      }
      const querySnapshot = await getDocs(q);
      let testsUsingCategory = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.categoryId === categoryId ||
          data.categoryName === categoryDoc.data().name
        ) {
          testsUsingCategory++;
        }
      });
      if (testsUsingCategory > 0) {
        throw new Error(
          `Cannot delete category. ${testsUsingCategory} test(s) are using this category. Please reassign or delete those tests first.`,
        );
      }
      await deleteDoc(categoryRef);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const getCategoryById = createAsyncThunk(
  "category/getCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const categoryRef = doc(db, "categories", categoryId);
      const categoryDoc = await getDoc(categoryRef);
      if (!categoryDoc.exists()) {
        throw new Error("Category not found");
      }
      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCategoriesByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoriesByCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategoriesByCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, updates } = action.payload;
        state.categories = state.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, ...updates } : cat,
        );
        if (state.selectedCategory?.id === categoryId) {
          state.selectedCategory = { ...state.selectedCategory, ...updates };
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload,
        );
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.selectedCategory = action.payload;
      });
  },
});
export const { clearSelectedCategory, clearError } = categorySlice.actions;
export default categorySlice.reducer;
