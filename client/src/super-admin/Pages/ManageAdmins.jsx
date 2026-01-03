import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../Components/Table";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Plus,
  X,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  Key,
  Building2,
  Copy,
  Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  updateAdmin,
} from "../../slices/adminSlice";
import { formatDate } from "../../../utils/formatDate";
import { TableSkeleton } from "../../componets/skeleton/TableSkeleton";

const ManageAdmins = () => {
  const dispatch = useDispatch();
  const { admins, loading } = useSelector((state) => state.admin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instituteName: "",
    maxStudents: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAdmin, setDetailAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  console.log("details admin ", detailAdmin);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      await dispatch(getAllAdmins()).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch admins");
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Name and email are required");
    }

    try {
      setSubmitting(true);
      if (isEditing && selectedAdmin) {
        await dispatch(
          updateAdmin({
            adminId: selectedAdmin.id,
            ...formData,
          })
        ).unwrap();
        toast.success("Admin updated successfully!");
      } else {
        const res = await dispatch(createAdmin(formData)).unwrap();
        toast.success("Admin created successfully!");
      }
      closeModal();
    } catch (err) {
      console.error("admin creation error", err);
      toast.error(err || "Failed to save admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setIsEditing(true);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      instituteName: admin.instituteName || "",
      maxStudents: admin.maxStudents || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    try {
      await dispatch(deleteAdmin(id)).unwrap();
      toast.success("Admin removed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete admin");
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedAdmin(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      instituteName: "",
      maxStudents: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedAdmin(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      instituteName: "",
      maxStudents: "",
    });
  };

  const handleRowClick = (admin) => {
    setDetailAdmin(admin);
    setIsDetailModalOpen(true);
    setShowPassword(false);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailAdmin(null);
    setShowPassword(false);
  };

  const columns = [
    {
      key: "name",
      header: "Admin Identity",
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-xs">
            {a.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium block">{a.name}</span>
            {a.instituteName && (
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 size={10} /> {a.instituteName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (a) => (
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5">
            <Mail size={12} className="text-emerald-500" /> {a.email}
          </span>
        </div>
      ),
    },
    {
      key: "registrationCode",
      header: "Reg. Code",
      render: (a) => (
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono text-sm font-bold tracking-wider">
            {a.registrationCode || "N/A"}
          </span>
          {a.registrationCode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(a.registrationCode, "Registration code");
              }}
              className="p-1 hover:bg-emerald-500/10 rounded transition-colors"
              title="Copy code"
            >
              <Copy size={12} className="text-emerald-500" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "studentLimit",
      header: "Student Limit",
      render: (a) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {a.currentStudentCount || 0} / {a.maxStudents || 0}
          </span>
          {a.currentStudentCount >= a.maxStudents && a.maxStudents > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-[10px] text-rose-400">
              FULL
            </span>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (a) => (
        <span className="text-slate-400 text-xs flex items-center gap-1">
          {a.phone ? (
            <>
              <Phone size={10} /> {a.phone}
            </>
          ) : (
            "-"
          )}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (a) => (
        <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-emerald-400">
          {formatDate(a?.createdAt)}
        </span>
      ),
    },
  ];

  const rowActions = (a) => (
    <div className="flex items-center justify-end gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(a);
        }}
        className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit2 size={16} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(a.id);
        }}
        className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 size={16} />
      </motion.button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] rounded-2xl text-slate-200 p-6 md:p-12 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-linear-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/30">
                <ShieldCheck className="text-emerald-400 w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-slate-200 to-slate-400">
                Manage Admins
              </h1>
            </div>
            <p className="text-slate-500 text-sm pl-1">
              Control access levels and manage institute admins with
              registration codes.
            </p>
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="group flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 border border-emerald-400/20 transition-all"
          >
            <Plus
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Create New Admin</span>
          </motion.button>
        </div>

        {loading ? (
          <TableSkeleton
            columns={columns}
            renderRowActions={rowActions}
            rowCount={4}
          />
        ) : (
          <Table
            columns={columns}
            data={admins}
            renderRowActions={rowActions}
            isLoading={loading}
            onRowClick={handleRowClick}
          />
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl shadow-emerald-900/50 overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {isEditing ? "Edit Admin" : "Create New Admin"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isEditing
                        ? "Update admin information"
                        : "Grant system access to a new user"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <User size={14} className="text-emerald-500" /> Full
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-slate-600 transition-all"
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Building2 size={14} className="text-emerald-500" />{" "}
                        Institute Name
                      </label>
                      <input
                        type="text"
                        value={formData.instituteName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instituteName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-slate-600 transition-all"
                        placeholder="e.g. ABC Institute"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Mail size={14} className="text-emerald-500" /> Email
                        Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-slate-600 transition-all"
                        placeholder="admin@company.com"
                        required
                        disabled={isEditing}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Phone size={14} className="text-emerald-500" /> Phone
                        Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(
                            /[^\d\s+()-]/g,
                            ""
                          );
                          setFormData({ ...formData, phone: value });
                        }}
                        onKeyPress={(e) => {
                          const allowedChars = /[\d\s+()-]/;
                          if (!allowedChars.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength={20}
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-slate-600 transition-all"
                        placeholder="+91 1234567890"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <User size={14} className="text-emerald-500" /> Maximum
                        Students
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxStudents}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxStudents: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-slate-600 transition-all"
                        placeholder="e.g. 100"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Maximum number of students this admin can register
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-2 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />{" "}
                          Processing...
                        </>
                      ) : isEditing ? (
                        "Update Admin"
                      ) : (
                        "Create Access"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDetailModalOpen && detailAdmin && (
            <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 mt-14">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDetailModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl shadow-emerald-900/50 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-5 border-b border-white/10 bg-linear-to-r from-emerald-500/10 to-cyan-500/10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-xl shadow-lg">
                        {detailAdmin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {detailAdmin.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-medium">
                            {detailAdmin.role || "admin"}
                          </span>
                          {detailAdmin.instituteName && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Building2 size={12} />{" "}
                              {detailAdmin.instituteName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeDetailModal}
                      className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                  <div className="space-y-6">
                    {detailAdmin.registrationCode && (
                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Student Registration Onboarding
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                            <Key
                              size={20}
                              className="text-emerald-400 mt-0.5 shrink-0"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 mb-1">
                                Registration Code
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-emerald-400 font-mono text-xl font-bold tracking-widest">
                                  {detailAdmin.registrationCode}
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      detailAdmin.registrationCode,
                                      "Registration code"
                                    )
                                  }
                                  className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-400"
                                  title="Copy code"
                                >
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                            <Link2
                              size={20}
                              className="text-cyan-400 mt-0.5 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 mb-1">
                                Direct Registration Link
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-cyan-400 text-xs font-mono truncate flex-1 opacity-80">
                                  {`${window.location.origin}?code=${detailAdmin.registrationCode}&openSignup=true`}
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      `${window.location.origin}?code=${detailAdmin.registrationCode}&openSignup=true`,
                                      "Registration link"
                                    )
                                  }
                                  className="p-1.5 hover:bg-cyan-500/10 rounded-lg transition-colors text-cyan-400 shrink-0"
                                  title="Copy link"
                                >
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                      <div className="space-y-6">
   
                        {detailAdmin.instituteName && (
                          <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                              Institute Details
                            </h3>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                              <Building2
                                size={18}
                                className="text-cyan-400 shrink-0"
                              />
                              <div>
                                <p className="text-xs text-slate-400">
                                  Institute Name
                                </p>
                                <p className="text-white text-sm font-medium">
                                  {detailAdmin.instituteName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Student Management
                          </h3>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <User
                              size={18}
                              className="text-cyan-400 shrink-0"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-slate-400">
                                Student Capacity
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-white text-sm font-medium">
                                  {detailAdmin.currentStudentCount || 0} /{" "}
                                  {detailAdmin.maxStudents || 0} students
                                </p>
                                {detailAdmin.currentStudentCount >=
                                  detailAdmin.maxStudents &&
                                  detailAdmin.maxStudents > 0 && (
                                    <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded-full text-[10px] text-rose-400">
                                      CAPACITY REACHED
                                    </span>
                                  )}
                              </div>
                              {detailAdmin.maxStudents > 0 && (
                                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                                  <div
                                    className="bg-linear-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(
                                        (detailAdmin.currentStudentCount /
                                          detailAdmin.maxStudents) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            System Metadata
                          </h3>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Calendar
                              size={18}
                              className="text-emerald-500 shrink-0"
                            />
                            <div>
                              <p className="text-xs text-slate-400">
                                Account Created
                              </p>
                              <p className="text-white text-sm font-medium">
                                {formatDate(detailAdmin.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                              <Mail
                                size={18}
                                className="text-emerald-500 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs text-slate-400">
                                  Email Address
                                </p>
                                <p className="text-white text-sm font-medium break-all">
                                  {detailAdmin.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                              <Phone
                                size={18}
                                className="text-emerald-500 shrink-0"
                              />
                              <div>
                                <p className="text-xs text-slate-400">
                                  Phone Number
                                </p>
                                <p className="text-white text-sm font-medium">
                                  {detailAdmin.phone || "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Credentials
                          </h3>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Key
                              size={18}
                              className="text-emerald-500 shrink-0"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 mb-0.5">
                                Temporary Password
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-white font-mono text-sm">
                                  {showPassword
                                    ? detailAdmin.password ||
                                      detailAdmin.temp_password ||
                                      "N/A"
                                    : "••••••••"}
                                </p>
                                <button
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                                >
                                  {showPassword ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      handleEdit(detailAdmin);
                    }}
                    className="px-4 py-2 bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                  >
                    <Edit2 size={14} />
                    Edit Admin
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageAdmins;
