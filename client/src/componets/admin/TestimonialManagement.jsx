import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import toast from "react-hot-toast";
import { Pencil, PlusCircle } from "lucide-react";

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    text: "",
    image: "",
    rating: 4.85,
  });

  const averageRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => {
            const rating = Number(t.rating);
            return sum + (Number.isFinite(rating) ? rating : 0);
          }, 0) / testimonials.length
        ).toFixed(2)
      : "0.00";

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "testimonials"));
      const testimonialsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTestimonial = async () => {
    if (!formData.name || !formData.role || !formData.text) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const newTestimonial = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "testimonials"), newTestimonial);
      toast.success("Testimonial added successfully!");

      setShowModal(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error("Error adding testimonial:", error);
      toast.error("Failed to add testimonial");
    }
  };

  const handleUpdateTestimonial = async () => {
    if (!formData.name || !formData.role || !formData.text) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const testimonialRef = doc(db, "testimonials", currentTestimonial.id);
      await updateDoc(testimonialRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      toast.success("Testimonial updated successfully!");
      setShowModal(false);
      setEditMode(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Failed to update testimonial");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "testimonials", id));
      toast.success("Testimonial deleted successfully!");
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const handleEditClick = (testimonial) => {
    setCurrentTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      image: testimonial.image || "",
      rating: testimonial.rating || 4.85,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      text: "",
      image: "",
      rating: 4.85,
    });
    setCurrentTestimonial(null);
    setEditMode(false);
  };

  const handleSubmit = () => {
    if (editMode) {
      handleUpdateTestimonial();
    } else {
      handleAddTestimonial();
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1 text-yellow-500">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) return <span key={i}>★</span>;
          if (i === fullStars && halfStar) return <span key={i}>☆</span>;
          return (
            <span key={i} className="text-gray-300">
              ★
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-black p-8 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r py-3 from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
            Testimonials Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student testimonials and reviews
          </p>
        </div>

        <motion.button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-linear-to-r cursor-pointer from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg mb-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add Testimonial
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              Total Testimonials
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {testimonials.length}
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              Average Rating
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              <span className="text-yellow-400">★</span> {averageRating}
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              Active Reviews
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {testimonials.length}
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="flex flex-col h-full bg-white dark:bg-black/40 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md dark:hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={
                        testimonial.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          testimonial.name
                        )}&background=10b981&color=fff`
                      }
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(Number(testimonial.rating))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Number(testimonial.rating).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-5">
                    {testimonial.text}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    onClick={() => handleEditClick(testimonial)}
                    className="flex-1 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm font-semibold cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Edit
                  </motion.button>

                  <motion.button
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
                    className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm font-semibold cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editMode ? (
                  <div className="flex items-center gap-4">
                    <div className="bg-linear-to-r from-emerald-400 to-teal-500 p-2 rounded-md">
                      <Pencil className="w-6 h-6 text-white " />
                    </div>
                    <span className="text-black dark:text-white">
                      Edit Testimonial
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="bg-linear-to-r from-emerald-400 to-teal-500 p-2 rounded-md">
                      <PlusCircle className="w-6 h-6 text-white " />
                    </div>
                    <span className="text-black dark:text-white">
                      {" "}
                      Add New Testimonial
                    </span>
                  </div>
                )}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Student name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g., Computer Science Student"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Testimonial Text *
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Write the testimonial..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Leave empty to use auto-generated avatar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white rounded-xl cursor-pointer font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 cursor-pointer hover:to-teal-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editMode ? "Update" : "Add"} Testimonial
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestimonialManagement;
