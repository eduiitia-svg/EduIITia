
import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
  forgotPassword as forgotPasswordAction,
  updateProfile as updateProfileAction,
  fetchCurrentUser,
  clearError,
  clearMessage,
} from "../slices/authSlice";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  
  const login = async (credentials) => {
    try {
      await dispatch(loginAction(credentials)).unwrap();
    } catch (err) {
      
      throw err;
    }
  };

  
  const signup = async (credentials) => {
    try {
      await dispatch(registerAction(credentials)).unwrap();
    } catch (err) {
      throw err;
    }
  };

  
  const logout = () => {
    dispatch(logoutAction());
  };

  
  const resetPassword = async (email) => {
    try {
      await dispatch(forgotPasswordAction({ email })).unwrap();
    } catch (err) {
      throw err;
    }
  };

  
  const updateProfile = async (formData) => {
    try {
      await dispatch(updateProfileAction(formData)).unwrap();
    } catch (err) {
      throw err;
    }
  };

  const value = {
    authUser: user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
  }
  return context;
};