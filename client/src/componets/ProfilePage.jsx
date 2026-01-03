import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { updateProfile, clearMessage, clearError } from "../slices/authSlice";
import {
  ArrowLeft,
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  School,
  ShieldCheck,
  User,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  getActiveSubscription,
  getTimeRemaining,
  formatTimeRemaining,
} from "../../utils/subscriptionHelpers";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, message, error } = useSelector((state) => state.auth);
  const [planDetails, setPlanDetails] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    college: user?.college || "",
    address: user?.address || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "/default-avatar.png");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        college: user.college || "",
        address: user.address || "",
      });
      setPreview(user.avatar);

      if (user.createdBy) {
        const fetchAdminDetails = async () => {
          try {
            const adminDoc = await getDoc(doc(db, "users", user.createdBy));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              setAdminDetails({
                name: adminData.name,
                email: adminData.email,
                instituteName:
                  adminData.instituteName ||
                  adminData.college ||
                  adminData.name,
              });
            }
          } catch (error) {
            console.error("Error fetching admin details:", error);
          }
        };
        fetchAdminDetails();
      }
    }
  }, [user]);

  const activeSubscription = getActiveSubscription(user?.subscription);
  const timeRemaining = activeSubscription
    ? getTimeRemaining(activeSubscription)
    : null;
  const formattedTime = activeSubscription
    ? formatTimeRemaining(activeSubscription)
    : null;

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (activeSubscription?.plan) {
        try {
          const planDoc = await getDoc(
            doc(db, "subscriptionPlans", activeSubscription.plan)
          );
          if (planDoc.exists()) {
            setPlanDetails(planDoc.data());
          }
        } catch (error) {
          console.error("Error fetching plan details:", error);
        }
      } else {
        setPlanDetails(null);
      }
    };

    fetchPlanDetails();
  }, [activeSubscription]);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
    }
    if (error) {
      console.error("Error:", error);
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [message, error, dispatch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        college: formData.college,
        address: formData.address,
      };

      if (avatar) {
        updateData.avatar = avatar;
      }

      await dispatch(updateProfile(updateData)).unwrap();
      setAvatar(null);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-white relative overflow-hidden font-sans selection:bg-emerald-500/30">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {message && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-emerald-400/30 animate-slide-in">
          {message}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-red-400/30 animate-slide-in">
          {error}
        </div>
      )}

      <div className="relative z-10 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto mb-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
            >
              <div className="p-2 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 border border-gray-200 dark:border-white/5 group-hover:border-emerald-400 dark:group-hover:border-emerald-500/30 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium tracking-wide">Back to Home</span>
            </button>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 dark:from-white via-emerald-600 dark:via-emerald-200 to-emerald-600 dark:to-emerald-500 bg-clip-text text-transparent">
              User Profile
            </h1>
            <div className="w-24"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Left Profile Card */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-6 group/avatar">
                  <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-40 group-hover/avatar:opacity-75 transition-opacity duration-500"></div>
                  <img
                    src={preview}
                    alt="Avatar"
                    className="relative w-32 h-32 rounded-full border-2 border-gray-200 dark:border-black/50 object-cover shadow-2xl"
                  />
                  <label className="absolute bottom-1 right-1 bg-emerald-500 text-white p-2.5 rounded-full shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all cursor-pointer hover:scale-110 active:scale-95 border-4 border-white dark:border-[#0a0a0a]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    <Camera className="w-4 h-4" />
                  </label>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {user?.name || "Guest User"}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-sm border border-gray-200 dark:border-white/5">
                  <Mail className="w-3 h-3" />
                  <span>{user?.email || "No email provided"}</span>
                </div>

                {/* Institute Badge */}
                {adminDetails && (
                  <div className="mt-4 w-full p-3 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 rounded-lg">
                    <div className="flex items-center gap-2 justify-center text-cyan-700 dark:text-cyan-400 mb-1">
                      <Building2 size={14} />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Institute
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">
                      {adminDetails.instituteName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      Managed by: {adminDetails.name}
                    </p>
                  </div>
                )}

                {!adminDetails && user?.createdBy && (
                  <div className="mt-4 w-full p-3 bg-gray-100 dark:bg-gray-500/10 border border-gray-300 dark:border-gray-500/20 rounded-lg">
                    <div className="flex items-center gap-2 justify-center text-gray-600 dark:text-gray-400">
                      <Building2 size={14} />
                      <span className="text-xs">
                        Institute information unavailable
                      </span>
                    </div>
                  </div>
                )}

                {!user?.createdBy && (
                  <div className="mt-4 w-full p-3 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2 justify-center text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-medium">
                        Direct Registration
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-linear-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent my-8"></div>

              <div className="bg-gray-50 dark:bg-[#0a0a0a]/50 rounded-2xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full blur-xl"></div>

                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    Current Plan
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                      activeSubscription
                        ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500/20"
                    }`}
                  >
                    {planDetails?.name || "FREE TIER"}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  {activeSubscription && planDetails ? (
                    <>
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                        <span>Type</span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {planDetails.type || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                        <span>Time Left</span>
                        <span
                          className={`font-medium ${
                            timeRemaining?.isExpiringToday
                              ? "text-red-600 dark:text-red-400"
                              : timeRemaining?.isExpiringSoon
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formattedTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                        <span>Expires</span>
                        <span className="text-gray-900 dark:text-white font-medium text-xs">
                          {activeSubscription.endDate
                            ? new Date(
                                activeSubscription.endDate.seconds
                                  ? activeSubscription.endDate.seconds * 1000
                                  : activeSubscription.endDate
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2 text-gray-500 text-xs italic">
                      No active subscription found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-linear-to-br from-emerald-500 to-blue-600 rounded-lg shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Profile Details
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-600" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider ml-1">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider ml-1">
                      College / University
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <School className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="IIT"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider ml-1">
                    Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="123 Blockchain Ave, Web3 City"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-white/10 my-6"></div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 bg-linear-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
